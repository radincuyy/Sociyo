import { Search } from 'lucide-react-native';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { posts } from '../../data/mockData';
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
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.result, { backgroundColor: palette.surface, borderColor: palette.border }]}>
            <Text style={[styles.resultTitle, { color: palette.text }]}>{item.author}</Text>
            <Text numberOfLines={2} style={[styles.resultCopy, { color: palette.textMuted }]}>
              {item.caption}
            </Text>
          </View>
        )}
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
  list: {
    gap: 10,
    paddingVertical: 16,
  },
  result: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  resultCopy: {
    fontSize: 13,
    lineHeight: 19,
  },
});
