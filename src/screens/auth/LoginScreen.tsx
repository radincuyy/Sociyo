import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ThemeToggle } from '../../components/ThemeToggle';
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

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isLoading;

  const handleLogin = async () => {
    if (!canSubmit) return;
    await login(email, password);
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        <View style={styles.topBar}>
          <Text style={[styles.brand, { color: palette.text }]}>AnimaVibe</Text>
          <ThemeToggle />
        </View>

        <View style={styles.heroBlock}>
          <Text style={[styles.kicker, { color: palette.primary }]}>Kelompok 1</Text>
          <Text style={[styles.title, { color: palette.text }]}>
            Social experience yang terasa hidup sejak sentuhan pertama.
          </Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Masuk dengan akun Firebase untuk lanjut ke feed dan fitur sosial.
          </Text>
        </View>

        <View style={styles.form}>
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
            style={[
              styles.input,
              { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
            ]}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(value) => {
              clearError();
              setPassword(value);
            }}
            style={[
              styles.input,
              { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
            ]}
          />
          {error ? <Text style={[styles.error, { color: palette.accent }]}>{error}</Text> : null}
          <PrimaryButton onPress={handleLogin} disabled={!canSubmit}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </PrimaryButton>
          <PrimaryButton variant="ghost" onPress={() => navigation.navigate('Register')}>
            Buat akun
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontSize: 22,
    fontWeight: '900',
  },
  heroBlock: {
    gap: 10,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: 12,
  },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
  },
});
