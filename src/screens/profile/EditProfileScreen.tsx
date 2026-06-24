import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Camera, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Avatar } from '../../components/Avatar';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type EditProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

type ProfileFormState = {
  displayName: string;
  username: string;
  bio: string;
};

type SelectedAvatar = {
  uri: string;
  mimeType: string | null;
};

export function EditProfileScreen({ navigation }: EditProfileProps) {
  const user = useAuthStore((state) => state.user);
  const isSaving = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const clearError = useAuthStore((state) => state.clearError);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const [form, setForm] = useState<ProfileFormState>({
    displayName: user?.displayName ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
  });
  const [selectedAvatar, setSelectedAvatar] = useState<SelectedAvatar | null>(
    null,
  );

  useEffect(() => {
    clearError();

    return clearError;
  }, [clearError]);

  const canSave = useMemo(
    () =>
      Boolean(user) &&
      form.displayName.trim().length > 0 &&
      form.username.trim().length > 0 &&
      !isSaving,
    [form.displayName, form.username, isSaving, user],
  );

  function updateForm(field: keyof ProfileFormState, value: string) {
    clearError();
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function saveProfile() {
    if (!canSave) {
      return;
    }

    try {
      await updateUserProfile({
        ...form,
        avatarFile: selectedAvatar,
      });
      navigation.goBack();
    } catch {
      return;
    }
  }

  async function pickAvatar() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Izin galeri diperlukan',
        'Izinkan Sociyo mengakses galeri untuk memilih foto profil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];

      if (!selectedAsset?.uri) {
        Alert.alert('Foto tidak tersedia', 'File foto yang dipilih tidak dapat dibaca.');
        return;
      }

      clearError();
      setSelectedAvatar({
        uri: selectedAsset.uri,
        mimeType: selectedAsset.mimeType ?? null,
      });
    }
  }

  if (!user) {
    return (
      <Screen padded={false} edges={['top', 'bottom']}>
        <View style={styles.unavailable}>
          <Text style={[styles.unavailableTitle, { color: palette.text }]}>
            Profil tidak tersedia
          </Text>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={[styles.backText, { color: palette.primary }]}>
              Kembali
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: palette.background,
              borderBottomColor: palette.border,
            },
          ]}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.headerButton}
          >
            <X size={25} color={palette.text} />
          </Pressable>

          <Text style={[styles.headerTitle, { color: palette.text }]}>
            Edit profil
          </Text>

          <Pressable
            onPress={() => void saveProfile()}
            disabled={!canSave}
            hitSlop={10}
            style={styles.doneButton}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={palette.primary} />
            ) : (
              <Text
                style={[
                  styles.doneText,
                  {
                    color: canSave ? palette.primary : palette.textMuted,
                    opacity: canSave ? 1 : 0.48,
                  },
                ]}
              >
                Selesai
              </Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.formSurface,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
              },
            ]}
          >
            <View
              style={[
                styles.avatarRow,
                { borderBottomColor: palette.border },
              ]}
            >
              <View style={styles.avatarCopy}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>
                  Foto profil
                </Text>
                <Text
                  style={[styles.fieldDescription, { color: palette.textMuted }]}
                >
                  Pilih foto dari galeri perangkat.
                </Text>
                <Pressable
                  onPress={() => void pickAvatar()}
                  disabled={isSaving}
                  style={({ pressed }) => [
                    styles.changePhotoButton,
                    {
                      borderColor: palette.border,
                      opacity: pressed ? 0.68 : 1,
                    },
                  ]}
                >
                  <Camera size={15} color={palette.primary} />
                  <Text
                    style={[styles.changePhotoText, { color: palette.primary }]}
                  >
                    {selectedAvatar ? 'Ganti foto' : 'Pilih foto'}
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={() => void pickAvatar()} disabled={isSaving}>
                <View style={styles.avatarPreview}>
                  <Avatar
                    displayName={form.displayName}
                    username={form.username}
                    avatarUrl={selectedAvatar?.uri ?? user.avatarUrl}
                    size={72}
                  />
                  <View
                    style={[
                      styles.avatarCameraBadge,
                      {
                        backgroundColor: palette.primary,
                        borderColor: palette.surface,
                      },
                    ]}
                  >
                    <Camera size={13} color="#FFFFFF" />
                  </View>
                </View>
              </Pressable>
            </View>

            <ProfileField
              label="Nama"
              value={form.displayName}
              placeholder="Nama lengkap"
              color={palette.text}
              mutedColor={palette.textMuted}
              borderColor={palette.border}
              onChangeText={(value) => updateForm('displayName', value)}
            />

            <ProfileField
              label="Username"
              value={form.username}
              placeholder="username"
              color={palette.text}
              mutedColor={palette.textMuted}
              borderColor={palette.border}
              autoCapitalize="none"
              onChangeText={(value) => updateForm('username', value)}
            />

            <ProfileField
              label="Bio"
              value={form.bio}
              placeholder="Tulis bio singkat..."
              color={palette.text}
              mutedColor={palette.textMuted}
              borderColor={palette.border}
              multiline
              maxLength={160}
              isLast
              onChangeText={(value) => updateForm('bio', value)}
            />
          </View>

          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: palette.accentSoft },
              ]}
            >
              <Text style={[styles.errorText, { color: palette.accent }]}>
                {error}
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

type ProfileFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  color: string;
  mutedColor: string;
  borderColor: string;
  onChangeText: (value: string) => void;
  multiline?: boolean;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'url';
  isLast?: boolean;
};

function ProfileField({
  label,
  value,
  placeholder,
  color,
  mutedColor,
  borderColor,
  onChangeText,
  multiline,
  maxLength,
  autoCapitalize,
  keyboardType,
  isLast,
}: ProfileFieldProps) {
  return (
    <View
      style={[
        styles.field,
        !isLast && styles.fieldBorder,
        !isLast && { borderBottomColor: borderColor },
      ]}
    >
      <Text style={[styles.fieldLabel, { color }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={mutedColor}
        multiline={multiline}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.fieldInput,
          multiline && styles.multilineInput,
          { color },
        ]}
      />
      {maxLength ? (
        <Text style={[styles.characterCount, { color: mutedColor }]}>
          {value.length}/{maxLength}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 58,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    marginLeft: 6,
    fontSize: 19,
    fontWeight: '900',
  },
  doneButton: {
    minWidth: 76,
    height: 44,
    paddingHorizontal: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  doneText: {
    fontSize: 15,
    fontWeight: '900',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 36,
  },
  formSurface: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  avatarRow: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarCopy: {
    flex: 1,
  },
  changePhotoButton: {
    alignSelf: 'flex-start',
    minHeight: 34,
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  changePhotoText: {
    fontSize: 12,
    fontWeight: '900',
  },
  avatarPreview: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 27,
    height: 27,
    borderWidth: 3,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    minHeight: 86,
    paddingTop: 14,
    paddingBottom: 10,
  },
  fieldBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '900',
  },
  fieldDescription: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  fieldInput: {
    minHeight: 38,
    paddingHorizontal: 0,
    paddingVertical: 6,
    fontSize: 15,
    lineHeight: 21,
  },
  multilineInput: {
    minHeight: 70,
    paddingTop: 7,
    paddingBottom: 7,
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 2,
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  errorBox: {
    marginTop: 14,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  unavailable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  unavailableTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  backText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
