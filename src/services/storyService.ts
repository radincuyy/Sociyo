import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { firestore, firebaseStorage } from './firebase';
import type { Story, StoryGroup, StoryDoc } from '../types/social';

const STORIES_COLLECTION = 'stories';
const USERS_COLLECTION = 'users';

function getStringField(data: Record<string, unknown>, key: string, fallback = '') {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

function timestampToISO(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

async function getAuthorInfo(authorId: string) {
  try {
    const userSnap = await getDoc(doc(firestore, USERS_COLLECTION, authorId));
    const data = (userSnap.data() ?? {}) as Record<string, unknown>;

    return {
      author: getStringField(data, 'displayName', 'Pengguna'),
      avatarUrl: getStringField(data, 'avatarUrl') || null,
    };
  } catch {
    return { author: 'Pengguna', avatarUrl: null };
  }
}

// Upload story image to Firebase Storage
export async function uploadStoryImage(uri: string, authorId: string): Promise<string> {
  const filename = `stories/${authorId}/${Date.now()}.jpg`;
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

// Create story
export async function createStory(authorId: string, imageUri: string, caption = ''): Promise<string> {
  const imageUrl = await uploadStoryImage(imageUri, authorId);

  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const storyRef = await addDoc(collection(firestore, STORIES_COLLECTION), {
    authorId,
    imageUrl,
    caption: caption.trim(),
    createdAt: serverTimestamp(),
    expiresAt,
    viewedBy: [],
  } as StoryDoc);

  return storyRef.id;
}

// Convert document to Story for UI
async function docToStory(snapshot: QueryDocumentSnapshot | DocumentSnapshot, currentUserId?: string): Promise<Story> {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const authorId = getStringField(data, 'authorId') || '';
  const authorInfo = await getAuthorInfo(authorId);

  const viewedBy = Array.isArray(data.viewedBy) ? (data.viewedBy as unknown[]).filter((v) => typeof v === 'string') as string[] : [];

  return {
    id: snapshot.id,
    author: authorInfo.author,
    avatarUrl: authorInfo.avatarUrl || null,
    imageUrl: getStringField(data, 'imageUrl') || null,
    viewed: currentUserId ? viewedBy.includes(currentUserId) : false,
  };
}

// Get active story groups
export async function getStoryGroups(currentUserId?: string): Promise<StoryGroup[]> {
  const now = new Date();
  // Query only with a single range filter on expiresAt to avoid requiring a composite index.
  // Sorting will be performed client-side after fetching documents.
  const q = query(collection(firestore, STORIES_COLLECTION), where('expiresAt', '>', now));

  const snapshot = await getDocs(q);

  // Group by authorId
  const groupsMap = new Map<string, QueryDocumentSnapshot[]>();

  for (const docSnap of snapshot.docs) {
    const data = (docSnap.data() ?? {}) as Record<string, unknown>;
    const authorId = getStringField(data, 'authorId');
    if (!groupsMap.has(authorId)) groupsMap.set(authorId, []);
    groupsMap.get(authorId)!.push(docSnap);
  }

  const groups: StoryGroup[] = [];

  for (const [authorId, docs] of groupsMap.entries()) {
    const authorInfo = await getAuthorInfo(authorId);

    // Sort docs by createdAt ascending on the client to avoid composite index requirements.
    const sortedDocs = docs.slice().sort((a, b) => {
      const da = (a.data() ?? {}) as Record<string, unknown>;
      const db = (b.data() ?? {}) as Record<string, unknown>;

      const ta = typeof da.createdAt === 'object' && da.createdAt && 'toDate' in da.createdAt ? (da.createdAt as { toDate: () => Date }).toDate().getTime() : 0;
      const tb = typeof db.createdAt === 'object' && db.createdAt && 'toDate' in db.createdAt ? (db.createdAt as { toDate: () => Date }).toDate().getTime() : 0;

      return ta - tb;
    });

    const stories = await Promise.all(sortedDocs.map((d) => docToStory(d, currentUserId)));

    const hasUnviewed = currentUserId ? stories.some((s) => !s.viewed) : false;

    groups.push({
      userId: authorId,
      author: authorInfo.author,
      avatarUrl: authorInfo.avatarUrl || null,
      stories,
      hasUnviewed,
    });
  }

  return groups;
}

// Mark story viewed by adding userId to viewedBy array
export async function markStoryViewed(storyId: string, userId: string): Promise<void> {
  const storyRef = doc(firestore, STORIES_COLLECTION, storyId);
  await updateDoc(storyRef, { viewedBy: arrayUnion(userId) });
}
