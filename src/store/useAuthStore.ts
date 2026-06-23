import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithCredential,
  signOut,
  updateProfile as updateFirebaseProfile,
  type User,
} from '@firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';

import { firestore, getFirebaseAuth } from '../services/firebase';
import { unregisterPushNotifications } from '../services/notificationService';

export type SessionUser = {
  id: string;
  displayName: string;
  username: string;
  email: string | null;
  bio: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
};

type AuthState = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initializeAuthListener: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateUserProfile: (input: ProfileInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

type RegisterInput = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

type ProfileInput = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

function normalizeUsername(username: string) {
  return username.trim().replace(/^@/, '').toLowerCase();
}

function normalizeAvatarUrl(avatarUrl: string) {
  const cleanAvatarUrl = avatarUrl.trim();
  return cleanAvatarUrl.length > 0 ? cleanAvatarUrl : null;
}

function getStringValue(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function getNumberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function getFirebaseErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code === 'auth/invalid-email') return 'Format email belum valid.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Email atau password salah.';
  }
  if (code === 'auth/email-already-in-use') return 'Email ini sudah terdaftar.';
  if (code === 'auth/account-exists-with-different-credential') {
    return 'Email ini sudah terdaftar dengan metode login lain.';
  }
  if (code === 'auth/weak-password') return 'Password minimal 6 karakter.';
  if (code === 'auth/network-request-failed') return 'Koneksi bermasalah. Coba lagi sebentar.';

  return 'Terjadi kesalahan. Coba lagi.';
}

function getDefaultUsername(firebaseUser: User) {
  return firebaseUser.email?.split('@')[0] ?? firebaseUser.uid.slice(0, 8);
}

function getDefaultDisplayName(firebaseUser: User) {
  return firebaseUser.displayName ?? firebaseUser.email ?? 'Pengguna';
}

async function ensureUserProfile(firebaseUser: User) {
  const userRef = doc(firestore, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) {
    await setDoc(
      userRef,
      {
        email: firebaseUser.email,
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
    return;
  }

  await setDoc(userRef, {
    displayName: getDefaultDisplayName(firebaseUser),
    username: getDefaultUsername(firebaseUser),
    email: firebaseUser.email,
    avatarUrl: firebaseUser.photoURL ?? null,
    bio: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}

async function getSessionUser(firebaseUser: User): Promise<SessionUser> {
  const userRef = doc(firestore, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const data = snapshot.data();
  const storedAvatarUrl =
    typeof data?.avatarUrl === 'string' && data.avatarUrl.trim().length > 0
      ? data.avatarUrl
      : null;

  return {
    id: firebaseUser.uid,
    displayName: getStringValue(
      data?.displayName,
      firebaseUser.displayName ?? firebaseUser.email ?? 'Pengguna',
    ),
    username: getStringValue(data?.username, getDefaultUsername(firebaseUser)),
    email: firebaseUser.email,
    bio: getStringValue(data?.bio, ''),
    avatarUrl: storedAvatarUrl ?? firebaseUser.photoURL ?? null,
    followersCount: getNumberValue(data?.followersCount),
    followingCount: getNumberValue(data?.followingCount),
    postsCount: getNumberValue(data?.postsCount),
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isLoading: false,
  error: null,
  initializeAuthListener: () => {
    const auth = getFirebaseAuth();

    return onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (!firebaseUser) {
          set({ user: null, isAuthenticated: false, isInitializing: false });
          return;
        }

        try {
          await ensureUserProfile(firebaseUser);
          const sessionUser = await getSessionUser(firebaseUser);
          set({
            user: sessionUser,
            isAuthenticated: true,
            isInitializing: false,
            error: null,
          });
        } catch (error) {
          console.error('[auth] session profile load failed', {
            userId: firebaseUser.uid,
            error,
          });
          try {
            await signOut(auth);
          } catch (signOutError) {
            console.error('[auth] invalid session cleanup failed', {
              userId: firebaseUser.uid,
              error: signOutError,
            });
          }
          set({
            user: null,
            isAuthenticated: false,
            isInitializing: false,
            error: 'Gagal memuat profil sesi. Periksa koneksi lalu coba lagi.',
          });
        }
      },
      () => {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          error: 'Gagal membaca sesi login.',
        });
      },
    );
  },
  login: async (email, password) => {
    set({ isLoading: true, error: null });

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });

    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  loginWithGoogleIdToken: async (idToken) => {
    set({ isLoading: true, error: null });

    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
      await ensureUserProfile(userCredential.user);
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  register: async ({ displayName, username, email, password }) => {
    const cleanDisplayName = displayName.trim();
    const cleanUsername = normalizeUsername(username);

    set({ isLoading: true, error: null });

    try {
      const credential = await createUserWithEmailAndPassword(
        getFirebaseAuth(),
        email.trim(),
        password,
      );

      await updateFirebaseProfile(credential.user, {
        displayName: cleanDisplayName,
      });

      await setDoc(doc(firestore, 'users', credential.user.uid), {
        displayName: cleanDisplayName,
        username: cleanUsername,
        email: credential.user.email,
        avatarUrl: null,
        bio: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const sessionUser = await getSessionUser(credential.user);
      set({
        user: sessionUser,
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  updateUserProfile: async ({ displayName, username, bio, avatarUrl }) => {
    const auth = getFirebaseAuth();
    const firebaseUser = auth.currentUser;
    const cleanDisplayName = displayName.trim();
    const cleanUsername = normalizeUsername(username);
    const cleanBio = bio.trim();
    const cleanAvatarUrl = normalizeAvatarUrl(avatarUrl);

    if (!firebaseUser) {
      set({ error: 'Sesi login tidak ditemukan.' });
      throw new Error('Sesi login tidak ditemukan.');
    }

    if (!cleanDisplayName || !cleanUsername) {
      set({ error: 'Nama dan username wajib diisi.' });
      throw new Error('Nama dan username wajib diisi.');
    }

    set({ isLoading: true, error: null });

    try {
      const usernameQuery = query(
        collection(firestore, 'users'),
        where('username', '==', cleanUsername),
      );
      const usernameSnapshot = await getDocs(usernameQuery);
      const isUsernameUsed = usernameSnapshot.docs.some(
        (profileDoc) => profileDoc.id !== firebaseUser.uid,
      );

      if (isUsernameUsed) {
        set({ isLoading: false, error: 'Username ini sudah dipakai.' });
        throw new Error('Username ini sudah dipakai.');
      }

      await updateFirebaseProfile(firebaseUser, {
        displayName: cleanDisplayName,
        photoURL: cleanAvatarUrl,
      });

      await setDoc(
        doc(firestore, 'users', firebaseUser.uid),
        {
          displayName: cleanDisplayName,
          username: cleanUsername,
          bio: cleanBio,
          avatarUrl: cleanAvatarUrl,
          email: firebaseUser.email,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      set((state) => ({
        isLoading: false,
        user: state.user
          ? {
              ...state.user,
              displayName: cleanDisplayName,
              username: cleanUsername,
              bio: cleanBio,
              avatarUrl: cleanAvatarUrl,
              email: firebaseUser.email,
            }
          : state.user,
      }));
    } catch (error) {
      const currentError =
        error instanceof Error && error.message === 'Username ini sudah dipakai.'
          ? error.message
          : getFirebaseErrorMessage(error);
      set({ isLoading: false, error: currentError });
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      const currentUserId = getFirebaseAuth().currentUser?.uid;

      if (currentUserId) {
        try {
          await unregisterPushNotifications(currentUserId);
        } catch (notificationError) {
          console.warn('[auth] push token cleanup failed', {
            userId: currentUserId,
            error: notificationError,
          });
        }
      }

      await signOut(getFirebaseAuth());
      set({ isLoading: false, user: null, isAuthenticated: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));
