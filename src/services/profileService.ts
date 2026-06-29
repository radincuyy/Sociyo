import { doc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

import { firebaseStorage, firestore } from './firebase';

const AVATAR_UPLOAD_ATTEMPTS = 2;
const USERS_COLLECTION = 'users';

export type PublicUserProfile = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

function getStringField(
  data: Record<string, unknown>,
  key: string,
  fallback: string,
): string {
  const value = data[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function getOptionalStringField(
  data: Record<string, unknown>,
  key: string,
): string | null {
  const value = data[key];
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function getNumberField(data: Record<string, unknown>, key: string): number {
  const value = data[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export async function getPublicUserProfile(
  userId: string,
): Promise<PublicUserProfile> {
  const userRef = doc(firestore, USERS_COLLECTION, userId);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error(`Profil pengguna ${userId} tidak ditemukan.`);
  }

  const data = snapshot.data() as Record<string, unknown>;

  return {
    id: userId,
    displayName: getStringField(data, 'displayName', 'Pengguna'),
    username: getStringField(data, 'username', userId.slice(0, 8)),
    bio: getStringField(data, 'bio', ''),
    avatarUrl: getOptionalStringField(data, 'avatarUrl'),
    followersCount: getNumberField(data, 'followersCount'),
    followingCount: getNumberField(data, 'followingCount'),
    postsCount: getNumberField(data, 'postsCount'),
  };
}

async function readLocalImage(uri: string): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onload = () => resolve(request.response as Blob);
    request.onerror = () => {
      reject(new Error(`Gagal membaca foto profil dari URI lokal: ${uri}`));
    };
    request.responseType = 'blob';
    request.open('GET', uri, true);
    request.send(null);
  });
}

async function uploadAvatarAttempt(
  userId: string,
  blob: Blob,
  contentType: string,
): Promise<string> {
  const avatarRef = ref(firebaseStorage, `avatars/${userId}/profile.jpg`);
  const uploadTask = uploadBytesResumable(avatarRef, blob, {
    contentType,
    cacheControl: 'public,max-age=3600',
  });

  await new Promise<void>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      undefined,
      reject,
      resolve,
    );
  });

  const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
  return `${downloadUrl}&v=${Date.now()}`;
}

export async function uploadAvatarImage(
  userId: string,
  imageUri: string,
  mimeType: string | null,
): Promise<string> {
  const blob = await readLocalImage(imageUri);
  const contentType = mimeType ?? (blob.type || 'image/jpeg');
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= AVATAR_UPLOAD_ATTEMPTS; attempt += 1) {
    try {
      return await uploadAvatarAttempt(userId, blob, contentType);
    } catch (error) {
      lastError = error;
      console.warn('[profile-avatar] upload attempt failed', {
        userId,
        imageUri,
        attempt,
        maxAttempts: AVATAR_UPLOAD_ATTEMPTS,
        error,
      });
    }
  }

  throw new Error(
    `Upload foto profil gagal setelah ${AVATAR_UPLOAD_ATTEMPTS} percobaan.`,
    { cause: lastError },
  );
}
