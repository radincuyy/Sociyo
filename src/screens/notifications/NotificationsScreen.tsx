import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import {
  BellRing,
  ChevronLeft,
  Heart,
  MessageCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react-native';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Avatar } from '../../components/Avatar';
import { EmptyState } from '../../components/EmptyState';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useThemeStore } from '../../store/useThemeStore';
import { colors, type AppPalette } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import type {
  ActivityNotification,
  ActivityNotificationType,
} from '../../types/social';

type NotificationsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Notifications'
>;

function formatActivityTime(createdAt: string): string {
  const elapsedMinutes = Math.max(
    0,
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000),
  );

  if (elapsedMinutes < 1) {
    return 'baru saja';
  }

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} mnt`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} jam`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  return `${elapsedDays} hari`;
}

function getActivityCopy(activity: ActivityNotification): string {
  if (activity.type === 'follow') {
    return 'mulai mengikuti Anda.';
  }

  if (activity.type === 'like') {
    return 'menyukai postingan Anda.';
  }

  if (activity.type === 'comment') {
    return activity.preview
      ? `mengomentari postingan Anda: "${activity.preview}"`
      : 'mengomentari postingan Anda.';
  }

  return 'mengirim aktivitas baru.';
}

function getActivityIcon(
  type: ActivityNotificationType,
  palette: AppPalette,
) {
  if (type === 'follow') {
    return <UserPlus size={17} color={palette.primary} />;
  }

  if (type === 'like') {
    return <Heart size={17} color={palette.accent} fill={palette.accent} />;
  }

  if (type === 'comment') {
    return <MessageCircle size={17} color={palette.primary} />;
  }

  return <MessageCircle size={17} color={palette.success} />;
}

export function NotificationsScreen({
  navigation,
}: NotificationsScreenProps) {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const token = useNotificationStore((state) => state.token);
  const permissionStatus = useNotificationStore(
    (state) => state.permissionStatus,
  );
  const isRegistering = useNotificationStore((state) => state.isRegistering);
  const error = useNotificationStore((state) => state.error);
  const activities = useNotificationStore((state) => state.activities);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const isLoadingActivities = useNotificationStore(
    (state) => state.isLoadingActivities,
  );
  const activitiesError = useNotificationStore(
    (state) => state.activitiesError,
  );
  const refreshPermissionStatus = useNotificationStore(
    (state) => state.refreshPermissionStatus,
  );
  const register = useNotificationStore((state) => state.register);
  const sendTestNotification = useNotificationStore(
    (state) => state.sendTestNotification,
  );
  const markAllRead = useNotificationStore((state) => state.markAllRead);

  useEffect(() => {
    void refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  useFocusEffect(
    useCallback(() => {
      if (!userId || unreadCount === 0) {
        return;
      }

      void markAllRead(userId).catch((markError: unknown) => {
        console.warn('[notifications] mark all read failed', {
          userId,
          error: markError,
        });
      });
    }, [markAllRead, unreadCount, userId]),
  );

  async function enableNotifications() {
    if (!userId) {
      return;
    }

    try {
      await register(userId);
    } catch (registerError) {
      console.warn('[notifications] registration failed', {
        userId,
        error: registerError,
      });
    }
  }

  async function testNotification() {
    try {
      await sendTestNotification();
    } catch (testError) {
      console.warn('[notifications] local test failed', {
        error: testError,
      });
    }
  }

  const statusText =
    permissionStatus === 'granted'
      ? token
        ? 'Push token perangkat sudah tersimpan.'
        : 'Izin aktif, push token belum tersimpan.'
      : permissionStatus === 'denied'
        ? 'Izin notifikasi ditolak.'
        : 'Notifikasi belum diaktifkan.';

  const openActivity = useCallback(
    (activity: ActivityNotification) => {
      if (
        activity.entityId &&
        (activity.type === 'like' || activity.type === 'comment')
      ) {
        navigation.navigate('PostDetail', { postId: activity.entityId });
      }
    },
    [navigation],
  );

  const renderActivity = useCallback(
    ({ item }: { item: ActivityNotification }) => {
      const canOpenPost =
        Boolean(item.entityId) &&
        (item.type === 'like' || item.type === 'comment');

      return (
        <Pressable
          disabled={!canOpenPost}
          onPress={() => openActivity(item)}
          style={({ pressed }) => [
            styles.activityRow,
            {
              backgroundColor: item.read
                ? palette.background
                : palette.primarySoft,
              borderBottomColor: palette.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <View style={styles.avatarWrap}>
            <Avatar
              displayName={item.actorName}
              username={item.actorId}
              avatarUrl={item.actorAvatarUrl}
              size={44}
            />
            <View
              style={[
                styles.typeIcon,
                {
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                },
              ]}
            >
              {getActivityIcon(item.type, palette)}
            </View>
          </View>

          <View style={styles.activityCopy}>
            <Text style={[styles.activityText, { color: palette.text }]}>
              <Text style={styles.actorName}>{item.actorName}</Text>{' '}
              {getActivityCopy(item)}
            </Text>
            <Text style={[styles.activityTime, { color: palette.textMuted }]}>
              {formatActivityTime(item.createdAt)}
            </Text>
          </View>

          {!item.read ? (
            <View style={[styles.unreadDot, { backgroundColor: palette.primary }]} />
          ) : null}
        </Pressable>
      );
    },
    [openActivity, palette],
  );

  const listHeader = (
    <>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <ChevronLeft size={24} color={palette.text} />
        </Pressable>
        <Text style={[styles.title, { color: palette.text }]}>Notifications</Text>
        <View style={styles.backButton} />
      </View>

      <View
        style={[
          styles.setupPanel,
          {
            backgroundColor: palette.surface,
            borderColor: palette.border,
          },
        ]}
      >
        <View style={styles.setupHeader}>
          <ShieldCheck size={22} color={palette.primary} />
          <View style={styles.setupCopy}>
            <Text style={[styles.setupTitle, { color: palette.text }]}>
              Push notifications
            </Text>
            <Text style={[styles.setupText, { color: palette.textMuted }]}>
              {statusText}
            </Text>
          </View>
        </View>

        {error ? (
          <Text style={[styles.error, { color: palette.accent }]}>{error}</Text>
        ) : null}

        <PrimaryButton
          onPress={enableNotifications}
          disabled={!userId || isRegistering}
        >
          {isRegistering
            ? 'Mengaktifkan...'
            : token
              ? 'Perbarui token'
              : 'Aktifkan notifikasi'}
        </PrimaryButton>

        {permissionStatus === 'granted' ? (
          <PrimaryButton variant="ghost" onPress={testNotification}>
            Kirim notifikasi tes
          </PrimaryButton>
        ) : null}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: palette.text }]}>
          Aktivitas terbaru
        </Text>
        {activities.length > 0 ? (
          <Text style={[styles.activityCount, { color: palette.textMuted }]}>
            {activities.length}
          </Text>
        ) : null}
      </View>

      {activitiesError ? (
        <Text style={[styles.activityError, { color: palette.accent }]}>
          {activitiesError}
        </Text>
      ) : null}
    </>
  );

  return (
    <Screen padded={false}>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderActivity}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          isLoadingActivities ? (
            <View style={styles.loadingActivities}>
              <ActivityIndicator color={palette.primary} />
              <Text style={[styles.loadingText, { color: palette.textMuted }]}>
                Memuat aktivitas...
              </Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState
                icon={<BellRing size={24} color={palette.primary} />}
                title="Belum ada notifikasi"
                message="Like, komentar, dan follow akan muncul di sini. Balasan story masuk ke Pesan."
              />
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 28,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: 12,
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
    fontSize: 24,
    fontWeight: '900',
  },
  setupPanel: {
    marginHorizontal: 16,
    marginTop: 8,
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
  sectionHeader: {
    minHeight: 52,
    paddingHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  activityCount: {
    fontSize: 13,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  activityError: {
    marginHorizontal: 16,
    marginBottom: 10,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  activityRow: {
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrap: {
    width: 48,
    height: 48,
  },
  typeIcon: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCopy: {
    flex: 1,
    gap: 4,
  },
  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actorName: {
    fontWeight: '900',
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingActivities: {
    paddingVertical: 44,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
});
