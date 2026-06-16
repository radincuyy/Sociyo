import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import { firestore } from './firebase';

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';

/* Types */

export type SearchUser = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  followersCount: number;
  postsCount: number;
};

export type SearchPost = {
  id: string;
  authorId: string;
  author: string;
  username: string;
  avatarUrl: string | null;
  imageUrl: string | null;
  caption: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
};

/* Helpers */

function str(data: Record<string, unknown>, key: string, fallback = '') {
  const v = data[key];
  return typeof v === 'string' ? v : fallback;
}

function num(data: Record<string, unknown>, key: string) {
  const v = data[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}

function timestampToISO(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

/* Search Users */

export async function searchUsers(term: string, maxResults = 20): Promise<SearchUser[]> {
  const cleaned = term.trim().toLowerCase();
  if (cleaned.length < 1) return [];

  const end = cleaned + '\uf8ff';

  const usernameQ = query(
    collection(firestore, USERS_COLLECTION),
    where('username', '>=', cleaned),
    where('username', '<=', end),
    orderBy('username'),
    limit(maxResults),
  );

  const usernameSnap = await getDocs(usernameQ);
  const seenIds = new Set<string>();
  const results: SearchUser[] = [];

  for (const docSnap of usernameSnap.docs) {
    if (seenIds.has(docSnap.id)) continue;
    seenIds.add(docSnap.id);
    const data = docSnap.data() as Record<string, unknown>;
    results.push({
      id: docSnap.id,
      displayName: str(data, 'displayName', 'Pengguna'),
      username: str(data, 'username'),
      avatarUrl: str(data, 'avatarUrl') || null,
      bio: str(data, 'bio'),
      followersCount: num(data, 'followersCount'),
      postsCount: num(data, 'postsCount'),
    });
  }

  return results;
}

/* Explore Posts */

export async function getExplorePosts(maxResults = 30): Promise<SearchPost[]> {
  // Fetch extra to compensate for text-only posts we'll skip
  const q = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('likesCount', 'desc'),
    limit(maxResults * 2),
  );

  const snapshot = await getDocs(q);
  const posts: SearchPost[] = [];

  for (const postDoc of snapshot.docs) {
    if (posts.length >= maxResults) break;

    const data = postDoc.data() as Record<string, unknown>;
    const imageUrl = str(data, 'imageUrl');

    // Skip posts without images
    if (!imageUrl) continue;

    const authorId = str(data, 'authorId');

    let author = 'Pengguna';
    let username = authorId.slice(0, 8);
    let avatarUrl: string | null = null;

    try {
      const userSnap = await getDoc(doc(firestore, USERS_COLLECTION, authorId));
      const userData = (userSnap.data() ?? {}) as Record<string, unknown>;
      author = str(userData, 'displayName', 'Pengguna');
      username = str(userData, 'username', authorId.slice(0, 8));
      avatarUrl = str(userData, 'avatarUrl') || null;
    } catch { }

    posts.push({
      id: postDoc.id,
      authorId,
      author,
      username,
      avatarUrl,
      imageUrl,
      caption: str(data, 'caption'),
      likesCount: num(data, 'likesCount'),
      commentsCount: num(data, 'commentsCount'),
      createdAt: timestampToISO(data.createdAt),
    });
  }

  return posts;
}
