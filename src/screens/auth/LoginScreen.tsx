import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, LockKeyhole } from 'lucide-react-native';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';

import { GoogleLogo } from '../../components/GoogleLogo';
import { Screen } from '../../components/Screen';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useGoogleSignIn } from '../../hooks/useGoogleSignIn';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../types/navigation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const googleSignIn = useGoogleSignIn();

  const screenBackground = mode === 'dark' ? '#000000' : palette.background;
  const controlBackground = mode === 'dark' ? '#050505' : palette.surface;
  const controlBorder = mode === 'dark' ? '#7A7F88' : palette.border;
  const primaryBackground = mode === 'dark' ? '#FFFFFF' : palette.text;
  const primaryText = mode === 'dark' ? '#050505' : palette.background;
  const socialBackground = mode === 'dark' ? '#FFFFFF' : palette.surface;
  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;
  const authError = error ?? googleSignIn.errorMessage;

  const handleLogin = async () => {
    if (!canSubmit) return;
    try {
      await login(email, password);
    } catch {
      return;
    }
  };

  return (
    <Screen style={{ backgroundColor: screenBackground }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        <View style={styles.topBar}>
          <View style={styles.topBarSpacer} />
          <ThemeToggle />
        </View>

        <View style={styles.authPanel}>
          <View style={styles.brandBlock}>
            <Image
              source={require('../../../assets/sociyo-icon.png')}
              resizeMode="contain"
              style={styles.brandIcon}
            />
            <Text style={[styles.brand, { color: palette.text }]}>Sociyo</Text>
          </View>

          <View style={styles.form}>
            <View
              style={[
                styles.inputWrap,
                { backgroundColor: controlBackground, borderColor: controlBorder },
              ]}
            >
              <Mail size={18} color={palette.textMuted} />
              <TextInput
                placeholder="Email"
                placeholderTextColor={palette.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(value) => {
                  clearError();
                  setEmail(value);
                }}
                style={[styles.input, { color: palette.text }]}
              />
            </View>
            <View
              style={[
                styles.inputWrap,
                { backgroundColor: controlBackground, borderColor: controlBorder },
              ]}
            >
              <LockKeyhole size={18} color={palette.textMuted} />
              <TextInput
                placeholder="Password"
                placeholderTextColor={palette.textMuted}
                secureTextEntry
                value={password}
                onChangeText={(value) => {
                  clearError();
                  setPassword(value);
                }}
                style={[styles.input, { color: palette.text }]}
              />
            </View>
            <Pressable
              onPress={() => navigation.navigate('ForgotPassword')}
              hitSlop={8}
              style={styles.forgotButton}
            >
              <Text style={[styles.textLink, { color: palette.textMuted }]}>Forgot Password?</Text>
            </Pressable>
            {authError ? (
              <Text style={[styles.error, { color: palette.accent }]}>{authError}</Text>
            ) : null}
            <Pressable
              onPress={handleLogin}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                {
                  backgroundColor: primaryBackground,
                  opacity: !canSubmit ? 0.5 : pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text style={[styles.primaryLabel, { color: primaryText }]}>
                {isLoading ? 'Memproses...' : 'Sign in'}
              </Text>
            </Pressable>
            <View style={styles.inlineRow}>
              <Text style={[styles.inlineText, { color: palette.textMuted }]}>
                {"Don't have an account?"}
              </Text>
              <Pressable onPress={() => navigation.navigate('Register')} hitSlop={8}>
                <Text style={[styles.inlineLink, { color: palette.text }]}>Sign Up</Text>
              </Pressable>
            </View>
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
              <Text style={[styles.dividerText, { color: palette.textMuted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: palette.border }]} />
            </View>
            <View style={styles.socialRow}>
              <Pressable
                accessibilityLabel="Sign in with Google"
                onPress={googleSignIn.signInWithGoogle}
                disabled={isLoading || !googleSignIn.isReady}
                style={({ pressed }) => [
                  styles.socialButton,
                  {
                    backgroundColor: socialBackground,
                    borderColor: palette.border,
                    opacity: isLoading || !googleSignIn.isReady ? 0.5 : pressed ? 0.82 : 1,
                  },
                ]}
              >
                <GoogleLogo size={24} />
              </Pressable>
            </View>
            {googleSignIn.setupMessage ? (
              <Text style={[styles.helper, { color: palette.textMuted }]}>
                {googleSignIn.setupMessage}
              </Text>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  topBar: {
    position: 'absolute',
    top: 18,
    right: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarSpacer: {
    width: 68,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  brandIcon: {
    width: 46,
    height: 46,
  },
  brand: {
    fontSize: 34,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0,
  },
  authPanel: {
    width: '100%',
    maxWidth: 330,
    alignSelf: 'center',
  },
  form: {
    gap: 11,
  },
  inputWrap: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 9,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 13,
    fontWeight: '600',
  },
  forgotButton: {
    alignSelf: 'center',
    paddingVertical: 1,
  },
  textLink: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  primaryLabel: {
    fontSize: 13,
    fontWeight: '800',
  },
  inlineRow: {
    minHeight: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  inlineText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inlineLink: {
    fontSize: 12,
    fontWeight: '900',
  },
  dividerRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  socialButton: {
    width: 47,
    height: 47,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helper: {
    fontSize: 12,
    lineHeight: 17,
    textAlign: 'center',
  },
});
