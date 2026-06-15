import { Mail, RotateCcwKey } from 'lucide-react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';

import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function ForgotPasswordScreen() {
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const screenBackground = mode === 'dark' ? '#000000' : palette.background;
  const controlBackground = mode === 'dark' ? '#050505' : palette.surface;
  const controlBorder = mode === 'dark' ? '#7A7F88' : palette.border;
  const primaryBackground = mode === 'dark' ? '#FFFFFF' : palette.text;
  const primaryText = mode === 'dark' ? '#050505' : palette.background;
  const canSubmit = email.trim().length > 0 && !isLoading;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    clearError();
    setNotice(null);

    try {
      await resetPassword(email);
      setNotice('Link reset password sudah dikirim ke email.');
    } catch {
      return;
    }
  };

  return (
    <Screen style={{ backgroundColor: screenBackground }}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.content}>
            <View style={styles.illustrationWrap}>
              <View
                style={[
                  styles.forgotIcon,
                  {
                    backgroundColor: mode === 'dark' ? '#10151C' : palette.primarySoft,
                    borderColor: mode === 'dark' ? '#283847' : palette.border,
                  },
                ]}
              >
                <RotateCcwKey size={78} color={palette.primary} strokeWidth={1.8} />
              </View>
            </View>
            <Text style={[styles.description, { color: palette.textMuted }]}>
              We&apos;ll send your password reset link to this email.
            </Text>

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
                    setNotice(null);
                    setEmail(value);
                  }}
                  style={[styles.input, { color: palette.text }]}
                />
              </View>
              <Text style={[styles.terms, { color: palette.text }]}>
                By continuing, you agree to the Terms and Conditions
              </Text>
              {error ? <Text style={[styles.error, { color: palette.accent }]}>{error}</Text> : null}
              {notice ? (
                <Text style={[styles.notice, { color: palette.success }]}>{notice}</Text>
              ) : null}
              <Pressable
                onPress={handleSubmit}
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
                  {isLoading ? 'Memproses...' : 'Forgot Password'}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 18,
  },
  content: {
    width: '100%',
    maxWidth: 330,
    alignSelf: 'center',
    alignItems: 'center',
  },
  illustrationWrap: {
    height: 164,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotIcon: {
    width: 136,
    height: 136,
    borderWidth: 1,
    borderRadius: 68,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    maxWidth: 270,
    marginTop: 18,
    marginBottom: 28,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700',
  },
  form: {
    width: '100%',
    gap: 14,
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
  terms: {
    maxWidth: 270,
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  notice: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  primaryLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
});
