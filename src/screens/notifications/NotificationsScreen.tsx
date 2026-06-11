import { BellRing } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

const notifications = [
  'Naya menyukai post kamu.',
  'Bima mulai mengikuti kamu.',
  'Checkpoint animasi Minggu 14: minimal 2 fitur unggulan selesai.',
];

export function NotificationsScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Notifications</Text>
      <View style={styles.list}>
        {notifications.map((notification) => (
          <View
            key={notification}
            style={[styles.item, { backgroundColor: palette.surface, borderColor: palette.border }]}
          >
            <BellRing size={20} color={palette.primary} />
            <Text style={[styles.copy, { color: palette.text }]}>{notification}</Text>
          </View>
        ))}
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
  list: {
    gap: 10,
  },
  item: {
    minHeight: 62,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
