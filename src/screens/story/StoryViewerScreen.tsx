import { Image } from 'expo-image';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MessageCircle, Send, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  cancelAnimation,
  runOnJS,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useStoryStore } from '../../store/useStoryStore';
import { colors } from '../../theme/colors';
import { useThemeStore } from '../../store/useThemeStore';
import type { RootStackParamList } from '../../types/navigation';

type StoryViewerProps = NativeStackScreenProps<RootStackParamList, 'StoryViewer'>;

const STORY_DURATION = 5000;
const SHEET_HEIGHT = 238;

type StoryProgressSegmentProps = {
  currentIndex: number;
  index: number;
  progress: SharedValue<number>;
};

function StoryProgressSegment({
  currentIndex,
  index,
  progress,
}: StoryProgressSegmentProps) {
  const progressStyle = useAnimatedStyle(() => {
    if (index < currentIndex) {
      return { width: '100%' };
    }

    if (index > currentIndex) {
      return { width: '0%' };
    }

    return {
      width: `${Math.max(0, Math.min(1, progress.value)) * 100}%`,
    };
  }, [currentIndex, index]);

  return (
    <View style={styles.progressTrack}>
      <Animated.View style={[styles.progressFill, progressStyle]} />
    </View>
  );
}

export function StoryViewerScreen({ navigation, route }: StoryViewerProps) {
  const { width: screenWidth } = useWindowDimensions();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const fetchStories = useStoryStore((state) => state.fetchStories);
  const groups = useStoryStore((state) => state.groups);
  const markViewed = useStoryStore((state) => state.markViewed);
  const sendReply = useStoryStore((state) => state.sendReply);
  const replying = useStoryStore((state) => state.replying);
  const replyError = useStoryStore((state) => state.replyError);
  const clearReplyError = useStoryStore((state) => state.clearReplyError);

  const userId = route.params.userId;
  const [groupIndex, setGroupIndex] = useState(() =>
    Math.max(0, groups.findIndex((group) => group.userId === userId)),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [replyText, setReplyText] = useState('');
  const [replySheetMounted, setReplySheetMounted] = useState(false);
  const markedRef = useRef<Record<string, boolean>>({});
  const replyOpenRef = useRef(false);
  const transitionDirectionRef = useRef<1 | -1>(1);
  const progress = useSharedValue(0);
  const sheetProgress = useSharedValue(0);
  const storyOffset = useSharedValue(0);
  const storyOpacity = useSharedValue(1);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];
  const activeStory = stories[currentIndex];
  const isOwnStory = Boolean(currentUserId && group?.userId === currentUserId);

  function onProgressComplete() {
    transitionDirectionRef.current = 1;

    if (currentIndex < stories.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    if (groupIndex < groups.length - 1) {
      setGroupIndex((index) => index + 1);
      setCurrentIndex(0);
      return;
    }

    navigation.goBack();
  }

  function startProgress() {
    progress.value = 0;

    if (replyOpenRef.current || !activeStory) {
      return;
    }

    progress.value = withTiming(1, { duration: STORY_DURATION }, (finished) => {
      if (finished) {
        runOnJS(onProgressComplete)();
      }
    });
  }

  function pauseProgress() {
    cancelAnimation(progress);
  }

  function resumeProgress() {
    if (replyOpenRef.current) {
      return;
    }

    const remaining = Math.max(0, 1 - progress.value);

    if (remaining === 0) {
      onProgressComplete();
      return;
    }

    progress.value = withTiming(
      1,
      { duration: remaining * STORY_DURATION },
      (finished) => {
        if (finished) {
          runOnJS(onProgressComplete)();
        }
      },
    );
  }

  function goNextStory() {
    transitionDirectionRef.current = 1;

    if (currentIndex < stories.length - 1) {
      setCurrentIndex((index) => index + 1);
      return;
    }

    if (groupIndex < groups.length - 1) {
      setGroupIndex((index) => index + 1);
      setCurrentIndex(0);
      return;
    }

    navigation.goBack();
  }

  function goPreviousStory() {
    transitionDirectionRef.current = -1;

    if (currentIndex > 0) {
      setCurrentIndex((index) => index - 1);
      return;
    }

    if (groupIndex > 0) {
      const previousStories = groups[groupIndex - 1]?.stories ?? [];
      setGroupIndex((index) => index - 1);
      setCurrentIndex(Math.max(0, previousStories.length - 1));
    }
  }

  function swipeToNextGroup() {
    if (groupIndex < groups.length - 1) {
      transitionDirectionRef.current = 1;
      setGroupIndex((index) => index + 1);
      setCurrentIndex(0);
    }
  }

  function swipeToPreviousGroup() {
    if (groupIndex > 0) {
      transitionDirectionRef.current = -1;
      setGroupIndex((index) => index - 1);
      setCurrentIndex(0);
    }
  }

  function openReplySheet() {
    if (isOwnStory || !activeStory) {
      return;
    }

    clearReplyError();
    replyOpenRef.current = true;
    pauseProgress();
    sheetProgress.value = 0;
    setReplySheetMounted(true);
    requestAnimationFrame(() => {
      sheetProgress.value = withSpring(1, {
        damping: 19,
        stiffness: 190,
      });
    });
  }

  function finishClosingReplySheet() {
    replyOpenRef.current = false;
    setReplySheetMounted(false);
    clearReplyError();
    resumeProgress();
  }

  function closeReplySheet() {
    if (replying) {
      return;
    }

    Keyboard.dismiss();
    sheetProgress.value = withTiming(0, { duration: 220 }, (finished) => {
      if (finished) {
        runOnJS(finishClosingReplySheet)();
      }
    });
  }

  async function submitReply() {
    const cleanReply = replyText.trim();

    if (!activeStory || !group || !cleanReply || replying) {
      return;
    }

    try {
      const result = await sendReply(
        activeStory.id,
        activeStory.imageUrl ?? null,
        group.userId,
        cleanReply,
      );
      setReplyText('');
      closeReplySheet();

      if (result.pushDelivery === 'not_registered') {
        Alert.alert(
          'Pesan terkirim',
          'Balasan sudah masuk ke Pesan, tetapi penerima belum mengaktifkan notifikasi perangkat.',
        );
      } else if (result.pushDelivery === 'failed') {
        Alert.alert(
          'Pesan terkirim',
          'Balasan sudah masuk ke Pesan, tetapi push notification gagal dikirim.',
        );
      }
    } catch {
      return;
    }
  }

  useEffect(() => {
    void fetchStories();
  }, [fetchStories]);

  useEffect(() => {
    const matchingGroupIndex = groups.findIndex(
      (storyGroup) => storyGroup.userId === userId,
    );

    if (
      matchingGroupIndex >= 0 &&
      groups[groupIndex]?.userId !== userId
    ) {
      transitionDirectionRef.current = 1;
      setGroupIndex(matchingGroupIndex);
      setCurrentIndex(0);
    }
  }, [groupIndex, groups, userId]);

  useEffect(() => {
    if (!activeStory) {
      return;
    }

    storyOffset.value = transitionDirectionRef.current * screenWidth * 0.08;
    storyOpacity.value = 0.58;
    storyOffset.value = withTiming(0, { duration: 260 });
    storyOpacity.value = withTiming(1, { duration: 220 });
    startProgress();

    if (!markedRef.current[activeStory.id]) {
      markedRef.current[activeStory.id] = true;
      void markViewed(activeStory.id);
    }

    return () => {
      cancelAnimation(progress);
    };
  }, [activeStory?.id, groupIndex, screenWidth]);

  const horizontalPan = Gesture.Pan().onEnd((event) => {
    const velocityX = event.velocityX ?? 0;
    const translationX = event.translationX ?? 0;

    if (translationX < -screenWidth * 0.24 || velocityX < -500) {
      runOnJS(swipeToNextGroup)();
    } else if (translationX > screenWidth * 0.24 || velocityX > 500) {
      runOnJS(swipeToPreviousGroup)();
    }
  });

  const holdGesture = Gesture.LongPress()
    .minDuration(120)
    .onBegin(() => {
      runOnJS(pauseProgress)();
    })
    .onFinalize(() => {
      runOnJS(resumeProgress)();
    });

  const storyGesture = Gesture.Simultaneous(horizontalPan, holdGesture);

  const storyTransitionStyle = useAnimatedStyle(() => ({
    opacity: storyOpacity.value,
    transform: [{ translateX: storyOffset.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: sheetProgress.value * 0.58,
  }));

  const replySheetStyle = useAnimatedStyle(() => ({
    opacity: sheetProgress.value,
    transform: [
      {
        translateY: (1 - sheetProgress.value) * SHEET_HEIGHT,
      },
    ],
  }));

  if (!group || stories.length === 0 || !activeStory) {
    return (
      <Screen padded={false}>
        <View style={[styles.emptyHeader, { borderBottomColor: palette.border }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <X size={22} color={palette.text} />
          </Pressable>
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Story</Text>
          <View style={styles.iconButton} />
        </View>
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyText, { color: palette.text }]}>
            Story tidak ditemukan
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <GestureDetector gesture={storyGesture}>
          <View style={styles.storyContent}>
            <Animated.View style={[styles.imageLayer, storyTransitionStyle]}>
              <Image
                source={{ uri: activeStory.imageUrl ?? undefined }}
                style={styles.image}
                contentFit="contain"
              />
            </Animated.View>

            <View style={styles.scrim} pointerEvents="none" />

            <View style={styles.progressRow}>
              {stories.map((story, index) => (
                <StoryProgressSegment
                  key={story.id}
                  currentIndex={currentIndex}
                  index={index}
                  progress={progress}
                />
              ))}
            </View>

            <View style={styles.headerOverlay}>
              <View style={styles.headerLeft}>
                {group.avatarUrl ? (
                  <Image
                    source={{ uri: group.avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarFallback}>
                    <Text style={styles.avatarLetter}>
                      {group.author.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.headerTitle}>{group.author}</Text>
              </View>

              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.iconButton}
              >
                <X size={22} color="#FFFFFF" />
              </Pressable>
            </View>

            <View style={styles.tapRow} pointerEvents="box-none">
              <Pressable style={styles.tapZone} onPress={goPreviousStory} />
              <Pressable style={styles.tapZone} onPress={goNextStory} />
            </View>
          </View>
        </GestureDetector>

        <View style={styles.replyLauncherWrap}>
          {isOwnStory ? (
            <View style={styles.ownStoryLabel}>
              <Text style={styles.ownStoryText}>Story Anda</Text>
            </View>
          ) : (
            <Pressable
              onPress={openReplySheet}
              style={({ pressed }) => [
                styles.replyLauncher,
                { opacity: pressed ? 0.72 : 1 },
              ]}
            >
              <MessageCircle size={18} color="#FFFFFF" />
              <Text style={styles.replyLauncherText}>Kirim balasan...</Text>
            </Pressable>
          )}
        </View>

        {replySheetMounted ? (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Pressable
              onPress={closeReplySheet}
              style={StyleSheet.absoluteFill}
            >
              <Animated.View
                style={[styles.backdrop, backdropStyle]}
                pointerEvents="none"
              />
            </Pressable>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardSheet}
              pointerEvents="box-none"
            >
              <Animated.View
                style={[
                  styles.replySheet,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                  },
                  replySheetStyle,
                ]}
              >
                <View
                  style={[
                    styles.sheetGrabber,
                    { backgroundColor: palette.border },
                  ]}
                />
                <View style={styles.sheetHeader}>
                  <View style={styles.sheetHeaderCopy}>
                    <Text style={[styles.sheetTitle, { color: palette.text }]}>
                      Balas story
                    </Text>
                    <Text
                      style={[styles.sheetSubtitle, { color: palette.textMuted }]}
                      numberOfLines={1}
                    >
                      Kepada {group.author}
                    </Text>
                  </View>
                  <Pressable
                    onPress={closeReplySheet}
                    disabled={replying}
                    style={styles.sheetClose}
                  >
                    <X size={20} color={palette.text} />
                  </Pressable>
                </View>

                <View style={styles.replyComposer}>
                  <TextInput
                    autoFocus
                    multiline
                    maxLength={500}
                    value={replyText}
                    onChangeText={setReplyText}
                    editable={!replying}
                    placeholder="Tulis balasan..."
                    placeholderTextColor={palette.textMuted}
                    style={[
                      styles.replyInput,
                      {
                        color: palette.text,
                        backgroundColor: palette.background,
                        borderColor: replyError
                          ? palette.accent
                          : palette.border,
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => {
                      void submitReply();
                    }}
                    disabled={!replyText.trim() || replying}
                    style={({ pressed }) => [
                      styles.sendButton,
                      {
                        backgroundColor: palette.primary,
                        opacity:
                          !replyText.trim() || replying
                            ? 0.42
                            : pressed
                              ? 0.76
                              : 1,
                      },
                    ]}
                  >
                    {replying ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Send size={18} color="#FFFFFF" />
                    )}
                  </Pressable>
                </View>

                {replyError ? (
                  <Text style={[styles.replyError, { color: palette.accent }]}>
                    {replyError}
                  </Text>
                ) : null}
              </Animated.View>
            </KeyboardAvoidingView>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storyContent: {
    flex: 1,
  },
  imageLayer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.16)',
  },
  progressRow: {
    position: 'absolute',
    top: 10,
    right: 12,
    left: 12,
    zIndex: 2,
    flexDirection: 'row',
    gap: 6,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#FFFFFF',
  },
  headerOverlay: {
    position: 'absolute',
    top: 22,
    right: 8,
    left: 12,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  headerTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapRow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  replyLauncherWrap: {
    minHeight: 68,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  replyLauncher: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  replyLauncherText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ownStoryLabel: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownStoryText: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 13,
    fontWeight: '700',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#000000',
  },
  keyboardSheet: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  replySheet: {
    minHeight: SHEET_HEIGHT,
    borderTopWidth: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 16,
  },
  sheetGrabber: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetHeaderCopy: {
    flex: 1,
    gap: 2,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetClose: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyComposer: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  replyInput: {
    flex: 1,
    minHeight: 52,
    maxHeight: 104,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyError: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  emptyHeader: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '900',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
