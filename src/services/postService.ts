import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';

import { firestore, firebaseStorage } from './firebase';
import type { Comment, Post } from '../types/social';

const POSTS_COLLECTION = 'posts';
const USERS_COLLECTION = 'users';
const PAGE_SIZE = 10;

function getStringField(data: Record<string, unknown>, key: string, fallback = '') {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

function getNumberField(data: Record<string, unknown>, key: string) {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
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
      username: getStringField(data, 'username', authorId.slice(0, 8)),
      avatarUrl: getStringField(data, 'avatarUrl') || null,
    };
  } catch {
    return { author: 'Pengguna', username: authorId.slice(0, 8), avatarUrl: null };
  }
}

async function docToPost(
  snapshot: QueryDocumentSnapshot | DocumentSnapshot,
  currentUserId?: string,
): Promise<Post> {
  const data = (snapshot.data() ?? {}) as Record<string, unknown>;
  const authorId = getStringField(data, 'authorId');
  const authorInfo = await getAuthorInfo(authorId);

  let likedByMe = false;
  if (currentUserId) {
    const likeRef = doc(firestore, POSTS_COLLECTION, snapshot.id, 'likes', currentUserId);
    const likeSnap = await getDoc(likeRef);
    likedByMe = likeSnap.exists();
  }

  return {
    id: snapshot.id,
    authorId,
    ...authorInfo,
    imageUrl: getStringField(data, 'imageUrl') || null,
    caption: getStringField(data, 'caption'),
    location: getStringField(data, 'location') || null,
    likes: getNumberField(data, 'likesCount'),
    comments: getNumberField(data, 'commentsCount'),
    likedByMe,
    createdAt: timestampToISO(data.createdAt),
  };
}

// Upload image to Firebase Storage

export async function uploadPostImage(uri: string, authorId: string): Promise<string> {
  const filename = `posts/${authorId}/${Date.now()}.jpg`;
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

// Create post

type CreatePostInput = {
  authorId: string;
  caption: string;
  imageUri?: string | null;
  location?: string | null;
};

export async function createPost({ authorId, caption, imageUri, location }: CreatePostInput) {
  let imageUrl: string | null = null;

  if (imageUri) {
    imageUrl = await uploadPostImage(imageUri, authorId);
  }

  const postRef = await addDoc(collection(firestore, POSTS_COLLECTION), {
    authorId,
    caption: caption.trim(),
    imageUrl,
    location: location?.trim() || null,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const userRef = doc(firestore, USERS_COLLECTION, authorId);
  await updateDoc(userRef, { postsCount: increment(1), updatedAt: serverTimestamp() });

  return postRef.id;
}

// Read posts (paginated)

type PostsPage = {
  posts: Post[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
};

export async function getPosts(
  currentUserId?: string,
  lastDocument?: QueryDocumentSnapshot | null,
  pageSize = PAGE_SIZE,
): Promise<PostsPage> {
  let q = query(
    collection(firestore, POSTS_COLLECTION),
    orderBy('createdAt', 'desc'),
    limit(pageSize),
  );

  if (lastDocument) {
    q = query(q, startAfter(lastDocument));
  }

  const snapshot = await getDocs(q);
  const posts = await Promise.all(
    snapshot.docs.map((postDoc) => docToPost(postDoc, currentUserId)),
  );

  const lastDoc = snapshot.docs[snapshot.docs.length - 1] ?? null;
  const hasMore = snapshot.docs.length >= pageSize;

  return { posts, lastDoc, hasMore };
}

// Read single post

export async function getPostById(postId: string, currentUserId?: string): Promise<Post | null> {
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) return null;

  return docToPost(snapshot, currentUserId);
}

// Read user's posts

export async function getUserPosts(userId: string, maxResultsOrCurrentUserId?: number | string): Promise<Post[]> {
  // Supports two calling conventions for compatibility:
  // - getUserPosts(userId, currentUserId: string)
  // - getUserPosts(userId, maxResults: number)
  const currentUserId = typeof maxResultsOrCurrentUserId === 'string' ? maxResultsOrCurrentUserId : undefined;
  const maxResults = typeof maxResultsOrCurrentUserId === 'number' ? maxResultsOrCurrentUserId : undefined;

  const clauses: any[] = [where('authorId', '==', userId)];
  if (typeof maxResults === 'number' && Number.isFinite(maxResults) && maxResults > 0) {
    clauses.push(limit(maxResults));
  }

  const q = query(collection(firestore, POSTS_COLLECTION), ...clauses);

  const snapshot = await getDocs(q);

  // Sort by createdAt descending on client-side to avoid composite index requirements
  const sortedDocs = snapshot.docs.slice().sort((a, b) => {
    const da = (a.data() ?? {}) as Record<string, unknown>;
    const db = (b.data() ?? {}) as Record<string, unknown>;

    const ta = typeof da.createdAt === 'object' && da.createdAt && 'toDate' in da.createdAt ? (da.createdAt as { toDate: () => Date }).toDate().getTime() : 0;
    const tb = typeof db.createdAt === 'object' && db.createdAt && 'toDate' in db.createdAt ? (db.createdAt as { toDate: () => Date }).toDate().getTime() : 0;

    return tb - ta; // desc
  });

  return Promise.all(sortedDocs.map((postDoc) => docToPost(postDoc, currentUserId)));
}

// Delete post

export async function deletePost(postId: string, authorId: string) {
  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  const snapshot = await getDoc(postRef);

  if (!snapshot.exists()) return;

  const data = snapshot.data() as Record<string, unknown>;
  const imageUrl = getStringField(data, 'imageUrl');

  if (imageUrl) {
    try {
      const imageRef = ref(firebaseStorage, imageUrl);
      await deleteObject(imageRef);
    } catch {
    }
  }

  await deleteDoc(postRef);

  const userRef = doc(firestore, USERS_COLLECTION, authorId);
  await updateDoc(userRef, { postsCount: increment(-1), updatedAt: serverTimestamp() });
}

// Toggle like

export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  const likeRef = doc(firestore, POSTS_COLLECTION, postId, 'likes', userId);
  const likeSnap = await getDoc(likeRef);
  const postRef = doc(firestore, POSTS_COLLECTION, postId);

  if (likeSnap.exists()) {
    // Unlike
    await deleteDoc(likeRef);
    await updateDoc(postRef, { likesCount: increment(-1) });
    return false;
  }

  // Like
  await setDoc(likeRef, { createdAt: serverTimestamp() });
  await updateDoc(postRef, { likesCount: increment(1) });
  return true;
}

// Comments

type AddCommentInput = {
  postId: string;
  authorId: string;
  text: string;
};

export async function addComment({ postId, authorId, text }: AddCommentInput): Promise<string> {
  const commentsRef = collection(firestore, POSTS_COLLECTION, postId, 'comments');

  const commentDoc = await addDoc(commentsRef, {
    authorId,
    text: text.trim(),
    createdAt: serverTimestamp(),
  });

  const postRef = doc(firestore, POSTS_COLLECTION, postId);
  await updateDoc(postRef, { commentsCount: increment(1) });

  return commentDoc.id;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const q = query(
    collection(firestore, POSTS_COLLECTION, postId, 'comments'),
    orderBy('createdAt', 'asc'),
  );

  const snapshot = await getDocs(q);

  return Promise.all(
    snapshot.docs.map(async (commentDoc) => {
      const data = commentDoc.data() as Record<string, unknown>;
      const authorId = getStringField(data, 'authorId');
      const authorInfo = await getAuthorInfo(authorId);

      return {
        id: commentDoc.id,
        authorId,
        ...authorInfo,
        text: getStringField(data, 'text'),
        createdAt: timestampToISO(data.createdAt),
      };
    }),
  );
}
