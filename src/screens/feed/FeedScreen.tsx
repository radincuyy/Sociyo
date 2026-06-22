import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Menu, RefreshCw, PlusCircle } from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { StoryGroup } from '../../types/social';

import { AnimatedPostCard } from '../../components/AnimatedPostCard';
import { AnimatedRefreshIndicator } from '../../components/AnimatedRefreshIndicator';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { usePostStore } from '../../store/usePostStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useStoryStore } from '../../store/useStoryStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { Post } from '../../types/social';

type FeedNavigation = NativeStackNavigationProp<RootStackParamList>;

type Palette = (typeof colors)[keyof typeof colors];

function StoryAvatarItem({ group, palette, onPress }: { group: StoryGroup; palette: Palette; onPress: () => void }) {
  const rotating = useSharedValue(0);
  useEffect(() => {
    if (group.hasUnviewed) {
      rotating.value = withRepeat(withTiming(360, { duration: 2000 }), -1, false);
    }
    return () => {
      rotating.value = 0;
    };
  }, [group.hasUnviewed, rotating]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotating.value}deg` }],
  }));

  return (
    <Pressable onPress={onPress} style={styles.storyItem}>
      <View style={styles.storyRing}>
        {group.hasUnviewed ? (
          <Animated.View style={[styles.storyGradientWrap, ringStyle]}>
            <LinearGradient
              colors={[
                palette.primary,
                palette.accent,
                palette.warning,
                palette.primary,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.storyGradient}
            />
          </Animated.View>
        ) : (
          <View
            style={[
              styles.storyViewedRing,
              { borderColor: palette.border },
            ]}
          />
        )}
        <View
          style={[
            styles.storyAvatarFrame,
            { backgroundColor: palette.background },
          ]}
        >
          {group.avatarUrl ? (
            <Image
              source={{ uri: group.avatarUrl }}
              style={styles.storyAvatar}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.storyAvatarFallback,
                { backgroundColor: palette.surfaceMuted },
              ]}
            >
              <Text style={[styles.storyAvatarLetter, { color: palette.text }]}>
                {group.author.slice(0, 1).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export function FeedScreen() {
  const navigation = useNavigation<FeedNavigation>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const posts = usePostStore((state) => state.posts);
  const isLoading = usePostStore((state) => state.isLoading);
  const isRefreshing = usePostStore((state) => state.isRefreshing);
  const hasMore = usePostStore((state) => state.hasMore);
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const refreshPosts = usePostStore((state) => state.refreshPosts);
  const loadMorePosts = usePostStore((state) => state.loadMorePosts);
  const toggleLike = usePostStore((state) => state.toggleLike);

  const groups = useStoryStore((s) => s.groups);
  const fetchStories = useStoryStore((s) => s.fetchStories);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const pullDistance = useSharedValue(0);

  useEffect(() => {
    void fetchPosts();
    // fetch stories as well
    void fetchStories();
  }, [fetchPosts, fetchStories]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshPosts(), fetchStories()]);
  }, [fetchStories, refreshPosts]);

  const handleLoadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      void loadMorePosts();
    }
  }, [isLoading, hasMore, loadMorePosts]);

  const renderPost = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <AnimatedPostCard
        post={item}
        index={index}
        onOpen={() => navigation.navigate('PostDetail', { postId: item.id })}
        onPhotoOpen={() => {
          if (item.imageUrl) {
            navigation.navigate('PhotoViewer', {
              imageUrl: item.imageUrl,
              alt: item.caption,
            });
          }
        }}
        onLike={() => void toggleLike(item.id)}
      />
    ),
    [navigation, toggleLike],
  );

  const renderStoryHeader = () => (
    <View style={styles.storyHeaderWrap}>
      <FlatList
        data={groups}
        horizontal
        keyExtractor={(g) => g.userId}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storyList}
        ListHeaderComponent={
          <Pressable
            style={styles.storyItem}
            onPress={() => navigation.navigate('CreateStory')}
          >
            <View style={[styles.storyRing, styles.createStoryRing, { borderColor: palette.primary }]}>
              <View style={[styles.storyAvatar, styles.createStoryAvatar, { backgroundColor: palette.background }]}>
                <PlusCircle size={20} color={palette.primary} />
              </View>
            </View>
          </Pressable>
        }
        renderItem={({ item }) => (
          <StoryAvatarItem
            group={item}
            palette={palette}
            onPress={() => navigation.navigate('StoryViewer', { userId: item.userId })}
          />
        )}
      />
    </View>
  );

  const renderFooter = useCallback(() => {
    if (!isLoading || posts.length === 0) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={palette.primary} />
        <Text style={[styles.footerText, { color: palette.textMuted }]}>Memuat lainnya...</Text>
      </View>
    );
  }, [isLoading, posts.length, palette]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>Memuat feed...</Text>
        </View>
      );
    }

    return (
      <View style={styles.centered}>
        <EmptyState
          icon={<RefreshCw size={24} color={palette.primary} />}
          title="Belum ada postingan"
          message="Buat postingan pertamamu di tab Create!"
        />
      </View>
    );
  }, [isLoading, palette]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      pullDistance.value = Math.max(0, -event.contentOffset.y);
    },
  });

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable
          hitSlop={10}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Menu size={23} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Sociyo</Text>
        <Pressable
          hitSlop={10}
          onPress={() => navigation.navigate('Notifications')}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Bell size={22} color={palette.text} />
          {unreadCount > 0 ? (
            <View style={[styles.notificationBadge, { backgroundColor: palette.accent }]}>
              <Text style={styles.notificationBadgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {renderStoryHeader()}

      <View style={styles.feedListWrap}>
        <AnimatedRefreshIndicator
          refreshing={isRefreshing}
          pullDistance={pullDistance}
          color={palette.primary}
          backgroundColor={palette.surface}
          borderColor={palette.border}
        />
        <Animated.FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                void handleRefresh();
              }}
              tintColor="transparent"
              colors={['transparent']}
              progressBackgroundColor="transparent"
            />
          }
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 1,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  feedListWrap: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // story header styles
  storyHeaderWrap: {
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 8,
  },
  storyList: {
    paddingRight: 16,
    alignItems: 'center',
    gap: 12,
  },
  storyItem: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storyRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyGradientWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 32,
    overflow: 'hidden',
  },
  storyGradient: {
    width: '100%',
    height: '100%',
  },
  storyViewedRing: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 32,
    borderWidth: 2,
  },
  storyAvatarFrame: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
  },
  storyAvatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyAvatarLetter: {
    fontSize: 16,
    fontWeight: '900',
  },
  createStoryRing: {
    borderWidth: 2,
  },
  createStoryAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
