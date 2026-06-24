import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Edit3,
  FileText,
  ImagePlus,
  Images,
  Share2,
  UserRound,
} from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AnimatedPostCard } from '../../components/AnimatedPostCard';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { getUserPosts } from '../../services/postService';
import { useAuthStore } from '../../store/useAuthStore';
import { usePostStore } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type { Post } from '../../types/social';
import { getPostImageTransitionTag } from '../../utils/postTransition';

type ProfileNavigation = NativeStackNavigationProp<RootStackParamList>;
type ProfileTab = 'posts' | 'media';

export function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigation>();
  const user = useAuthStore((state) => state.user);
  const toggleLike = usePostStore((state) => state.toggleLike);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsError, setPostsError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) {
      setPosts([]);
      return;
    }

    setPostsLoading(true);
    setPostsError(null);

    try {
      const nextPosts = await getUserPosts(user.id, { maxResults: 100 });
      setPosts(nextPosts);
    } catch (error) {
      console.error('[profile] posts load failed', {
        userId: user.id,
        error,
      });
      setPostsError('Postingan gagal dimuat. Periksa koneksi lalu coba lagi.');
    } finally {
      setPostsLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void loadPosts();
    }, [loadPosts]),
  );

  const visiblePosts = useMemo(
    () =>
      activeTab === 'media'
        ? posts.filter((post) => Boolean(post.imageUrl))
        : posts,
    [activeTab, posts],
  );

  const shareProfile = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      await Share.share({
        title: `Profil ${user.displayName}`,
        message: `Lihat profil ${user.displayName} (@${user.username}) di Sociyo.`,
      });
    } catch (error) {
      console.error('[profile] share failed', {
        userId: user.id,
        error,
      });
      Alert.alert('Gagal membagikan profil', 'Coba lagi beberapa saat.');
    }
  }, [user]);

  const handleToggleLike = useCallback(
    (postId: string) => {
      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likedByMe: !post.likedByMe,
                likes: Math.max(
                  0,
                  post.likes + (post.likedByMe ? -1 : 1),
                ),
              }
            : post,
        ),
      );
      void toggleLike(postId);
    },
    [toggleLike],
  );

  const renderPost = useCallback(
    ({ item, index }: { item: Post; index: number }) => (
      <AnimatedPostCard
        post={item}
        index={index}
        onOpen={(imageAspectRatio) =>
          navigation.navigate('PostDetail', {
            postId: item.id,
            imageAspectRatio,
            sharedTransitionTag: item.imageUrl
              ? getPostImageTransitionTag(item.id)
              : undefined,
          })
        }
        onPhotoOpen={() => {
          if (item.imageUrl) {
            navigation.navigate('PhotoViewer', {
              imageUrl: item.imageUrl,
              alt: item.caption,
            });
          }
        }}
        onAvatarOpen={() => undefined}
        onLike={() => handleToggleLike(item.id)}
      />
    ),
    [handleToggleLike, navigation],
  );

  if (!user) {
    return (
      <Screen>
        <View style={styles.centered}>
          <EmptyState
            icon={<UserRound size={24} color={palette.primary} />}
            title="Sesi tidak ditemukan"
            message="Silakan login ulang untuk melihat profil."
          />
        </View>
      </Screen>
    );
  }

  const listHeader = (
    <View>
      <View style={styles.profileHeader}>
        <View style={styles.identityCopy}>
          <Text style={[styles.name, { color: palette.text }]}>
            {user.displayName}
          </Text>
          <Text style={[styles.username, { color: palette.text }]}>
            @{user.username}
          </Text>
        </View>

        <Avatar
          displayName={user.displayName}
          username={user.username}
          avatarUrl={user.avatarUrl}
          size={84}
        />
      </View>

      <Text
        style={[
          styles.bio,
          { color: user.bio ? palette.text : palette.textMuted },
        ]}
      >
        {user.bio || 'Belum ada bio.'}
      </Text>

      <View style={styles.profileStats}>
        <Text style={[styles.statText, { color: palette.textMuted }]}>
          <Text style={[styles.statValue, { color: palette.text }]}>
            {posts.length}
          </Text>{' '}
          postingan
        </Text>
        <View style={[styles.statSeparator, { backgroundColor: palette.border }]} />
        <Text style={[styles.statText, { color: palette.textMuted }]}>
          <Text style={[styles.statValue, { color: palette.text }]}>
            {user.followersCount}
          </Text>{' '}
          pengikut
        </Text>
        <View style={[styles.statSeparator, { backgroundColor: palette.border }]} />
        <Text style={[styles.statText, { color: palette.textMuted }]}>
          <Text style={[styles.statValue, { color: palette.text }]}>
            {user.followingCount}
          </Text>{' '}
          mengikuti
        </Text>
      </View>

      <View style={styles.profileActions}>
        <Pressable
          onPress={() => navigation.navigate('EditProfile')}
          style={({ pressed }) => [
            styles.profileActionButton,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Edit3 size={17} color={palette.text} />
          <Text style={[styles.profileActionLabel, { color: palette.text }]}>
            Edit profil
          </Text>
        </Pressable>

        <Pressable
          onPress={() => void shareProfile()}
          style={({ pressed }) => [
            styles.profileActionButton,
            {
              borderColor: palette.border,
              backgroundColor: palette.surface,
              opacity: pressed ? 0.72 : 1,
            },
          ]}
        >
          <Share2 size={17} color={palette.text} />
          <Text style={[styles.profileActionLabel, { color: palette.text }]}>
            Bagikan profil
          </Text>
        </Pressable>
      </View>

      <View style={[styles.tabs, { borderBottomColor: palette.border }]}>
        <Pressable
          onPress={() => setActiveTab('posts')}
          style={styles.tabButton}
        >
          <FileText
            size={17}
            color={activeTab === 'posts' ? palette.text : palette.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  activeTab === 'posts' ? palette.text : palette.textMuted,
              },
            ]}
          >
            Postingan
          </Text>
          {activeTab === 'posts' ? (
            <View
              style={[styles.activeTabLine, { backgroundColor: palette.primary }]}
            />
          ) : null}
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('media')}
          style={styles.tabButton}
        >
          <Images
            size={17}
            color={activeTab === 'media' ? palette.text : palette.textMuted}
          />
          <Text
            style={[
              styles.tabLabel,
              {
                color:
                  activeTab === 'media' ? palette.text : palette.textMuted,
              },
            ]}
          >
            Media
          </Text>
          {activeTab === 'media' ? (
            <View
              style={[styles.activeTabLine, { backgroundColor: palette.primary }]}
            />
          ) : null}
        </Pressable>
      </View>
    </View>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          postsLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color={palette.primary} />
              <Text style={[styles.loadingText, { color: palette.textMuted }]}>
                Memuat postingan...
              </Text>
            </View>
          ) : postsError ? (
            <EmptyState
              icon={<ImagePlus size={24} color={palette.accent} />}
              title="Postingan belum tersedia"
              message={postsError}
            />
          ) : (
            <EmptyState
              icon={
                activeTab === 'media' ? (
                  <Images size={24} color={palette.primary} />
                ) : (
                  <ImagePlus size={24} color={palette.primary} />
                )
              }
              title={
                activeTab === 'media'
                  ? 'Belum ada media'
                  : 'Belum ada postingan'
              }
              message={
                activeTab === 'media'
                  ? 'Postingan bergambar akan tampil di sini.'
                  : 'Postingan yang kamu buat akan tampil di profil.'
              }
            />
          )
        }
        contentContainerStyle={[
          styles.listContent,
          visiblePosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        onRefresh={() => void loadPosts()}
        refreshing={postsLoading && posts.length > 0}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  profileHeader: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 18,
  },
  identityCopy: {
    flex: 1,
    paddingTop: 4,
  },
  name: {
    fontSize: 27,
    lineHeight: 33,
    fontWeight: '900',
  },
  username: {
    marginTop: 4,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '700',
  },
  bio: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  profileStats: {
    marginTop: 15,
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '900',
  },
  statSeparator: {
    width: 3,
    height: 3,
    borderRadius: 2,
  },
  profileActions: {
    marginTop: 19,
    flexDirection: 'row',
    gap: 10,
  },
  profileActionButton: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  profileActionLabel: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  tabs: {
    height: 58,
    marginTop: 20,
    marginHorizontal: -16,
    borderBottomWidth: 1,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  activeTabLine: {
    position: 'absolute',
    right: 24,
    bottom: -1,
    left: 24,
    height: 2,
  },
  loadingState: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
