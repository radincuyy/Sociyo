import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ImagePlus, MapPin, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
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
import { usePostStore } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { MainTabParamList } from '../../types/navigation';

type CreateNav = BottomTabNavigationProp<MainTabParamList, 'Create'>;

const CAPTION_LIMIT = 500;

export function CreatePostScreen() {
  const navigation = useNavigation<CreateNav>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const user = useAuthStore((state) => state.user);
  const createPost = usePostStore((state) => state.createPost);
  const isCreating = usePostStore((state) => state.isCreating);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const captionRef = useRef<TextInput>(null);

  const cleanCaption = caption.trim();
  const cleanLocation = location.trim();
  const hasDraft =
    cleanCaption.length > 0 || cleanLocation.length > 0 || Boolean(imageUri);
  const canSubmit = cleanCaption.length > 0 && !isCreating;
  const displayName = user?.displayName ?? 'Pengguna';
  const username = user?.username ?? 'user';

  async function pickImage(): Promise<void> {
    if (isCreating) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  }

  function resetForm(): void {
    setImageUri(null);
    setCaption('');
    setLocation('');
    setShowLocationInput(false);
  }

  function handleCancel(): void {
    if (!hasDraft || isCreating) {
      resetForm();
      navigation.navigate('Feed');
      return;
    }

    Alert.alert(
      'Buang draft?',
      'Postingan yang belum dikirim akan dihapus.',
      [
        { text: 'Lanjut edit', style: 'cancel' },
        {
          text: 'Buang',
          style: 'destructive',
          onPress: () => {
            resetForm();
            navigation.navigate('Feed');
          },
        },
      ],
    );
  }

  async function handleSubmit(): Promise<void> {
    if (!canSubmit) {
      return;
    }

    try {
      await createPost({
        caption: cleanCaption,
        imageUri,
        location: cleanLocation || null,
      });

      resetForm();
      navigation.navigate('Feed');
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membuat post. Coba lagi.');
    }
  }

  function handleLocationPress(): void {
    if (isCreating) {
      return;
    }

    setShowLocationInput(true);
  }

  function clearLocation(): void {
    setLocation('');
    setShowLocationInput(false);
  }

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            onPress={handleCancel}
            disabled={isCreating}
            style={({ pressed }) => [
              styles.headerButton,
              { opacity: pressed || isCreating ? 0.5 : 1 },
            ]}
          >
            <Text style={[styles.cancelText, { color: palette.text }]}>
              Batal
            </Text>
          </Pressable>

          <Text style={[styles.headerTitle, { color: palette.text }]}>
            Postingan baru
          </Text>

          <Pressable
            onPress={() => {
              void handleSubmit();
            }}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.postButton,
              {
                backgroundColor: palette.primary,
                opacity: !canSubmit ? 0.45 : pressed ? 0.75 : 1,
              },
            ]}
          >
            {isCreating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>Posting</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <View style={styles.composerRow}>
            <Avatar
              displayName={displayName}
              username={username}
              avatarUrl={user?.avatarUrl ?? null}
              size={46}
            />

            <View style={styles.composerBody}>
              <View style={styles.authorRow}>
                <Text
                  style={[styles.displayName, { color: palette.text }]}
                  numberOfLines={1}
                >
                  {displayName}
                </Text>
                <Text
                  style={[styles.username, { color: palette.textMuted }]}
                  numberOfLines={1}
                >
                  @{username}
                </Text>
              </View>

              <TextInput
                ref={captionRef}
                multiline
                maxLength={CAPTION_LIMIT}
                placeholder="Apa yang ingin kamu bagikan?"
                placeholderTextColor={palette.textMuted}
                value={caption}
                onChangeText={setCaption}
                editable={!isCreating}
                textAlignVertical="top"
                style={[
                  styles.captionInput,
                  { color: palette.text },
                ]}
              />

              {imageUri ? (
                <View style={styles.previewWrap}>
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.preview}
                    contentFit="cover"
                  />
                  <Pressable
                    onPress={() => setImageUri(null)}
                    disabled={isCreating}
                    style={[
                      styles.removeImageButton,
                      { backgroundColor: palette.surface },
                    ]}
                  >
                    <X size={16} color={palette.text} />
                  </Pressable>
                </View>
              ) : null}

              {showLocationInput || cleanLocation ? (
                <View
                  style={[
                    styles.locationInputWrap,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <MapPin size={17} color={palette.textMuted} />
                  <TextInput
                    placeholder="Tambah lokasi"
                    placeholderTextColor={palette.textMuted}
                    value={location}
                    onChangeText={setLocation}
                    editable={!isCreating}
                    autoFocus={showLocationInput && !cleanLocation}
                    style={[styles.locationInput, { color: palette.text }]}
                  />
                  <Pressable onPress={clearLocation} disabled={isCreating}>
                    <X size={16} color={palette.textMuted} />
                  </Pressable>
                </View>
              ) : null}

              <View style={[styles.toolbar, { borderTopColor: palette.border }]}>
                <View style={styles.toolbarActions}>
                  <Pressable
                    onPress={() => {
                      void pickImage();
                    }}
                    disabled={isCreating}
                    style={({ pressed }) => [
                      styles.iconButton,
                      {
                        backgroundColor: palette.surfaceMuted,
                        opacity: pressed || isCreating ? 0.55 : 1,
                      },
                    ]}
                  >
                    <ImagePlus size={20} color={palette.primary} />
                  </Pressable>

                  <Pressable
                    onPress={handleLocationPress}
                    disabled={isCreating}
                    style={({ pressed }) => [
                      styles.iconButton,
                      {
                        backgroundColor: palette.surfaceMuted,
                        opacity: pressed || isCreating ? 0.55 : 1,
                      },
                    ]}
                  >
                    <MapPin size={20} color={palette.primary} />
                  </Pressable>
                </View>

                <Text style={[styles.counter, { color: palette.textMuted }]}>
                  {caption.length}/{CAPTION_LIMIT}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    minWidth: 74,
    height: 40,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '800',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '900',
  },
  postButton: {
    minWidth: 74,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  composerBody: {
    flex: 1,
    minWidth: 0,
  },
  authorRow: {
    minHeight: 44,
    justifyContent: 'center',
  },
  displayName: {
    fontSize: 15,
    fontWeight: '900',
  },
  username: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: '700',
  },
  captionInput: {
    minHeight: 148,
    paddingTop: 8,
    paddingBottom: 10,
    fontSize: 18,
    lineHeight: 26,
  },
  previewWrap: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 4 / 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInputWrap: {
    minHeight: 44,
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
  },
  toolbar: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    fontSize: 12,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
