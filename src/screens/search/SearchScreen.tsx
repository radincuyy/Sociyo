import { Search } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';

export function SearchScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <Text style={[styles.title, { color: palette.text }]}>Search & Discovery</Text>
      <View
        style={[
          styles.searchBox,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Search size={20} color={palette.textMuted} />
        <TextInput
          placeholder="Cari user atau konten"
          placeholderTextColor={palette.textMuted}
          style={[styles.input, { color: palette.text }]}
        />
      </View>
      <View style={styles.emptyWrap}>
        <EmptyState
          icon={<Search size={24} color={palette.primary} />}
          title="Belum ada hasil"
          message="Data user dan konten akan muncul setelah search terhubung ke Firebase."
        />
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
  searchBox: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  emptyWrap: {
    marginTop: 16,
  },
});
