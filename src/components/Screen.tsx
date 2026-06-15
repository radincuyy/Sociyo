import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  padded?: boolean;
  edges?: Edge[];
}>;

export function Screen({ children, style, padded = true, edges = ['top'] }: ScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]} edges={edges}>
      <View style={[styles.content, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
  },
});
