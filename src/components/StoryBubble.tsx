import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import type { Story } from '../data/mockData';
import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';

type StoryBubbleProps = {
  story: Story;
  onPress: () => void;
};

export function StoryBubble({ story, onPress }: StoryBubbleProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (!story.viewed) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 3200, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [rotation, story.viewed]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View style={[styles.ring, ringStyle]}>
        <LinearGradient
          colors={
            story.viewed
              ? [palette.border, palette.border]
              : [palette.accent, palette.primary, palette.success]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      <View style={[styles.avatarFrame, { backgroundColor: palette.surface }]}>
        <Image source={{ uri: story.avatarUrl }} style={styles.avatar} contentFit="cover" />
      </View>
      <Text numberOfLines={1} style={[styles.name, { color: palette.text }]}>
        {story.author}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 76,
    alignItems: 'center',
    gap: 6,
  },
  ring: {
    position: 'absolute',
    top: -2,
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  gradient: {
    flex: 1,
    borderRadius: 32,
  },
  avatarFrame: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 3,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 27,
  },
  name: {
    width: 70,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
});
