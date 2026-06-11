import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../types/navigation';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const loginWithDemo = useAuthStore((state) => state.loginWithDemo);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: palette.text }]}>Buat profil awal</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Nanti form ini disambungkan ke Firebase Authentication dan profile CRUD.
          </Text>
        </View>
        <View style={styles.form}>
          {['Nama lengkap', 'Username', 'Email', 'Password'].map((placeholder) => (
            <TextInput
              key={placeholder}
              placeholder={placeholder}
              placeholderTextColor={palette.textMuted}
              secureTextEntry={placeholder === 'Password'}
              autoCapitalize={placeholder === 'Email' ? 'none' : 'sentences'}
              style={[
                styles.input,
                { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
              ]}
            />
          ))}
          <PrimaryButton onPress={loginWithDemo}>Daftar demo</PrimaryButton>
          <PrimaryButton variant="ghost" onPress={() => navigation.goBack()}>
            Kembali login
          </PrimaryButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 32,
  },
  copy: {
    gap: 8,
  },
  title: {
    fontSize: 30,
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
