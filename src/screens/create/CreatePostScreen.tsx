import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ImagePlus, MapPin } from 'lucide-react-native';
import { useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { usePostStore } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { MainTabParamList } from '../../types/navigation';

type CreateNav = BottomTabNavigationProp<MainTabParamList, 'Create'>;

export function CreatePostScreen() {
  const navigation = useNavigation<CreateNav>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const createPost = usePostStore((state) => state.createPost);
  const isCreating = usePostStore((state) => state.isCreating);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const captionRef = useRef<TextInput>(null);

  const canSubmit = caption.trim().length > 0 && !isCreating;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  };

  const resetForm = () => {
    setImageUri(null);
    setCaption('');
    setLocation('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createPost({
        caption,
        imageUri,
        location: location.trim() || null,
      });

      resetForm();
      navigation.navigate('Feed');
    } catch {
      Alert.alert('Gagal', 'Tidak bisa membuat post. Coba lagi.');
    }
  };

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Create Post</Text>

      <Pressable
        onPress={pickImage}
        style={[
          styles.uploadBox,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} contentFit="cover" />
        ) : (
          <View style={styles.emptyState}>
            <ImagePlus size={30} color={palette.primary} />
            <Text style={[styles.uploadText, { color: palette.text }]}>Pilih foto</Text>
            <Text style={[styles.uploadHint, { color: palette.textMuted }]}>
              Foto akan diupload ke Firebase Storage.
            </Text>
          </View>
        )}
      </Pressable>

      <TextInput
        ref={captionRef}
        multiline
        placeholder="Tulis caption..."
        placeholderTextColor={palette.textMuted}
        value={caption}
        onChangeText={setCaption}
        editable={!isCreating}
        style={[
          styles.caption,
          { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
        ]}
      />

      <View
        style={[
          styles.locationBox,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <MapPin size={18} color={palette.textMuted} />
        <TextInput
          placeholder="Tambah lokasi (opsional)"
          placeholderTextColor={palette.textMuted}
          value={location}
          onChangeText={setLocation}
          editable={!isCreating}
          style={[styles.locationInput, { color: palette.text }]}
        />
      </View>

      <PrimaryButton onPress={handleSubmit} disabled={!canSubmit}>
        {isCreating ? 'Mengupload...' : 'Posting'}
      </PrimaryButton>

      {imageUri ? (
        <Pressable onPress={resetForm} style={styles.resetButton}>
          <Text style={[styles.resetText, { color: palette.textMuted }]}>Reset form</Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 26,
    fontWeight: '900',
  },
  uploadBox: {
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  uploadText: {
    fontSize: 17,
    fontWeight: '900',
  },
  uploadHint: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
  caption: {
    minHeight: 120,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  locationBox: {
    minHeight: 48,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 14,
  },
  resetButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
