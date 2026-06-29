import {
  collection,
  doc,
  FieldPath,
  getDoc,
  increment,
  limit,
  limitToLast,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { firestore, firebaseStorage } from './firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { sendDirectMessagePush } from './notificationService';
import type {
  DirectMessage,
  MessageKind,
  MessageParticipant,
  MessageThread,
  SendMessageResult,
} from '../types/social';

const THREADS_COLLECTION = 'threads';
const MESSAGES_COLLECTION = 'messages';
const USERS_COLLECTION = 'users';
const THREAD_LIMIT = 50;
const MESSAGE_LIMIT = 50;

type SendMessageInput = {
  senderId: string;
  recipientId: string;
  text: string;
  kind: MessageKind;
  imageUrl: string | null;
  storyId: string | null;
  storyImageUrl: string | null;
};

function getRequiredString(
  data: Record<string, unknown>,
  key: string,
  path: string,
): string {
  const value = data[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Field ${key} tidak valid pada ${path}.`);
  }

  return value.trim();
}

function getOptionalString(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function getNumber(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function timestampToISO(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return new Date().toISOString();
}

export function getDirectMessageThreadId(
  firstUserId: string,
  secondUserId: string,
): string {
  return [firstUserId, secondUserId].sort().join('__');
}

async function getParticipant(userId: string): Promise<MessageParticipant> {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error(`Profil user ${userId} tidak ditemukan.`);
  }

  const data = snapshot.data() as Record<string, unknown>;

  return {
    id: userId,
    displayName: getRequiredString(data, 'displayName', userRef.path),
    username: getRequiredString(data, 'username', userRef.path),
    avatarUrl: getOptionalString(data, 'avatarUrl'),
  };
}

function getParticipantFromThread(
  data: Record<string, unknown>,
  userId: string,
  path: string,
): MessageParticipant {
  const rawProfiles = data.participantProfiles;

  if (!rawProfiles || typeof rawProfiles !== 'object') {
    throw new Error(`participantProfiles tidak valid pada ${path}.`);
  }

  const rawProfile = (rawProfiles as Record<string, unknown>)[userId];

  if (!rawProfile || typeof rawProfile !== 'object') {
    throw new Error(`Profil participant ${userId} tidak ditemukan pada ${path}.`);
  }

  const profile = rawProfile as Record<string, unknown>;

  return {
    id: userId,
    displayName: getRequiredString(profile, 'displayName', path),
    username: getRequiredString(profile, 'username', path),
    avatarUrl: getOptionalString(profile, 'avatarUrl'),
  };
}

function threadDocumentToModel(
  snapshot:
    | QueryDocumentSnapshot<DocumentData>
    | DocumentSnapshot<DocumentData>,
  currentUserId: string,
): MessageThread {
  const data = snapshot.data() as Record<string, unknown>;
  const participantIds = Array.isArray(data.participantIds)
    ? data.participantIds.filter(
        (participantId): participantId is string =>
          typeof participantId === 'string',
      )
    : [];
  const otherUserId = participantIds.find(
    (participantId) => participantId !== currentUserId,
  );

  if (!otherUserId) {
    throw new Error(`Participant lawan tidak ditemukan pada ${snapshot.ref.path}.`);
  }

  const unreadCounts =
    data.unreadCounts && typeof data.unreadCounts === 'object'
      ? (data.unreadCounts as Record<string, unknown>)
      : {};

  return {
    id: snapshot.id,
    participantIds,
    otherUser: getParticipantFromThread(
      data,
      otherUserId,
      snapshot.ref.path,
    ),
    lastMessage: getRequiredString(data, 'lastMessage', snapshot.ref.path),
    lastMessageAt: timestampToISO(data.lastMessageAt),
    lastSenderId: getRequiredString(
      data,
      'lastSenderId',
      snapshot.ref.path,
    ),
    unreadCount: getNumber(unreadCounts, currentUserId),
  };
}

function messageDocumentToModel(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): DirectMessage {
  const data = snapshot.data() as Record<string, unknown>;
  const rawKind = getRequiredString(data, 'kind', snapshot.ref.path);

  if (rawKind !== 'text' && rawKind !== 'story_reply' && rawKind !== 'image') {
    throw new Error(`Jenis pesan ${rawKind} tidak didukung.`);
  }

  return {
    id: snapshot.id,
    senderId: getRequiredString(data, 'senderId', snapshot.ref.path),
    recipientId: getRequiredString(data, 'recipientId', snapshot.ref.path),
    kind: rawKind,
    text: rawKind === 'image'
      ? getOptionalString(data, 'text') ?? ''
      : getRequiredString(data, 'text', snapshot.ref.path),
    imageUrl: getOptionalString(data, 'imageUrl'),
    storyId: getOptionalString(data, 'storyId'),
    storyImageUrl: getOptionalString(data, 'storyImageUrl'),
    createdAt: timestampToISO(data.createdAt),
  };
}

async function getRecipientPushToken(
  recipientId: string,
): Promise<string | null> {
  const snapshot = await getDoc(
    doc(firestore, USERS_COLLECTION, recipientId),
  );

  if (!snapshot.exists()) {
    throw new Error(`Profil penerima ${recipientId} tidak ditemukan.`);
  }

  const data = snapshot.data() as Record<string, unknown>;

  if (data.pushNotificationsEnabled !== true) {
    return null;
  }

  return getOptionalString(data, 'expoPushToken');
}

async function sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
  if (input.kind !== 'image' && !input.text.trim()) {
    throw new Error('Pesan tidak boleh kosong.');
  }

  const cleanText = input.text.trim();

  if (input.senderId === input.recipientId) {
    throw new Error('Tidak dapat mengirim pesan kepada akun sendiri.');
  }

  const [sender, recipient] = await Promise.all([
    getParticipant(input.senderId),
    getParticipant(input.recipientId),
  ]);
  const threadId = getDirectMessageThreadId(
    input.senderId,
    input.recipientId,
  );
  const threadRef = doc(firestore, THREADS_COLLECTION, threadId);
  const messageRef = doc(collection(threadRef, MESSAGES_COLLECTION));
  const lastMessage =
    input.kind === 'story_reply'
      ? `Membalas story: ${cleanText}`
      : input.kind === 'image'
        ? '📷 Foto'
        : cleanText;
  const batch = writeBatch(firestore);

  batch.set(messageRef, {
    senderId: input.senderId,
    recipientId: input.recipientId,
    kind: input.kind,
    text: cleanText,
    imageUrl: input.imageUrl,
    storyId: input.storyId,
    storyImageUrl: input.storyImageUrl,
    createdAt: serverTimestamp(),
  });
  batch.set(
    threadRef,
    {
      participantIds: [input.senderId, input.recipientId],
      participantProfiles: {
        [sender.id]: sender,
        [recipient.id]: recipient,
      },
      lastMessage,
      lastMessageAt: serverTimestamp(),
      lastSenderId: input.senderId,
      unreadCounts: {
        [input.senderId]: increment(0),
        [input.recipientId]: increment(1),
      },
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  await batch.commit();

  try {
    const pushToken = await getRecipientPushToken(input.recipientId);

    if (!pushToken) {
      return {
        messageId: messageRef.id,
        threadId,
        pushDelivery: 'not_registered',
      };
    }

    await sendDirectMessagePush({
      expoPushToken: pushToken,
      senderName: sender.displayName,
      messagePreview:
        input.kind === 'story_reply'
          ? `Membalas story Anda: ${cleanText}`
          : cleanText,
      threadId,
    });

    return {
      messageId: messageRef.id,
      threadId,
      pushDelivery: 'sent',
    };
  } catch (error) {
    console.warn('[messages] push delivery failed', {
      messageId: messageRef.id,
      threadId,
      recipientId: input.recipientId,
      error,
    });

    return {
      messageId: messageRef.id,
      threadId,
      pushDelivery: 'failed',
    };
  }
}

export async function sendStoryReplyMessage(input: {
  storyId: string;
  storyImageUrl: string | null;
  senderId: string;
  recipientId: string;
  text: string;
}): Promise<SendMessageResult> {
  return sendMessage({
    senderId: input.senderId,
    recipientId: input.recipientId,
    text: input.text,
    kind: 'story_reply',
    imageUrl: null,
    storyId: input.storyId,
    storyImageUrl: input.storyImageUrl,
  });
}

export async function sendTextMessage(input: {
  senderId: string;
  recipientId: string;
  text: string;
}): Promise<SendMessageResult> {
  return sendMessage({
    senderId: input.senderId,
    recipientId: input.recipientId,
    text: input.text,
    kind: 'text',
    imageUrl: null,
    storyId: null,
    storyImageUrl: null,
  });
}

export async function uploadMessageImage(
  uri: string,
  senderId: string,
): Promise<string> {
  const filename = `messages/${senderId}/${Date.now()}.jpg`;
  const storageRef = ref(firebaseStorage, filename);

  const blob = await new Promise<Blob>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });

  const uploadTask = uploadBytesResumable(storageRef, blob);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => reject(error),
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl);
      },
    );
  });
}

export async function sendImageMessage(input: {
  senderId: string;
  recipientId: string;
  imageUri: string;
  caption?: string;
}): Promise<SendMessageResult> {
  const imageUrl = await uploadMessageImage(input.imageUri, input.senderId);

  return sendMessage({
    senderId: input.senderId,
    recipientId: input.recipientId,
    text: input.caption?.trim() ?? '',
    kind: 'image',
    imageUrl,
    storyId: null,
    storyImageUrl: null,
  });
}

export function subscribeMessageThreads(
  currentUserId: string,
  onData: (threads: MessageThread[]) => void,
  onError: (error: Error) => void,
): () => void {
  const threadsQuery = query(
    collection(firestore, THREADS_COLLECTION),
    where('participantIds', 'array-contains', currentUserId),
    limit(THREAD_LIMIT),
  );

  return onSnapshot(
    threadsQuery,
    (snapshot) => {
      try {
        const threads = snapshot.docs
          .map((thread) => threadDocumentToModel(thread, currentUserId))
          .sort(
            (first, second) =>
              new Date(second.lastMessageAt).getTime() -
              new Date(first.lastMessageAt).getTime(),
          );
        onData(threads);
      } catch (error) {
        onError(
          error instanceof Error
            ? error
            : new Error('Data percakapan tidak valid.'),
        );
      }
    },
    (error) => {
      onError(
        new Error(
          `Gagal memantau percakapan user ${currentUserId}: ${error.message}`,
        ),
      );
    },
  );
}

export function subscribeMessages(
  threadId: string,
  onData: (messages: DirectMessage[]) => void,
  onError: (error: Error) => void,
): () => void {
  const messagesQuery = query(
    collection(
      firestore,
      THREADS_COLLECTION,
      threadId,
      MESSAGES_COLLECTION,
    ),
    orderBy('createdAt', 'asc'),
    limitToLast(MESSAGE_LIMIT),
  );

  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      try {
        onData(snapshot.docs.map(messageDocumentToModel));
      } catch (error) {
        onError(
          error instanceof Error
            ? error
            : new Error('Data pesan tidak valid.'),
        );
      }
    },
    (error) => {
      onError(
        new Error(`Gagal memantau pesan thread ${threadId}: ${error.message}`),
      );
    },
  );
}

export async function getMessageThread(
  threadId: string,
  currentUserId: string,
): Promise<MessageThread> {
  const snapshot = await getDoc(
    doc(firestore, THREADS_COLLECTION, threadId),
  );

  if (!snapshot.exists()) {
    throw new Error(`Percakapan ${threadId} tidak ditemukan.`);
  }

  const participantIds = snapshot.get('participantIds') as unknown;

  if (
    !Array.isArray(participantIds)
    || !participantIds.includes(currentUserId)
  ) {
    throw new Error(
      `User ${currentUserId} bukan participant percakapan ${threadId}.`,
    );
  }

  return threadDocumentToModel(
    snapshot,
    currentUserId,
  );
}

export async function markThreadRead(
  threadId: string,
  userId: string,
): Promise<void> {
  await updateDoc(
    doc(firestore, THREADS_COLLECTION, threadId),
    new FieldPath('unreadCounts', userId),
    0,
  );
}
