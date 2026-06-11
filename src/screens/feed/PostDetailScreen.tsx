import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type PostDetailProps = NativeStackScreenProps<RootStackParamList, 'PostDetail'>;

export function PostDetailScreen({ navigation }: PostDetailProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ArrowLeft size={23} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Post detail</Text>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.content}>
        <View
          style={[
            styles.emptyCard,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: palette.text }]}>Post belum tersedia</Text>
          <Text style={[styles.emptyCopy, { color: palette.textMuted }]}>
            Detail post akan tampil setelah data feed diambil dari Firebase.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 18,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
