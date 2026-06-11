import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

const animations = [
  {
    name: 'Story ring rotation',
    library: 'react-native-reanimated',
    hook: 'useSharedValue, useAnimatedStyle, withRepeat',
  },
  {
    name: 'Post card stagger fade-in',
    library: 'react-native-reanimated',
    hook: 'useSharedValue, useAnimatedStyle, withDelay',
  },
  {
    name: 'Double-tap heart burst',
    library: 'react-native-reanimated + react-native-gesture-handler',
    hook: 'Gesture.Exclusive, useSharedValue, withSequence',
  },
  {
    name: 'Story progress bar pause/resume',
    library: 'react-native-reanimated',
    hook: 'withTiming, cancelAnimation',
  },
  {
    name: 'Photo viewer pinch and pan',
    library: 'react-native-reanimated + react-native-gesture-handler',
    hook: 'Gesture.Simultaneous, useAnimatedStyle',
  },
];

export function AnimationCatalogScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.title, { color: palette.text }]}>Animation Catalog</Text>
        <Text style={[styles.subtitle, { color: palette.textMuted }]}>
          Draft deliverable D1-2. Setiap animasi dicatat sejak awal agar siap dibawa ke
          dokumentasi final.
        </Text>
        <View style={styles.list}>
          {animations.map((animation) => (
            <View
              key={animation.name}
              style={[styles.card, { backgroundColor: palette.surface, borderColor: palette.border }]}
            >
              <Text style={[styles.name, { color: palette.text }]}>{animation.name}</Text>
              <Text style={[styles.meta, { color: palette.textMuted }]}>Library: {animation.library}</Text>
              <Text style={[styles.meta, { color: palette.textMuted }]}>Hook: {animation.hook}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: 12,
    paddingBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
  },
  list: {
    marginTop: 18,
    gap: 10,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    fontSize: 13,
    lineHeight: 19,
  },
});
