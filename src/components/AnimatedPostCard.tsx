import { Image } from 'expo-image';
import { Heart, MessageCircle, Send } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useEffect, useMemo, useState } from 'react';

import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';
import type { Post } from '../types/social';

type AnimatedPostCardProps = {
  post: Post;
  index: number;
  onOpen: () => void;
  onPhotoOpen: () => void;
};

export function AnimatedPostCard({ post, index, onOpen, onPhotoOpen }: AnimatedPostCardProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const appear = useSharedValue(0);
  const heartScale = useSharedValue(1);
  const burst = useSharedValue(0);
  const countLift = useSharedValue(0);
  const avatarInitial = post.author.trim().slice(0, 1).toUpperCase() || '?';
  const meta = [post.location, post.createdAt].filter(Boolean).join(' - ');

  useEffect(() => {
    appear.value = withDelay(
      index * 90,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [appear, index]);

  const triggerLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((current) => current + 1);
    }
    heartScale.value = withSequence(withSpring(1.3), withSpring(1));
    burst.value = 0;
    burst.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    countLift.value = 0;
    countLift.value = withTiming(1, { duration: 360 });
  };

  const cardStyle = useAnimatedStyle(() => ({
    opacity: appear.value,
    transform: [{ translateY: (1 - appear.value) * 18 }],
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const burstStyle = useAnimatedStyle(() => ({
    opacity: 1 - burst.value,
    transform: [{ scale: 0.35 + burst.value * 1.4 }],
  }));

  const countStyle = useAnimatedStyle(() => ({
    opacity: 0.75 + (1 - countLift.value) * 0.25,
    transform: [{ translateY: -countLift.value * 3 }],
  }));

  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(250)
        .onEnd(() => {
          runOnJS(triggerLike)();
        }),
    [triggerLike],
  );

  const singleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(1)
        .onEnd(() => {
          runOnJS(onOpen)();
        }),
    [onOpen],
  );

  const tapGesture = Gesture.Exclusive(doubleTap, singleTap);

  return (
    <GestureDetector gesture={tapGesture}>
      <Animated.View
        style={[
          styles.card,
          cardStyle,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.header}>
          {post.avatarUrl ? (
            <Image source={{ uri: post.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: palette.surfaceMuted }]}>
              <Text style={[styles.avatarInitial, { color: palette.text }]}>{avatarInitial}</Text>
            </View>
          )}
          <View style={styles.authorBlock}>
            <Text style={[styles.author, { color: palette.text }]}>{post.author}</Text>
            <Text style={[styles.meta, { color: palette.textMuted }]}>
              {meta}
            </Text>
          </View>
        </View>

        <Pressable onPress={post.imageUrl ? onPhotoOpen : undefined} style={styles.imageWrap}>
          {post.imageUrl ? (
            <Image source={{ uri: post.imageUrl }} style={styles.image} contentFit="cover" />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: palette.surfaceMuted }]}>
              <Text style={[styles.imagePlaceholderText, { color: palette.textMuted }]}>
                Belum ada gambar
              </Text>
            </View>
          )}
          <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]}>
            <Heart size={74} fill="#FFFFFF" color="#FFFFFF" />
          </Animated.View>
        </Pressable>

        <View style={styles.actions}>
          <Pressable onPress={triggerLike} style={styles.actionButton}>
            <Animated.View style={heartStyle}>
              <Heart
                size={23}
                color={liked ? palette.accent : palette.text}
                fill={liked ? palette.accent : 'transparent'}
              />
            </Animated.View>
          </Pressable>
          <Pressable onPress={onOpen} style={styles.actionButton}>
            <MessageCircle size={23} color={palette.text} />
          </Pressable>
          <Pressable style={styles.actionButton}>
            <Send size={22} color={palette.text} />
          </Pressable>
        </View>

        <Animated.Text style={[styles.likes, countStyle, { color: palette.text }]}>
          {likeCount.toLocaleString('id-ID')} suka
        </Animated.Text>
        <Text style={[styles.caption, { color: palette.text }]}>
          <Text style={styles.username}>{post.username}</Text> {post.caption}
        </Text>
        <Text style={[styles.comments, { color: palette.textMuted }]}>
          Lihat {post.comments} komentar
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '900',
  },
  authorBlock: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: '800',
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
  },
  imageWrap: {
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  burst: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    minHeight: 48,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likes: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '800',
  },
  caption: {
    paddingHorizontal: 14,
    paddingTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: '800',
  },
  comments: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    fontSize: 13,
  },
});
