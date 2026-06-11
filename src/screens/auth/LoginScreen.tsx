import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowRight } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { ThemeToggle } from '../../components/ThemeToggle';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../types/navigation';

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: LoginScreenProps) {
  const loginWithDemo = useAuthStore((state) => state.loginWithDemo);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

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
            Starter Minggu 13: auth flow, navigasi, struktur app, dan fondasi animasi.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            placeholder="Email"
            placeholderTextColor={palette.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
            ]}
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor={palette.textMuted}
            secureTextEntry
            style={[
              styles.input,
              { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
            ]}
          />
          <PrimaryButton onPress={loginWithDemo}>
            Masuk demo <ArrowRight size={16} color="#FFFFFF" />
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
});
