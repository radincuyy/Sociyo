import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing } from 'lucide-react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { Screen } from '../../components/Screen';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type NotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
        >
          <ChevronLeft size={24} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Notifications</Text>
        <View style={styles.backButton} />
      </View>
      <EmptyState
        icon={<BellRing size={24} color={palette.primary} />}
        title="Belum ada notifikasi"
        message="Notifikasi akan muncul setelah aktivitas real user tersambung."
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 48,
    marginTop: 4,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
  },
});
