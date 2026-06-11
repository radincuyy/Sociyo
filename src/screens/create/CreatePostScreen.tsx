import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { ImagePlus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function CreatePostScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.85,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0]?.uri ?? null);
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
              Nanti file ini diupload ke Firebase Storage.
            </Text>
          </View>
        )}
      </Pressable>
      <TextInput
        multiline
        placeholder="Tulis caption..."
        placeholderTextColor={palette.textMuted}
        style={[
          styles.caption,
          { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text },
        ]}
      />
      <PrimaryButton onPress={() => undefined}>Simpan draft</PrimaryButton>
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
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    textAlignVertical: 'top',
    fontSize: 15,
  },
});
