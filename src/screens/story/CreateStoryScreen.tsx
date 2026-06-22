import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, ImagePlus } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useStoryStore } from '../../store/useStoryStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type CreateStoryScreenProps = NativeStackScreenProps<RootStackParamList, 'CreateStory'>;

export function CreateStoryScreen({ navigation }: CreateStoryScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const createStory = useStoryStore((state) => state.createStory);
  const creating = useStoryStore((state) => state.creating);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  };

  const submitStory = async () => {
    if (!imageUri || creating) return;

    try {
      await createStory(imageUri, caption);
      navigation.goBack();
    } catch {
      Alert.alert('Gagal', 'Story belum berhasil diunggah. Coba lagi.');
    }
  };

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]}>Buat Story</Text>
          <View style={styles.iconButton} />
        </View>

        <View style={styles.content}>
          <Pressable
            onPress={pickImage}
            style={[
              styles.preview,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} contentFit="cover" />
            ) : (
              <View style={styles.emptyPreview}>
                <ImagePlus size={34} color={palette.primary} />
                <Text style={[styles.emptyTitle, { color: palette.text }]}>Pilih foto story</Text>
                <Text style={[styles.emptyText, { color: palette.textMuted }]}>
                  Story akan aktif selama 24 jam.
                </Text>
              </View>
            )}
          </Pressable>

          <TextInput
            placeholder="Tambahkan caption (opsional)"
            placeholderTextColor={palette.textMuted}
            value={caption}
            onChangeText={setCaption}
            editable={!creating}
            maxLength={120}
            style={[
              styles.caption,
              {
                backgroundColor: palette.surface,
                borderColor: palette.border,
                color: palette.text,
              },
            ]}
          />

          <PrimaryButton onPress={submitStory} disabled={!imageUri || creating}>
            {creating ? 'Mengunggah...' : 'Bagikan Story'}
          </PrimaryButton>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  header: {
    height: 54,
    borderBottomWidth: 1,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 14,
  },
  preview: {
    flex: 1,
    maxHeight: 560,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
  },
  caption: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
  },
});
