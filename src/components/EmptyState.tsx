import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type EmptyStateProps = {
  title: string;
  message: string;
  icon: ReactNode;
};

export function EmptyState({ title, message, icon }: EmptyStateProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <View style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      {icon}
      <Text style={[styles.title, { color: palette.text }]}>{title}</Text>
      <Text style={[styles.message, { color: palette.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  title: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
