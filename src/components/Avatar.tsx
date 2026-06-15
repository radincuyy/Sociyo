import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type AvatarProps = {
  displayName: string;
  username: string;
  avatarUrl: string | null;
  size: number;
};

function getAvatarInitial(displayName: string, username: string) {
  const initial = displayName.trim().slice(0, 1) || username.trim().slice(0, 1) || '?';
  return initial.toUpperCase();
}

export function Avatar({ displayName, username, avatarUrl, size }: AvatarProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const radius = size / 2;
  const initialFontSize = Math.max(16, Math.floor(size * 0.37));

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius: radius }}
        contentFit="cover"
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: palette.surfaceMuted,
        },
      ]}
    >
      <Text style={[styles.initial, { color: palette.text, fontSize: initialFontSize }]}>
        {getAvatarInitial(displayName, username)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    fontWeight: '900',
  },
});
