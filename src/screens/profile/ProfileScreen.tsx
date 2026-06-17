import { Edit3, ImagePlus, UserRound, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import { getUserPosts } from '../../services/postService';
import type { Post } from '../../types/social';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 2;
const NUM_COLUMNS = 3;
const TILE_SIZE = (SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS - 1) - 32) / NUM_COLUMNS; // account for paddingHorizontal 16

type ProfileFormState = {
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string;
};

function getProfileFormState(
  user: ReturnType<typeof useAuthStore.getState>['user'],
): ProfileFormState {
  return {
    displayName: user?.displayName ?? '',
    username: user?.username ?? '',
    bio: user?.bio ?? '',
    avatarUrl: user?.avatarUrl ?? '',
  };
}

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const clearError = useAuthStore((state) => state.clearError);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [isEditing, setIsEditing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState<ProfileFormState>(getProfileFormState(user));

  useEffect(() => {
    setForm(getProfileFormState(user));
  }, [user]);

  const canSave = form.displayName.trim().length > 0 && form.username.trim().length > 0 && !isLoading;

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const nav = useNavigation<Nav>();

  const updateForm = (field: keyof ProfileFormState, value: string) => {
    clearError();
    setNotice(null);
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const startEditing = () => {
    clearError();
    setNotice(null);
    setForm(getProfileFormState(user));
    setIsEditing(true);
  };

  const cancelEditing = () => {
    clearError();
    setNotice(null);
    setForm(getProfileFormState(user));
    setIsEditing(false);
  };

  const saveProfile = async () => {
    if (!canSave) return;

    try {
      await updateUserProfile(form);
      setNotice('Profil berhasil diperbarui.');
      setIsEditing(false);
    } catch {
      return;
    }
  };

  useEffect(() => {
    // load user's posts for grid
    if (!user) return;
    let mounted = true;
    setPostsLoading(true);
    getUserPosts(user.id, 100)
      .then((res) => {
        if (!mounted) return;
        setPosts(res);
      })
      .catch(() => {
        if (!mounted) return;
        setPosts([]);
      })
      .finally(() => {
        if (!mounted) return;
        setPostsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [user]);

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

  return (
    <Screen padded={false}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.keyboard}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.header}>
            <Avatar
              displayName={user.displayName}
              username={user.username}
              avatarUrl={user.avatarUrl}
              size={82}
            />
            <View style={styles.identity}>
              <Text style={[styles.name, { color: palette.text }]}>{user.displayName}</Text>
              <Text style={[styles.username, { color: palette.textMuted }]}>@{user.username}</Text>
            </View>
            <Pressable
              onPress={startEditing}
              disabled={isEditing}
              style={[
                styles.iconButton,
                { backgroundColor: palette.surfaceMuted, opacity: isEditing ? 0.55 : 1 },
              ]}
            >
              <Edit3 size={18} color={palette.text} />
            </Pressable>
          </View>

          <View style={styles.stats}>
            {[
              ['Posts', String(user.postsCount)],
              ['Followers', String(user.followersCount)],
              ['Following', String(user.followingCount)],
            ].map(([label, value]) => (
              <View
                key={label}
                style={[
                  styles.statCard,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                ]}
              >
                <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
                <Text style={[styles.statLabel, { color: palette.textMuted }]}>{label}</Text>
              </View>
            ))}
          </View>

          {isEditing ? (
            <View style={[styles.editPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <View style={styles.panelHeader}>
                <Text style={[styles.panelTitle, { color: palette.text }]}>Edit profile</Text>
                <Pressable onPress={cancelEditing} hitSlop={8}>
                  <X size={20} color={palette.textMuted} />
                </Pressable>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>Name</Text>
                <TextInput
                  placeholder="Nama lengkap"
                  placeholderTextColor={palette.textMuted}
                  value={form.displayName}
                  onChangeText={(value) => updateForm('displayName', value)}
                  style={[
                    styles.input,
                    { backgroundColor: palette.background, borderColor: palette.border, color: palette.text },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>Username</Text>
                <TextInput
                  placeholder="username"
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  value={form.username}
                  onChangeText={(value) => updateForm('username', value)}
                  style={[
                    styles.input,
                    { backgroundColor: palette.background, borderColor: palette.border, color: palette.text },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>Bio</Text>
                <TextInput
                  multiline
                  placeholder="Tulis bio singkat..."
                  placeholderTextColor={palette.textMuted}
                  value={form.bio}
                  onChangeText={(value) => updateForm('bio', value)}
                  style={[
                    styles.textArea,
                    { backgroundColor: palette.background, borderColor: palette.border, color: palette.text },
                  ]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: palette.text }]}>Avatar URL</Text>
                <TextInput
                  placeholder="https://..."
                  placeholderTextColor={palette.textMuted}
                  autoCapitalize="none"
                  keyboardType="url"
                  value={form.avatarUrl}
                  onChangeText={(value) => updateForm('avatarUrl', value)}
                  style={[
                    styles.input,
                    { backgroundColor: palette.background, borderColor: palette.border, color: palette.text },
                  ]}
                />
                <Text style={[styles.fieldHint, { color: palette.textMuted }]}>
                  Upload avatar ke Storage masuk sprint Minggu 14; sekarang URL dulu untuk CRUD profil.
                </Text>
              </View>

              {error ? <Text style={[styles.error, { color: palette.accent }]}>{error}</Text> : null}
              <PrimaryButton onPress={saveProfile} disabled={!canSave}>
                {isLoading ? 'Menyimpan...' : 'Simpan profil'}
              </PrimaryButton>
            </View>
          ) : (
            <View style={[styles.bioCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
              <Text style={[styles.cardTitle, { color: palette.text }]}>Bio</Text>
              <Text style={[styles.bioText, { color: user.bio ? palette.text : palette.textMuted }]}>
                {user.bio || 'Belum ada bio. Tap tombol edit untuk menambahkan bio singkat.'}
              </Text>
              {notice ? <Text style={[styles.notice, { color: palette.success }]}>{notice}</Text> : null}
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent posts</Text>
          {/* Recent posts grid */}
          {postsLoading ? (
            <View style={{ paddingVertical: 12 }}>
              <ActivityIndicator color={palette.primary} />
            </View>
          ) : posts.length === 0 ? (
            <EmptyState
              icon={<ImagePlus size={24} color={palette.primary} />}
              title="Belum ada postingan"
              message="Post milik user akan tampil setelah fitur upload dan feed disambungkan."
            />
          ) : (
            <FlatList
              data={posts}
              keyExtractor={(item) => item.id}
              numColumns={NUM_COLUMNS}
              columnWrapperStyle={styles.gridRow}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => nav.navigate('PostDetail', { postId: item.id })}
                  style={styles.gridTile}
                >
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.gridImage} contentFit="cover" />
                  ) : (
                    <View style={[styles.gridFallback, { backgroundColor: palette.surface }]}>
                      <Text numberOfLines={2} style={{ color: palette.text, fontWeight: '700' }}>{item.caption}</Text>
                    </View>
                  )}
                </Pressable>
              )}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  identity: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '900',
  },
  username: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  editPanel: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  fieldGroup: {
    gap: 7,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '900',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  textArea: {
    minHeight: 92,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  fieldHint: {
    fontSize: 12,
    lineHeight: 17,
  },
  error: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  bioCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
  cardTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  notice: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '800',
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
  },

  // grid
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
  gridFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
});
