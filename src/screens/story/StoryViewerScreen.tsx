import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, TextInput, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';
import { useEffect, useRef, useState } from 'react';

import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import { useStoryStore } from '../../store/useStoryStore';

type StoryViewerProps = NativeStackScreenProps<RootStackParamList, 'StoryViewer'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_DURATION = 5000;

export function StoryViewerScreen({ navigation, route }: StoryViewerProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const userId = route.params.userId;
  const fetchStories = useStoryStore((s) => s.fetchStories);
  const groups = useStoryStore((s) => s.groups);
  const markViewed = useStoryStore((s) => s.markViewed);

  const [groupIndex, setGroupIndex] = useState(() => Math.max(0, groups.findIndex((g) => g.userId === userId)));
  const [currentIndex, setCurrentIndex] = useState(0);
  const markedRef = useRef<Record<string, boolean>>({});

  const progress = useSharedValue(0);
  const isPausedRef = useRef(false);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];

  useEffect(() => {
    void fetchStories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // when groups update, ensure groupIndex matches userId
    const idx = Math.max(0, groups.findIndex((g) => g.userId === userId));
    setGroupIndex(idx);
    setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, userId]);

  useEffect(() => {
    startProgress();
    // mark viewed once displayed
    const story = stories[currentIndex];
    if (story && !markedRef.current[story.id]) {
      markedRef.current[story.id] = true;
      void markViewed(story.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, groupIndex, stories.length]);

  function startProgress() {
    progress.value = 0;
    const duration = STORY_DURATION;
    progress.value = withTiming(1, { duration }, (finished) => {
      if (finished) runOnJS(onProgressComplete)();
    });
  }

  function pauseProgress() {
    isPausedRef.current = true;
    cancelAnimation(progress);
  }

  function resumeProgress() {
    isPausedRef.current = false;
    const remaining = Math.max(0, 1 - progress.value);
    if (remaining <= 0) {
      void onProgressComplete();
      return;
    }
    progress.value = withTiming(1, { duration: remaining * STORY_DURATION }, (finished) => {
      if (finished) runOnJS(onProgressComplete)();
    });
  }

  function onProgressComplete() {
    // advance within group, or move to next group
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      // move to next group if available
      if (groupIndex < groups.length - 1) {
        setGroupIndex((g) => g + 1);
        setCurrentIndex(0);
      } else {
        navigation.goBack();
      }
    }
  }

  function goNextStory() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setCurrentIndex(0);
    } else {
      navigation.goBack();
    }
  }

  function goPrevStory() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      const prevStories = groups[groupIndex - 1]?.stories ?? [];
      setCurrentIndex(Math.max(0, prevStories.length - 1));
    } else {
      // nothing
    }
  }

  function swipeToNextGroup() {
    if (groupIndex < groups.length - 1) {
      setGroupIndex((g) => g + 1);
      setCurrentIndex(0);
    }
  }

  function swipeToPrevGroup() {
    if (groupIndex > 0) {
      setGroupIndex((g) => g - 1);
      setCurrentIndex(0);
    }
  }

  const pan = Gesture.Pan().onEnd((e) => {
    const vx = e.velocityX ?? 0;
    const tx = e.translationX ?? 0;
    if (tx < -100 || vx < -500) {
      runOnJS(swipeToNextGroup)();
    } else if (tx > 100 || vx > 500) {
      runOnJS(swipeToPrevGroup)();
    }
  });

  const longPress = Gesture.LongPress().onStart(() => {
    runOnJS(pauseProgress)();
  }).onEnd(() => {
    runOnJS(resumeProgress)();
  });

  const composed = Gesture.Simultaneous(pan, longPress);

  const progressBarStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  useEffect(() => {
    // whenever group or currentIndex changes, restart progress
    startProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, currentIndex]);

  if (!group || stories.length === 0) {
    return (
      <Screen padded={false}>
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.title, { color: palette.text }]}>Story</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: palette.text }]}>Story tidak ditemukan</Text>
        </View>
      </Screen>
    );
  }

  const activeStory = stories[currentIndex];

  return (
    <Screen padded={false}>
      <GestureDetector gesture={composed}>
        <View style={[styles.container, { backgroundColor: '#000' }]}>
          {/* Progress bars */}
          <View style={styles.progressRow}>
            {stories.map((s, idx) => (
              <View key={s.id} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    { backgroundColor: palette.surface },
                    idx < currentIndex ? { transform: [{ scaleX: 1 }] } : idx > currentIndex ? { transform: [{ scaleX: 0 }] } : progressBarStyle,
                  ]}
                />
              </View>
            ))}
          </View>

          {/* Header */}
          <View style={styles.headerOverlay}>
            <View style={styles.headerLeft}>
              <View style={styles.avatarWrap}>
                {/* avatar placeholder */}
                <Text style={[styles.avatarLetter, { color: palette.text }]}> {group.author.slice(0,1).toUpperCase()}</Text>
              </View>
              <Text style={[styles.headerTitle, { color: palette.text }]}>{group.author}</Text>
            </View>

            <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
              <X size={22} color={palette.text} />
            </Pressable>
          </View>

          {/* Image area with taps */}
          <View style={styles.imageArea}>
            <Image source={{ uri: activeStory.imageUrl ?? undefined }} style={styles.image} contentFit="cover" />

            <View style={styles.tapRow} pointerEvents="box-none">
              <Pressable style={styles.leftTap} onPress={goPrevStory} />
              <Pressable style={styles.rightTap} onPress={goNextStory} />
            </View>
          </View>

          {/* Reply input */}
          <View style={styles.replyWrap}>
            <TextInput placeholder="Kirim balasan..." placeholderTextColor={palette.textMuted} style={[styles.input, { color: palette.text, borderColor: palette.border }]} />
          </View>
        </View>
      </GestureDetector>
    </Screen>
  );
}

const BAR_GAP = 6;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, fontWeight: '700' },

  progressRow: {
    flexDirection: 'row',
    padding: 12,
    gap: BAR_GAP,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    borderRadius: 2,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    transform: [{ scaleX: 0 }],
  },

  headerOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  avatarLetter: { fontWeight: '900' },
  headerTitle: { fontWeight: '800' },

  imageArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },

  tapRow: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, flexDirection: 'row' },
  leftTap: { flex: 1 },
  rightTap: { flex: 1 },

  replyWrap: { padding: 12, borderTopWidth: 1 },
  input: { height: 44, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
});
