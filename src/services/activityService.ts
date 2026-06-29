import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { firestore } from './firebase';
import type {
  ActivityNotification,
  ActivityNotificationType,
} from '../types/social';

const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';
const NOTIFICATION_LIMIT = 50;

type CreateActivityInput = {
  recipientId: string;
  actorId: string;
  type: ActivityNotificationType;
  entityId: string | null;
  preview: string | null;
};

function getRequiredString(
  data: Record<string, unknown>,
  key: string,
  documentPath: string,
): string {
  const value = data[key];

  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`Field ${key} tidak valid pada ${documentPath}.`);
  }

  return value.trim();
}

function getOptionalString(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function timestampToISO(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return new Date().toISOString();
}

function notificationPath(userId: string): string {
  return `${USERS_COLLECTION}/${userId}/${NOTIFICATIONS_COLLECTION}`;
}

function documentToActivity(
  snapshot: QueryDocumentSnapshot<DocumentData>,
): ActivityNotification {
  const data = snapshot.data() as Record<string, unknown>;
  const path = `${notificationPath(snapshot.ref.parent.parent?.id ?? 'unknown')}/${snapshot.id}`;
  const type = getRequiredString(data, 'type', path);

  if (!['follow', 'like', 'comment', 'story_reply'].includes(type)) {
    throw new Error(`Tipe notifikasi ${type} tidak didukung pada ${path}.`);
  }

  return {
    id: snapshot.id,
    type: type as ActivityNotificationType,
    actorId: getRequiredString(data, 'actorId', path),
    actorName: getRequiredString(data, 'actorName', path),
    actorAvatarUrl: getOptionalString(data, 'actorAvatarUrl'),
    entityId: getOptionalString(data, 'entityId'),
    preview: getOptionalString(data, 'preview'),
    read: data.read === true,
    createdAt: timestampToISO(data.createdAt),
  };
}

async function getActorSnapshot(actorId: string): Promise<{
  actorName: string;
  actorAvatarUrl: string | null;
}> {
  const actorRef = doc(firestore, USERS_COLLECTION, actorId);
  const actorSnapshot = await getDoc(actorRef);

  if (!actorSnapshot.exists()) {
    throw new Error(`Profil aktor tidak ditemukan untuk user ${actorId}.`);
  }

  const data = actorSnapshot.data() as Record<string, unknown>;

  return {
    actorName: getRequiredString(data, 'displayName', actorRef.path),
    actorAvatarUrl: getOptionalString(data, 'avatarUrl'),
  };
}

export async function createActivityNotification(
  input: CreateActivityInput,
): Promise<string | null> {
  if (input.recipientId === input.actorId) {
    return null;
  }

  const actor = await getActorSnapshot(input.actorId);
  const notificationRef = await addDoc(
    collection(
      firestore,
      USERS_COLLECTION,
      input.recipientId,
      NOTIFICATIONS_COLLECTION,
    ),
    {
      type: input.type,
      actorId: input.actorId,
      actorName: actor.actorName,
      actorAvatarUrl: actor.actorAvatarUrl,
      entityId: input.entityId,
      preview: input.preview?.trim().slice(0, 120) || null,
      read: false,
      createdAt: serverTimestamp(),
    },
  );

  return notificationRef.id;
}

export function subscribeActivityNotifications(
  userId: string,
  onData: (activities: ActivityNotification[]) => void,
  onError: (error: Error) => void,
): () => void {
  const notificationsQuery = query(
    collection(firestore, USERS_COLLECTION, userId, NOTIFICATIONS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(NOTIFICATION_LIMIT),
  );

  return onSnapshot(
    notificationsQuery,
    (snapshot) => {
      try {
        onData(
          snapshot.docs
            .map(documentToActivity)
            .filter((activity) => activity.type !== 'story_reply'),
        );
      } catch (error) {
        onError(
          error instanceof Error
            ? error
            : new Error('Data aktivitas notifikasi tidak valid.'),
        );
      }
    },
    (error) => {
      onError(
        new Error(
          `Gagal memantau notifikasi user ${userId}: ${error.message}`,
        ),
      );
    },
  );
}

export async function markActivityNotificationsRead(
  userId: string,
  notificationIds: string[],
): Promise<void> {
  if (notificationIds.length === 0) {
    return;
  }

  const batch = writeBatch(firestore);

  notificationIds.forEach((notificationId) => {
    batch.update(
      doc(
        firestore,
        USERS_COLLECTION,
        userId,
        NOTIFICATIONS_COLLECTION,
        notificationId,
      ),
      { read: true },
    );
  });

  await batch.commit();
}
