import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
  style?: ViewStyle;
  padded?: boolean;
}>;

export function Screen({ children, style, padded = true }: ScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: palette.background }]}>
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
