import Constants from 'expo-constants';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore } from '../store/useAuthStore';

const googleWebClientId =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() ||
  process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ||
  '';

export function useGoogleSignIn() {
  const loginWithGoogleIdToken = useAuthStore((state) => state.loginWithGoogleIdToken);
  const clearError = useAuthStore((state) => state.clearError);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasConfiguredGoogle = useRef(false);
  const isConfigured = googleWebClientId.length > 0;
  const isExpoGo = Constants.appOwnership === 'expo';
  const setupMessage = isExpoGo
    ? 'Google Sign-In native tidak tersedia di Expo Go. Gunakan development build.'
    : isConfigured
      ? null
      : 'Isi EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID di .env untuk mengaktifkan Google Sign-In.';

  useEffect(() => {
    if (!isConfigured || isExpoGo || hasConfiguredGoogle.current) {
      return;
    }

    GoogleSignin.configure({
      webClientId: googleWebClientId,
    });
    hasConfiguredGoogle.current = true;
  }, [isConfigured, isExpoGo]);

  const signInWithGoogle = useCallback(async () => {
    clearError();
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage('Google Sign-In belum dikonfigurasi. Isi EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.');
      return;
    }

    if (isExpoGo) {
      setErrorMessage(
        'Google Sign-In native tidak bisa dites di Expo Go. Buka dari development build Sociyo.',
      );
      return;
    }

    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return;
      }

      const { idToken } = response.data;

      if (!idToken) {
        setErrorMessage('Google tidak mengirim token login. Cek Web Client ID di .env.');
        return;
      }

      await loginWithGoogleIdToken(idToken);
    } catch (error) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) return;
        if (error.code === statusCodes.IN_PROGRESS) {
          setErrorMessage('Login Google sedang diproses.');
          return;
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          setErrorMessage('Google Play Services belum tersedia atau perlu diperbarui.');
          return;
        }
      }

      setErrorMessage('Login Google gagal. Coba lagi.');
    }
  }, [clearError, isConfigured, isExpoGo, loginWithGoogleIdToken]);

  return useMemo(
    () => ({
      errorMessage,
      isConfigured,
      isReady: isConfigured && !isExpoGo,
      setupMessage,
      signInWithGoogle,
    }),
    [errorMessage, isConfigured, isExpoGo, setupMessage, signInWithGoogle],
  );
}
