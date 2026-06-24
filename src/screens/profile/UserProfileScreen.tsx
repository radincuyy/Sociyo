import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  Edit3,
  FileText,
  Home,
  ImagePlus,
  Images,
  MessageCircle,
  PlusCircle,
  Search,
  UserCheck,
  UserPlus,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedPostCard } from '../../components/AnimatedPostCard';
import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { getDirectMessageThreadId } from '../../services/messageService';
import {
  getPublicUserProfile,
  type PublicUserProfile,
} from '../../services/profileService';
import { getUserPosts } from '../../services/postService';
import { useAuthStore } from '../../store/useAuthStore';
import { useFollowStore } from '../../store/useFollowStore';
import { useMessageStore } from '../../store/useMessageStore';
import { usePostStore } from '../../store/usePostStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type {
  MainTabParamList,
  RootStackParamList,
} from '../../types/navigation';
import type { Post } from '../../types/social';
import { getPostImageTransitionTag } from '../../utils/postTransition';

type UserProfileProps = NativeStackScreenProps<
  RootStackParamList,
  'UserProfile'
>;
type ProfileTab = 'posts' | 'media';

export function UserProfileScreen({
  navigation,
  route,
}: UserProfileProps) {
  const { userId } = route.params;
  const currentUser = useAuthStore((state) => state.user);
  const following = useFollowStore(
    (state) => state.followMap[userId] ?? false,
  );
  const followPending = useFollowStore(
    (state) => state.pendingMap[userId] ?? false,
  );
  const checkFollow = useFollowStore((state) => state.checkFollow);
  const toggleFollow = useFollowStore((state) => state.toggleFollow);
  const toggleLike = usePostStore((state) => state.toggleLike);
  const totalUnreadMessages = useMessageStore((state) => state.totalUnread);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [initialFollowing, setInitialFollowing] = useState<boolean | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isSelf = currentUser?.id === userId;

  const loadProfile = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const [nextProfile, nextPosts] = await Promise.all([
          getPublicUserProfile(userId),
          getUserPosts(userId, {
            currentUserId: currentUser?.id,
            maxResults: 100,
          }),
        ]);
        setProfile(nextProfile);
        setPosts(nextPosts);

        if (!isSelf) {
          const result = await checkFollow(userId);
          setInitialFollowing(result);
        }
      } catch (loadError) {
        console.error('[public-profile] load failed', {
          userId,
          error: loadError,
        });
        setError('Profil gagal dimuat. Periksa koneksi lalu coba lagi.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [checkFollow, currentUser?.id, isSelf, userId],
  );

  useEffect(() => {
    void loadProfile(false);
  }, [loadProfile]);

  const visiblePosts = useMemo(
    () =>
      activeTab === 'media'
        ? posts.filter((post) => Boolean(post.imageUrl))
        : posts,
    [activeTab, posts],
  );

  const followerCount = useMemo(() => {
    if (!profile || isSelf || initialFollowing === null) {
      return profile?.followersCount ?? 0;
    }

    if (following === initialFollowing) {
      return profile.followersCount;
    }

    return Math.max(
      0,
      profile.followersCount + (following ? 1 : -1),
    );
  }, [following, initialFollowing, isSelf, profile]);

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

  const openMessage = useCallback(() => {
    if (!currentUser || !profile || isSelf) {
      return;
    }

    navigation.navigate('MessageThread', {
      threadId: getDirectMessageThreadId(currentUser.id, profile.id),
      recipient: {
        id: profile.id,
        displayName: profile.displayName,
        username: profile.username,
        avatarUrl: profile.avatarUrl,
      },
    });
  }, [currentUser, isSelf, navigation, profile]);

  const openMainTab = useCallback(
    (tab: keyof MainTabParamList) => {
      navigation.navigate('Main', {
        screen: 'HomeTabs',
        params: { screen: tab },
      });
    },
    [navigation],
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

  if (loading) {
    return (
      <Screen padded={false} edges={['top']}>
        <ProfileHeader
          title="Profil"
          textColor={palette.text}
          borderColor={palette.border}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={[styles.loadingText, { color: palette.textMuted }]}>
            Memuat profil...
          </Text>
        </View>
        <PublicProfileBottomBar
          avatarUrl={currentUser?.avatarUrl ?? null}
          displayName={currentUser?.displayName ?? ''}
          username={currentUser?.username ?? ''}
          unreadMessages={totalUnreadMessages}
          onNavigate={openMainTab}
        />
      </Screen>
    );
  }

  if (!profile || error) {
    return (
      <Screen padded={false} edges={['top']}>
        <ProfileHeader
          title="Profil"
          textColor={palette.text}
          borderColor={palette.border}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.errorState}>
          <EmptyState
            icon={<UserPlus size={24} color={palette.accent} />}
            title="Profil belum tersedia"
            message={error ?? 'Pengguna tidak ditemukan.'}
          />
          <Pressable
            onPress={() => void loadProfile(false)}
            style={[
              styles.retryButton,
              { backgroundColor: palette.primary },
            ]}
          >
            <Text style={styles.retryLabel}>Coba lagi</Text>
          </Pressable>
        </View>
        <PublicProfileBottomBar
          avatarUrl={currentUser?.avatarUrl ?? null}
          displayName={currentUser?.displayName ?? ''}
          username={currentUser?.username ?? ''}
          unreadMessages={totalUnreadMessages}
          onNavigate={openMainTab}
        />
      </Screen>
    );
  }

  const listHeader = (
    <View>
      <View style={styles.profileHeader}>
        <View style={styles.identityCopy}>
          <Text style={[styles.name, { color: palette.text }]}>
            {profile.displayName}
          </Text>
          <Text style={[styles.username, { color: palette.text }]}>
            @{profile.username}
          </Text>
        </View>

        <Avatar
          displayName={profile.displayName}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          size={84}
        />
      </View>

      <Text
        style={[
          styles.bio,
          { color: profile.bio ? palette.text : palette.textMuted },
        ]}
      >
        {profile.bio || 'Belum ada bio.'}
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
            {followerCount}
          </Text>{' '}
          pengikut
        </Text>
        <View style={[styles.statSeparator, { backgroundColor: palette.border }]} />
        <Text style={[styles.statText, { color: palette.textMuted }]}>
          <Text style={[styles.statValue, { color: palette.text }]}>
            {profile.followingCount}
          </Text>{' '}
          mengikuti
        </Text>
      </View>

      <View style={styles.profileActions}>
        {isSelf ? (
          <Pressable
            onPress={() => navigation.navigate('EditProfile')}
            style={({ pressed }) => [
              styles.primaryAction,
              {
                backgroundColor: palette.primary,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <Edit3 size={17} color="#FFFFFF" />
            <Text style={styles.primaryActionLabel}>Edit profil</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => void toggleFollow(userId)}
              disabled={followPending}
              style={({ pressed }) => [
                styles.primaryAction,
                {
                  backgroundColor: following
                    ? palette.surface
                    : palette.primary,
                  borderColor: following
                    ? palette.border
                    : palette.primary,
                  opacity: followPending ? 0.55 : pressed ? 0.75 : 1,
                },
              ]}
            >
              {following ? (
                <UserCheck size={17} color={palette.text} />
              ) : (
                <UserPlus size={17} color="#FFFFFF" />
              )}
              <Text
                style={[
                  styles.actionLabel,
                  { color: following ? palette.text : '#FFFFFF' },
                ]}
              >
                {following ? 'Mengikuti' : 'Ikuti'}
              </Text>
            </Pressable>

            <Pressable
              onPress={openMessage}
              style={({ pressed }) => [
                styles.secondaryAction,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                  opacity: pressed ? 0.72 : 1,
                },
              ]}
            >
              <MessageCircle size={17} color={palette.text} />
              <Text style={[styles.actionLabel, { color: palette.text }]}>
                Pesan
              </Text>
            </Pressable>
          </>
        )}
      </View>

      <View style={[styles.tabs, { borderBottomColor: palette.border }]}>
        <ProfileTabButton
          active={activeTab === 'posts'}
          label="Postingan"
          Icon={FileText}
          textColor={palette.text}
          mutedColor={palette.textMuted}
          activeColor={palette.primary}
          onPress={() => setActiveTab('posts')}
        />
        <ProfileTabButton
          active={activeTab === 'media'}
          label="Media"
          Icon={Images}
          textColor={palette.text}
          mutedColor={palette.textMuted}
          activeColor={palette.primary}
          onPress={() => setActiveTab('media')}
        />
      </View>
    </View>
  );

  return (
    <Screen padded={false} edges={['top']}>
      <ProfileHeader
        title={profile.username}
        textColor={palette.text}
        borderColor={palette.border}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={visiblePosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
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
                ? 'Postingan bergambar pengguna ini akan tampil di sini.'
                : 'Pengguna ini belum membuat postingan.'
            }
          />
        }
        contentContainerStyle={[
          styles.listContent,
          visiblePosts.length === 0 && styles.emptyListContent,
        ]}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => void loadProfile(true)}
      />
      <PublicProfileBottomBar
        avatarUrl={currentUser?.avatarUrl ?? null}
        displayName={currentUser?.displayName ?? ''}
        username={currentUser?.username ?? ''}
        unreadMessages={totalUnreadMessages}
        onNavigate={openMainTab}
      />
    </Screen>
  );
}

type PublicProfileBottomBarProps = {
  avatarUrl: string | null;
  displayName: string;
  username: string;
  unreadMessages: number;
  onNavigate: (tab: keyof MainTabParamList) => void;
};

function PublicProfileBottomBar({
  avatarUrl,
  displayName,
  username,
  unreadMessages,
  onNavigate,
}: PublicProfileBottomBarProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const insets = useSafeAreaInsets();
  const items: ReadonlyArray<{
    tab: keyof MainTabParamList;
    label: string;
    Icon: typeof Home;
    iconSize: number;
  }> = [
    { tab: 'Feed', label: 'Feed', Icon: Home, iconSize: 24 },
    { tab: 'Messages', label: 'Pesan', Icon: MessageCircle, iconSize: 24 },
    { tab: 'Create', label: 'Create', Icon: PlusCircle, iconSize: 26 },
    { tab: 'Search', label: 'Search', Icon: Search, iconSize: 24 },
  ];
  const barHeight = Math.max(62, 49 + insets.bottom);

  return (
    <View
      style={[
        styles.bottomBar,
        {
          height: barHeight,
          paddingBottom: insets.bottom,
          paddingHorizontal: Math.max(insets.left, insets.right),
          backgroundColor: palette.tabBar,
          borderTopColor: palette.border,
        },
      ]}
    >
      {items.map(({ tab, label, Icon, iconSize }) => (
        <Pressable
          key={tab}
          onPress={() => onNavigate(tab)}
          style={({ pressed }) => [
            styles.bottomBarItem,
            { opacity: pressed ? 0.55 : 1 },
          ]}
        >
          <View style={styles.bottomBarIcon}>
            <Icon size={iconSize} color={palette.textMuted} />
            {tab === 'Messages' && unreadMessages > 0 ? (
              <View
                style={[
                  styles.bottomBarBadge,
                  { backgroundColor: palette.accent },
                ]}
              >
                <Text style={styles.bottomBarBadgeLabel}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.bottomBarLabel, { color: palette.textMuted }]}>
            {label}
          </Text>
        </Pressable>
      ))}

      <Pressable
        onPress={() => onNavigate('Profile')}
        style={({ pressed }) => [
          styles.bottomBarItem,
          { opacity: pressed ? 0.55 : 1 },
        ]}
      >
        <View
          style={[
            styles.bottomBarProfileAvatar,
            { borderColor: palette.border },
          ]}
        >
          <Avatar
            avatarUrl={avatarUrl}
            displayName={displayName}
            username={username}
            size={27}
          />
        </View>
        <Text style={[styles.bottomBarLabel, { color: palette.textMuted }]}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

type ProfileHeaderProps = {
  title: string;
  textColor: string;
  borderColor: string;
  onBack: () => void;
};

function ProfileHeader({
  title,
  textColor,
  borderColor,
  onBack,
}: ProfileHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <ArrowLeft size={23} color={textColor} />
      </Pressable>
      <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.backButton} />
    </View>
  );
}

type ProfileTabButtonProps = {
  active: boolean;
  label: string;
  Icon: typeof FileText;
  textColor: string;
  mutedColor: string;
  activeColor: string;
  onPress: () => void;
};

function ProfileTabButton({
  active,
  label,
  Icon,
  textColor,
  mutedColor,
  activeColor,
  onPress,
}: ProfileTabButtonProps) {
  return (
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Icon size={17} color={active ? textColor : mutedColor} />
      <Text
        style={[
          styles.tabLabel,
          { color: active ? textColor : mutedColor },
        ]}
      >
        {label}
      </Text>
      {active ? (
        <View style={[styles.activeTabLine, { backgroundColor: activeColor }]} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 54,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
  },
  emptyListContent: {
    flexGrow: 1,
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
  primaryAction: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryAction: {
    flex: 1,
    minHeight: 44,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryActionLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '900',
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  errorState: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  retryButton: {
    minHeight: 42,
    marginTop: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  bottomBarIcon: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBarProfileAvatar: {
    width: 33,
    height: 33,
    borderWidth: 2,
    borderRadius: 18,
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBarBadgeLabel: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
