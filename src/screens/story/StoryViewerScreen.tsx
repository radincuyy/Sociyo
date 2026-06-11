import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Send } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Screen } from '../../components/Screen';
import { stories } from '../../data/mockData';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type StoryViewerProps = NativeStackScreenProps<RootStackParamList, 'StoryViewer'>;

const STORY_DURATION = 4200;

export function StoryViewerScreen({ navigation, route }: StoryViewerProps) {
  const initialIndex = Math.max(
    0,
    stories.findIndex((story) => story.id === route.params.storyId),
  );
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeStory = stories[activeIndex] ?? stories[0];
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const progress = useSharedValue(0);

  const goNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current >= stories.length - 1) {
        navigation.goBack();
        return current;
      }
      return current + 1;
    });
  }, [navigation]);

  const goPrev = useCallback(() => {
    setActiveIndex((current) => Math.max(0, current - 1));
  }, []);

  const startProgress = useCallback(
    (from = 0) => {
      progress.value = from;
      progress.value = withTiming(1, { duration: (1 - from) * STORY_DURATION }, (finished) => {
        if (finished) {
          runOnJS(goNext)();
        }
      });
    },
    [goNext, progress],
  );

  useEffect(() => {
    startProgress(0);
  }, [activeIndex, startProgress]);

  const progressStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  const segments = useMemo(() => stories.map((story) => story.id), []);

  return (
    <Screen padded={false} style={{ backgroundColor: '#000000' }}>
      <Image source={{ uri: activeStory.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      <View style={styles.overlay}>
        <View style={styles.progressRow}>
          {segments.map((id, index) => (
            <View key={id} style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor:
                      index < activeIndex ? '#FFFFFF' : index === activeIndex ? '#FFFFFF' : '#777777',
                  },
                  index === activeIndex && progressStyle,
                  index < activeIndex && styles.completed,
                ]}
              />
            </View>
          ))}
        </View>

        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Image source={{ uri: activeStory.avatarUrl }} style={styles.avatar} contentFit="cover" />
          <Text style={styles.author}>{activeStory.author}</Text>
        </View>

        <View style={styles.touchLayer}>
          <Pressable
            style={styles.touchHalf}
            onPress={goPrev}
            onPressIn={() => cancelAnimation(progress)}
            onPressOut={() => startProgress(progress.value)}
          />
          <Pressable
            style={styles.touchHalf}
            onPress={goNext}
            onPressIn={() => cancelAnimation(progress)}
            onPressOut={() => startProgress(progress.value)}
          />
        </View>

        <View style={[styles.replyBar, { borderColor: 'rgba(255,255,255,0.35)' }]}>
          <TextInput
            placeholder="Reply story..."
            placeholderTextColor="rgba(255,255,255,0.72)"
            style={styles.replyInput}
          />
          <Pressable style={[styles.sendButton, { backgroundColor: palette.primary }]}>
            <Send size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 5,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.24)',
  },
  progressFill: {
    flex: 1,
    transformOrigin: 'left',
  },
  completed: {
    transform: [{ scaleX: 1 }],
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  author: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  touchLayer: {
    flex: 1,
    flexDirection: 'row',
  },
  touchHalf: {
    flex: 1,
  },
  replyBar: {
    minHeight: 58,
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  replyInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
