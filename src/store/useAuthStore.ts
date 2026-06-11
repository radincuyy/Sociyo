import { create } from 'zustand';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from '@firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore, getFirebaseAuth } from '../services/firebase';

export type SessionUser = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

type AuthState = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;
  initializeAuthListener: () => () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
};

type RegisterInput = {
  displayName: string;
  username: string;
  email: string;
  password: string;
};

const fallbackAvatar =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80';

function normalizeUsername(username: string) {
  return username.trim().replace(/^@/, '').toLowerCase();
}

function getFirebaseErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code === 'auth/invalid-email') return 'Format email belum valid.';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Email atau password salah.';
  }
  if (code === 'auth/email-already-in-use') return 'Email ini sudah terdaftar.';
  if (code === 'auth/weak-password') return 'Password minimal 6 karakter.';
  if (code === 'auth/network-request-failed') return 'Koneksi bermasalah. Coba lagi sebentar.';

  return 'Terjadi kesalahan. Coba lagi.';
}

async function getSessionUser(firebaseUser: User): Promise<SessionUser> {
  const userRef = doc(firestore, 'users', firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const data = snapshot.data();

  return {
    id: firebaseUser.uid,
    displayName:
      typeof data?.displayName === 'string'
        ? data.displayName
        : firebaseUser.displayName ?? 'AnimaVibe User',
    username:
      typeof data?.username === 'string'
        ? data.username
        : firebaseUser.email?.split('@')[0] ?? 'animavibe.user',
    avatarUrl:
      typeof data?.avatarUrl === 'string'
        ? data.avatarUrl
        : firebaseUser.photoURL ?? fallbackAvatar,
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

        const sessionUser = await getSessionUser(firebaseUser);
        set({ user: sessionUser, isAuthenticated: true, isInitializing: false });
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

      await updateProfile(credential.user, {
        displayName: cleanDisplayName,
        photoURL: fallbackAvatar,
      });

      await setDoc(doc(firestore, 'users', credential.user.uid), {
        displayName: cleanDisplayName,
        username: cleanUsername,
        email: credential.user.email,
        avatarUrl: fallbackAvatar,
        bio: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  logout: async () => {
    set({ isLoading: true, error: null });

    try {
      await signOut(getFirebaseAuth());
      set({ isLoading: false, user: null, isAuthenticated: false });
    } catch (error) {
      set({ isLoading: false, error: getFirebaseErrorMessage(error) });
      throw error;
    }
  },
  clearError: () => set({ error: null }),
}));
