import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useState } from 'react';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { AuthStackParamList } from '../../types/navigation';

type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fields = [
    {
      placeholder: 'Nama lengkap',
      value: displayName,
      onChangeText: setDisplayName,
      secureTextEntry: false,
      keyboardType: 'default' as const,
      autoCapitalize: 'words' as const,
    },
    {
      placeholder: 'Username',
      value: username,
      onChangeText: setUsername,
      secureTextEntry: false,
      keyboardType: 'default' as const,
      autoCapitalize: 'none' as const,
    },
    {
      placeholder: 'Email',
      value: email,
      onChangeText: setEmail,
      secureTextEntry: false,
      keyboardType: 'email-address' as const,
      autoCapitalize: 'none' as const,
    },
    {
      placeholder: 'Password',
      value: password,
      onChangeText: setPassword,
      secureTextEntry: true,
      keyboardType: 'default' as const,
      autoCapitalize: 'none' as const,
    },
  ];

  const canSubmit =
    displayName.trim().length > 0 &&
    username.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    !isLoading;

  const handleRegister = async () => {
    if (!canSubmit) return;
    await register({ displayName, username, email, password });
  };

  return (
    <Screen>
      <View style={styles.container}>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: palette.text }]}>Buat profil awal</Text>
          <Text style={[styles.subtitle, { color: palette.textMuted }]}>
            Akun dibuat di Firebase Authentication, lalu profil awal disimpan ke Firestore.
          </Text>
        </View>
        <View style={styles.form}>
          {fields.map((field) => (
            <TextInput
              key={field.placeholder}
              placeholder={field.placeholder}
              placeholderTextColor={palette.textMuted}
              value={field.value}
              secureTextEntry={field.secureTextEntry}
              keyboardType={field.keyboardType}
              autoCapitalize={field.autoCapitalize}
              onChangeText={(value) => {
                clearError();
                field.onChangeText(value);
              }}
              style={[
                styles.input,
                { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
              ]}
            />
          ))}
          {error ? <Text style={[styles.error, { color: palette.accent }]}>{error}</Text> : null}
          <PrimaryButton onPress={handleRegister} disabled={!canSubmit}>
            {isLoading ? 'Memproses...' : 'Daftar'}
          </PrimaryButton>
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
  error: {
    fontSize: 13,
    fontWeight: '700',
  },
});
