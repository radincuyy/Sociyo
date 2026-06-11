import { Moon, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

export function ThemeToggle() {
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);
  const palette = colors[mode];
  const isDark = mode === 'dark';
  const Icon = isDark ? Moon : Sun;

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: isDark }}
      onPress={toggleMode}
      style={({ pressed }) => [
        styles.toggle,
        {
          backgroundColor: palette.surfaceMuted,
          borderColor: palette.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: palette.surface }]}>
        <Icon size={18} color={palette.primary} />
      </View>
      <Text style={[styles.label, { color: palette.text }]}>{isDark ? 'Dark' : 'Light'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
