import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Menu, RefreshCw } from 'lucide-react-native';
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

import { AnimatedPostCard } from '../../components/AnimatedPostCard';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { usePostStore } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { Post } from '../../types/social';

type FeedNavigation = NativeStackNavigationProp<RootStackParamList>;

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

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const handleRefresh = useCallback(() => {
    void refreshPosts();
  }, [refreshPosts]);

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
        </Pressable>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={posts.length === 0 ? styles.emptyContainer : styles.listContent}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={palette.primary}
            colors={[palette.primary]}
          />
        }
      />
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
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
});
