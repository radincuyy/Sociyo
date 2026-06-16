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
  onLike?: () => void;
};

export function AnimatedPostCard({ post, index, onOpen, onPhotoOpen, onLike }: AnimatedPostCardProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const appear = useSharedValue(0);
  const heartScale = useSharedValue(1);
  const burst = useSharedValue(1);
  const countLift = useSharedValue(0);
  const avatarInitial = post.author.trim().slice(0, 1).toUpperCase() || '?';
  const [imgAspect, setImgAspect] = useState(4 / 3);

  const timeAgo = useMemo(() => {
    if (!post.createdAt) return '';
    const diff = Date.now() - new Date(post.createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'baru saja';
    if (mins < 60) return `${mins} mnt`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days} hr`;
    return new Date(post.createdAt).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  }, [post.createdAt]);

  useEffect(() => {
    appear.value = withDelay(
      index * 90,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
    );
  }, [appear, index]);

  const triggerLike = () => {
    onLike?.();
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

  const imageDoubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .maxDelay(250)
        .onEnd(() => {
          runOnJS(triggerLike)();
        }),
    [triggerLike],
  );

  const imageSingleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(1)
        .onEnd(() => {
          if (post.imageUrl) {
            runOnJS(onPhotoOpen)();
          }
        }),
    [onPhotoOpen, post.imageUrl],
  );

  const imageGesture = Gesture.Exclusive(imageDoubleTap, imageSingleTap);

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      { }
      <View style={styles.row}>
        { }
        <Pressable onPress={onOpen}>
          {post.avatarUrl ? (
            <Image source={{ uri: post.avatarUrl }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: palette.surfaceMuted }]}>
              <Text style={[styles.avatarLetter, { color: palette.text }]}>{avatarInitial}</Text>
            </View>
          )}
        </Pressable>

        { }
        <View style={styles.content}>
          { }
          <Pressable onPress={onOpen} style={styles.nameRow}>
            <Text style={[styles.username, { color: palette.text }]} numberOfLines={1}>
              {post.username}
            </Text>
            <Text style={[styles.time, { color: palette.textMuted }]}>{timeAgo}</Text>
          </Pressable>

          {post.caption ? (
            <Text style={[styles.caption, { color: palette.text }]}>{post.caption}</Text>
          ) : null}

          {post.imageUrl ? (
            <GestureDetector gesture={imageGesture}>
              <Animated.View style={styles.imageWrap}>
                <Image
                  source={{ uri: post.imageUrl }}
                  style={[styles.image, { borderColor: palette.border, aspectRatio: imgAspect }]}
                  contentFit="cover"
                  onLoad={(e) => {
                    const { width, height } = e.source;
                    if (width && height) {
                      // Clamp: min 4:5 (portrait), max 2:1 (landscape)
                      const raw = width / height;
                      setImgAspect(Math.max(4 / 5, Math.min(2, raw)));
                    }
                  }}
                />
                <Animated.View pointerEvents="none" style={[styles.burst, burstStyle]}>
                  <Heart size={74} fill="#FFFFFF" color="#FFFFFF" />
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          ) : null}

          { }
          <View style={styles.actions}>
            <Pressable onPress={triggerLike} style={styles.actionBtn}>
              <Animated.View style={heartStyle}>
                <Heart
                  size={20}
                  color={post.likedByMe ? palette.accent : palette.text}
                  fill={post.likedByMe ? palette.accent : 'transparent'}
                />
              </Animated.View>
              {post.likes > 0 && (
                <Animated.Text style={[styles.actionCount, countStyle, { color: palette.textMuted }]}>
                  {post.likes}
                </Animated.Text>
              )}
            </Pressable>

            <Pressable onPress={onOpen} style={styles.actionBtn}>
              <MessageCircle size={20} color={palette.text} />
              {post.comments > 0 && (
                <Text style={[styles.actionCount, { color: palette.textMuted }]}>
                  {post.comments}
                </Text>
              )}
            </Pressable>


            <Pressable style={styles.actionBtn}>
              <Send size={20} color={palette.text} />
            </Pressable>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: palette.border }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingTop: 14,
  },

  row: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    gap: 8,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 15,
    fontWeight: '900',
  },

  content: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 15,
    fontWeight: '800',
  },
  time: {
    fontSize: 13,
  },
  caption: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },

  imageWrap: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    borderWidth: 0.5,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
  },

  divider: {
    height: 0.5,
    marginTop: 10,
  },
});
