import { Image } from 'expo-image';
import { LogOut } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const avatarInitial = (
    user?.displayName?.trim().slice(0, 1) ||
    user?.username?.trim().slice(0, 1) ||
    '?'
  ).toUpperCase();

  return (
    <Screen>
      <View style={styles.header}>
        {user?.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatar} contentFit="cover" />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: palette.surfaceMuted }]}>
            <Text style={[styles.avatarInitial, { color: palette.text }]}>{avatarInitial}</Text>
          </View>
        )}
        <View style={styles.identity}>
          <Text style={[styles.name, { color: palette.text }]}>{user?.displayName}</Text>
          <Text style={[styles.username, { color: palette.textMuted }]}>@{user?.username}</Text>
        </View>
        <Pressable
          onPress={() => {
            void logout();
          }}
          style={[styles.logout, { backgroundColor: palette.surfaceMuted }]}
        >
          <LogOut size={18} color={palette.text} />
        </Pressable>
      </View>

      <View style={styles.stats}>
        {[
          ['Posts', '0'],
          ['Followers', '0'],
          ['Following', '0'],
        ].map(([label, value]) => (
          <View key={label} style={[styles.statCard, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.statValue, { color: palette.text }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: palette.textMuted }]}>{label}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Recent posts</Text>
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: palette.text }]}>Belum ada postingan</Text>
        <Text style={[styles.emptyCopy, { color: palette.textMuted }]}>
          Post milik user akan tampil setelah fitur upload dan feed disambungkan.
        </Text>
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
  avatarPlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: '900',
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
  emptyCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
