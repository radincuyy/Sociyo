import { Search } from 'lucide-react-native';
import { StyleSheet, Text, TextInput, View } from 'react-native';

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
      <View
        style={[
          styles.emptyCard,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <Text style={[styles.emptyTitle, { color: palette.text }]}>Belum ada hasil</Text>
        <Text style={[styles.emptyCopy, { color: palette.textMuted }]}>
          Data user dan konten akan muncul setelah search terhubung ke Firebase.
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
  emptyCard: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
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
