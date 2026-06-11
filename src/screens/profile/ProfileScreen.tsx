import { Image } from 'expo-image';
import { LogOut } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { posts } from '../../data/mockData';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <View style={styles.header}>
        <Image source={{ uri: user?.avatarUrl }} style={styles.avatar} contentFit="cover" />
        <View style={styles.identity}>
          <Text style={[styles.name, { color: palette.text }]}>{user?.displayName}</Text>
          <Text style={[styles.username, { color: palette.textMuted }]}>@{user?.username}</Text>
        </View>
        <Pressable onPress={logout} style={[styles.logout, { backgroundColor: palette.surfaceMuted }]}>
          <LogOut size={18} color={palette.text} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        {[
          ['Posts', '12'],
          ['Followers', '2.4K'],
          ['Following', '318'],
        ].map(([label, value]) => (
          <View key={label} style={[styles.statCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent posts</Text>
      <View style={styles.grid}>
        {posts.map((post) => (
          <Image key={post.id} source={{ uri: post.imageUrl }} style={styles.tile} contentFit="cover" />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
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
  logout: {
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
  sectionTitle: {
    marginTop: 26,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
  },
  grid: {
    flexDirection: 'row',
    gap: 8,
  },
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
  },
});
