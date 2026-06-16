import { getApp, getApps, initializeApp } from 'firebase/app';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  initializeAuth,
  type Auth,
} from '@firebase/auth';
import * as FirebaseAuth from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
};

export const isFirebaseConfigured = Object.values(firebaseConfig).every(Boolean);

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const firestore = getFirestore(firebaseApp, 'new-db');
export const firebaseStorage = getStorage(firebaseApp);

let authInstance: Auth | null = null;

const reactNativeAuth = FirebaseAuth as typeof FirebaseAuth & {
  getReactNativePersistence: (storage: typeof ReactNativeAsyncStorage) => unknown;
};

export function getFirebaseAuth() {
  if (authInstance) {
    return authInstance;
  }

  try {
    authInstance = initializeAuth(firebaseApp, {
      persistence: reactNativeAuth.getReactNativePersistence(ReactNativeAsyncStorage) as never,
    });
  } catch {
    authInstance = getAuth(firebaseApp);
  }

  return authInstance;
}
