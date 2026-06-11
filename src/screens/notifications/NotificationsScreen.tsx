import { BellRing } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function NotificationsScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Notifications</Text>
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <BellRing size={24} color={palette.primary} />
        <Text style={[styles.emptyTitle, { color: palette.text }]}>Belum ada notifikasi</Text>
        <Text style={[styles.emptyCopy, { color: palette.textMuted }]}>
          Notifikasi akan muncul setelah aktivitas real user tersambung.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: 12,
    marginBottom: 16,
    fontSize: 26,
    fontWeight: '900',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
