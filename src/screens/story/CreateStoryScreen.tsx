import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ImagePlus, X } from 'lucide-react-native';
import { useState } from 'react';

import { Screen } from '../../components/Screen';
import { useStoryStore } from '../../store/useStoryStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type CreateStoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CreateStory'
>;

export function CreateStoryScreen({ navigation }: CreateStoryScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const createStory = useStoryStore((state) => state.createStory);
  const creating = useStoryStore((state) => state.creating);
  const [imageUri, setImageUri] = useState<string | null>(null);

  async function pickImage(): Promise<void> {
    if (creating) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.9,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
    }
  }

  async function submitStory(): Promise<void> {
    if (!imageUri || creating) {
      return;
    }

    try {
      await createStory(imageUri, '');
      navigation.goBack();
    } catch {
      Alert.alert('Gagal', 'Story belum berhasil diunggah. Coba lagi.');
    }
  }

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={[styles.root, { backgroundColor: palette.background }]}>
        <View
          style={[
            styles.header,
            {
              borderBottomColor: palette.border,
              backgroundColor: palette.background,
            },
          ]}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            disabled={creating}
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed || creating ? 0.55 : 1 },
            ]}
          >
            <X size={22} color={palette.text} />
          </Pressable>

          <Text style={[styles.title, { color: palette.text }]}>
            Buat Story
          </Text>

          <Pressable
            onPress={() => {
              void submitStory();
            }}
            disabled={!imageUri || creating}
            style={({ pressed }) => [
              styles.shareButton,
              {
                backgroundColor: palette.primary,
                opacity: !imageUri || creating ? 0.42 : pressed ? 0.75 : 1,
              },
            ]}
          >
            {creating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.shareText}>Bagikan</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.content}>
          <Pressable
            onPress={() => {
              void pickImage();
            }}
            disabled={creating}
            style={({ pressed }) => [
              styles.preview,
              {
                borderColor: imageUri ? 'transparent' : palette.border,
                opacity: pressed && !creating ? 0.88 : 1,
              },
            ]}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={styles.image}
                contentFit="contain"
              />
            ) : (
              <View style={styles.emptyPreview}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: palette.surfaceMuted },
                  ]}
                >
                  <ImagePlus size={30} color={palette.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: '#FFFFFF' }]}>
                  Pilih foto story
                </Text>
                <Text style={styles.emptyText}>
                  Foto akan ditampilkan utuh tanpa crop.
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        <View
          style={[
            styles.footer,
            {
              borderTopColor: palette.border,
              backgroundColor: palette.background,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              void pickImage();
            }}
            disabled={creating}
            style={({ pressed }) => [
              styles.pickButton,
              {
                backgroundColor: palette.surfaceMuted,
                opacity: pressed || creating ? 0.6 : 1,
              },
            ]}
          >
            <ImagePlus size={20} color={palette.primary} />
            <Text style={[styles.pickText, { color: palette.text }]}>
              {imageUri ? 'Ganti foto' : 'Pilih foto'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  closeButton: {
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
  shareButton: {
    minWidth: 82,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: {
    width: '100%',
    maxWidth: 430,
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  emptyPreview: {
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 26,
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    maxWidth: 220,
    color: 'rgba(255,255,255,0.72)',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  footer: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    justifyContent: 'center',
  },
  pickButton: {
    minHeight: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  pickText: {
    fontSize: 14,
    fontWeight: '900',
  },
});
