import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BellRing, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';

type NotificationsScreenProps = NativeStackScreenProps<RootStackParamList, 'Notifications'>;

export function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const token = useNotificationStore((state) => state.token);
  const permissionStatus = useNotificationStore((state) => state.permissionStatus);
  const isRegistering = useNotificationStore((state) => state.isRegistering);
  const error = useNotificationStore((state) => state.error);
  const refreshPermissionStatus = useNotificationStore(
    (state) => state.refreshPermissionStatus,
  );
  const register = useNotificationStore((state) => state.register);
  const sendTestNotification = useNotificationStore(
    (state) => state.sendTestNotification,
  );

  useEffect(() => {
    void refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  const enableNotifications = async () => {
    if (!userId) return;

    try {
      await register(userId);
    } catch {
      return;
    }
  };

  const testNotification = async () => {
    try {
      await sendTestNotification();
    } catch {
      return;
    }
  };

  const statusText =
    permissionStatus === 'granted'
      ? token
        ? 'Push token perangkat sudah tersimpan.'
        : 'Izin aktif, push token belum tersimpan.'
      : permissionStatus === 'denied'
        ? 'Izin notifikasi ditolak.'
        : 'Notifikasi belum diaktifkan.';

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

      <View
        style={[
          styles.setupPanel,
          { backgroundColor: palette.surface, borderColor: palette.border },
        ]}
      >
        <View style={styles.setupHeader}>
          <ShieldCheck size={22} color={palette.primary} />
          <View style={styles.setupCopy}>
            <Text style={[styles.setupTitle, { color: palette.text }]}>Push notifications</Text>
            <Text style={[styles.setupText, { color: palette.textMuted }]}>{statusText}</Text>
          </View>
        </View>

        {error ? <Text style={[styles.error, { color: palette.accent }]}>{error}</Text> : null}

        <PrimaryButton
          onPress={enableNotifications}
          disabled={!userId || isRegistering}
        >
          {isRegistering ? 'Mengaktifkan...' : token ? 'Perbarui token' : 'Aktifkan notifikasi'}
        </PrimaryButton>

        {permissionStatus === 'granted' ? (
          <PrimaryButton variant="ghost" onPress={testNotification}>
            Kirim notifikasi tes
          </PrimaryButton>
        ) : null}
      </View>

      <Text style={[styles.sectionTitle, { color: palette.text }]}>Aktivitas terbaru</Text>
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
  setupPanel: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 12,
  },
  setupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  setupCopy: {
    flex: 1,
    gap: 4,
  },
  setupTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  setupText: {
    fontSize: 13,
    lineHeight: 19,
  },
  error: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '700',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '900',
  },
});
