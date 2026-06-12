import * as GoogleAuthSession from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAuthStore } from '../store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

const googleClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? '';

export function useGoogleSignIn() {
  const loginWithGoogleIdToken = useAuthStore((state) => state.loginWithGoogleIdToken);
  const clearError = useAuthStore((state) => state.clearError);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isConfigured = googleClientId.length > 0;

  const [request, response, promptAsync] = GoogleAuthSession.useIdTokenAuthRequest(
    {
      clientId: googleClientId,
      selectAccount: true,
    },
    {
      path: 'redirect',
    },
  );

  useEffect(() => {
    if (!response) return;

    if (response.type === 'success') {
      const idToken = response.params.id_token;

      if (!idToken) {
        setErrorMessage('Google tidak mengirim token login. Coba lagi.');
        return;
      }

      setErrorMessage(null);
      void loginWithGoogleIdToken(idToken).catch(() => undefined);
      return;
    }

    if (response.type === 'error') {
      setErrorMessage('Login Google gagal. Coba lagi.');
    }
  }, [loginWithGoogleIdToken, response]);

  const signInWithGoogle = useCallback(async () => {
    clearError();
    setErrorMessage(null);

    if (!isConfigured) {
      setErrorMessage('Google Sign-In belum dikonfigurasi. Isi EXPO_PUBLIC_GOOGLE_CLIENT_ID.');
      return;
    }

    if (!request) {
      setErrorMessage('Google Sign-In belum siap. Coba lagi sebentar.');
      return;
    }

    await promptAsync();
  }, [clearError, isConfigured, promptAsync, request]);

  return useMemo(
    () => ({
      errorMessage,
      isConfigured,
      isReady: isConfigured && Boolean(request),
      signInWithGoogle,
    }),
    [errorMessage, isConfigured, request, signInWithGoogle],
  );
}
