import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type PrimaryButtonProps = PropsWithChildren<{
  onPress: () => void;
  variant?: 'primary' | 'ghost';
}>;

export function PrimaryButton({ children, onPress, variant = 'primary' }: PrimaryButtonProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const isGhost = variant === 'ghost';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isGhost ? palette.surfaceMuted : palette.primary,
          opacity: pressed ? 0.82 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: isGhost ? palette.text : '#FFFFFF' }]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
