import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, Menu } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type FeedNavigation = NativeStackNavigationProp<RootStackParamList>;

export function FeedScreen() {
  const navigation = useNavigation<FeedNavigation>();
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen padded={false}>
      <View style={[styles.header, { borderBottomColor: palette.border }]}>
        <Pressable
          hitSlop={10}
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Menu size={23} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Sociyo</Text>
        <Pressable
          hitSlop={10}
          onPress={() => navigation.navigate('Notifications')}
          style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Bell size={22} color={palette.text} />
        </Pressable>
      </View>

      <View style={styles.emptyWrap}>
        <EmptyState
          icon={<Menu size={24} color={palette.primary} />}
          title="Belum ada postingan"
          message="Feed akan tampil setelah data post disambungkan ke Firebase."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
  },
  emptyWrap: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
});
