import { MessageCircle } from 'lucide-react-native';
import { StyleSheet, Text } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function MessagesScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Pesan</Text>
      <EmptyState
        icon={<MessageCircle size={24} color={palette.primary} />}
        title="Belum ada pesan"
        message="DM akan tampil setelah fitur percakapan real-time disambungkan."
      />
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
});
