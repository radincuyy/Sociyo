import { Image } from 'expo-image';
import { Search, TrendingUp, Users } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useFollowStore } from '../../store/useFollowStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import {
  searchUsers,
  getExplorePosts,
  type SearchUser,
  type SearchPost,
} from '../../services/searchService';
import type { RootStackParamList } from '../../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Palette = (typeof colors)[keyof typeof colors];

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const NUM_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type SearchUserCardProps = {
  item: SearchUser;
  palette: Palette;
  onOpen: () => void;
};

function SearchUserCard({ item, palette, onOpen }: SearchUserCardProps) {
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const following = useFollowStore((state) => state.followMap[item.id] ?? false);
  const pending = useFollowStore((state) => state.pendingMap[item.id] ?? false);
  const checkFollow = useFollowStore((state) => state.checkFollow);
  const toggleFollow = useFollowStore((state) => state.toggleFollow);
  const initial = item.displayName.trim().slice(0, 1).toUpperCase() || '?';
  const isCurrentUser = currentUserId === item.id;

  useEffect(() => {
    if (!isCurrentUser) {
      void checkFollow(item.id);
    }
  }, [checkFollow, isCurrentUser, item.id]);

  return (
    <View style={[styles.userCard, { borderBottomColor: palette.border }]}>
      <Pressable onPress={onOpen}>
        {item.avatarUrl ? (
          <Image source={{ uri: item.avatarUrl }} style={styles.userAvatar} contentFit="cover" />
        ) : (
          <View style={[styles.userAvatarFallback, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.userAvatarLetter, { color: palette.text }]}>{initial}</Text>
          </View>
        )}
      </Pressable>
      <Pressable onPress={onOpen} style={styles.userInfo}>
        <Text style={[styles.userName, { color: palette.text }]} numberOfLines={1}>
          {item.displayName}
        </Text>
        <Text style={[styles.userHandle, { color: palette.textMuted }]} numberOfLines={1}>
          @{item.username}
        </Text>
        {item.bio ? (
          <Text style={[styles.userBio, { color: palette.textMuted }]} numberOfLines={2}>
            {item.bio}
          </Text>
        ) : null}
        <Text style={[styles.userMeta, { color: palette.textMuted }]}>
          {item.followersCount} pengikut · {item.postsCount} post
        </Text>
      </Pressable>
      {isCurrentUser ? (
        <Text style={[styles.selfLabel, { color: palette.textMuted }]}>Kamu</Text>
      ) : (
        <Pressable
          onPress={() => {
            void toggleFollow(item.id);
          }}
          disabled={pending}
          style={({ pressed }) => [
            styles.followButton,
            {
              backgroundColor: following ? palette.surfaceMuted : palette.primary,
              borderColor: following ? palette.border : palette.primary,
              opacity: pending ? 0.55 : pressed ? 0.78 : 1,
            },
          ]}
        >
          <Text
            style={[
              styles.followLabel,
              { color: following ? palette.text : '#FFFFFF' },
            ]}
          >
            {following ? 'Mengikuti' : 'Ikuti'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

export function SearchScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const nav = useNavigation<Nav>();
  const currentUserId = useAuthStore((state) => state.user?.id ?? null);
  const inputRef = useRef<TextInput>(null);

  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'explore'>('explore');
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [explorePosts, setExplorePosts] = useState<SearchPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [exploreLoaded, setExploreLoaded] = useState(false);

  useEffect(() => {
    if (exploreLoaded) return;
    setLoading(true);
    getExplorePosts(30)
      .then(setExplorePosts)
      .catch(() => { })
      .finally(() => {
        setLoading(false);
        setExploreLoaded(true);
      });
  }, [exploreLoaded]);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.trim().length === 0) {
      setUsers([]);
      setActiveTab('explore');
      return;
    }

    setActiveTab('users');
    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchUsers(text.trim());
        setUsers(results);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  const renderUserCard = useCallback(
    ({ item }: { item: SearchUser }) => (
      <SearchUserCard
        item={item}
        palette={palette}
        onOpen={() => {
          if (item.id === currentUserId) {
            nav.navigate('Main', {
              screen: 'HomeTabs',
              params: { screen: 'Profile' },
            });
            return;
          }

          nav.navigate('UserProfile', { userId: item.id });
        }}
      />
    ),
    [currentUserId, nav, palette],
  );

  const renderGridTile = useCallback(
    ({ item }: { item: SearchPost }) => (
      <Pressable
        onPress={() => nav.navigate('PostDetail', { postId: item.id })}
        style={styles.gridTile}
      >
        <Image
          source={{ uri: item.imageUrl! }}
          style={styles.gridImage}
          contentFit="cover"
        />
      </Pressable>
    ),
    [nav],
  );

  const TabButton = ({ tab, label, Icon }: { tab: 'users' | 'explore'; label: string; Icon: typeof Users }) => (
    <Pressable
      onPress={() => setActiveTab(tab)}
      style={[
        styles.tabBtn,
        activeTab === tab && { borderBottomColor: palette.primary, borderBottomWidth: 2 },
      ]}
    >
      <Icon size={16} color={activeTab === tab ? palette.primary : palette.textMuted} />
      <Text
        style={[
          styles.tabText,
          { color: activeTab === tab ? palette.primary : palette.textMuted },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const isSearching = searchText.trim().length > 0;
  const showUsers = activeTab === 'users';

  return (
    <Screen padded={false}>
      {/* Search Bar */}
      <View style={styles.searchWrap}>
        <View
          style={[styles.searchBox, { backgroundColor: palette.surface, borderColor: palette.border }]}
        >
          <Search size={18} color={palette.textMuted} />
          <TextInput
            ref={inputRef}
            placeholder="Cari pengguna..."
            placeholderTextColor={palette.textMuted}
            value={searchText}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.searchInput, { color: palette.text }]}
          />
          {isSearching && (
            <Pressable onPress={() => handleSearchChange('')}>
              <Text style={{ color: palette.textMuted, fontSize: 18, fontWeight: '700' }}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: palette.border }]}>
        <TabButton tab="explore" label="Jelajahi" Icon={TrendingUp} />
        <TabButton tab="users" label="Pengguna" Icon={Users} />
      </View>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={palette.primary} />
        </View>
      )}

      {/* Empty States */}
      {!loading && showUsers && users.length === 0 && isSearching && (
        <View style={styles.emptyWrap}>
          <Users size={32} color={palette.textMuted} />
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>
            Tidak ada pengguna ditemukan
          </Text>
        </View>
      )}

      {!loading && !showUsers && explorePosts.length === 0 && (
        <View style={styles.emptyWrap}>
          <TrendingUp size={32} color={palette.textMuted} />
          <Text style={[styles.emptyText, { color: palette.textMuted }]}>
            Belum ada postingan untuk dijelajahi
          </Text>
        </View>
      )}

      {/* Content */}
      {showUsers ? (
        <FlatList
          key="users-list"
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUserCard}
          contentContainerStyle={styles.userList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <FlatList
          key="explore-grid"
          data={explorePosts}
          keyExtractor={(item) => item.id}
          renderItem={renderGridTile}
          numColumns={NUM_COLUMNS}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  searchBox: {
    height: 44,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },

  loadingWrap: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },

  userList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  userAvatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarLetter: {
    fontSize: 18,
    fontWeight: '900',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
  },
  userHandle: {
    fontSize: 13,
  },
  userBio: {
    fontSize: 12,
    marginTop: 2,
  },
  userMeta: {
    marginTop: 4,
    fontSize: 11,
  },
  followButton: {
    minWidth: 82,
    minHeight: 36,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followLabel: {
    fontSize: 12,
    fontWeight: '900',
  },
  selfLabel: {
    minWidth: 56,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
  },

  gridRow: {
    gap: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridTile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
});
