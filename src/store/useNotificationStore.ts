import type { PermissionStatus } from 'expo-notifications';
import { create } from 'zustand';

import {
  NotificationConfigurationError,
  NotificationPermissionError,
  getNotificationPermissionStatus,
  registerForPushNotifications,
  scheduleTestNotification,
} from '../services/notificationService';
import {
  markActivityNotificationsRead,
  subscribeActivityNotifications,
} from '../services/activityService';
import type { ActivityNotification } from '../types/social';

type NotificationState = {
  token: string | null;
  permissionStatus: PermissionStatus | null;
  isRegistering: boolean;
  activities: ActivityNotification[];
  unreadCount: number;
  isLoadingActivities: boolean;
  isMarkingRead: boolean;
  error: string | null;
  activitiesError: string | null;
  refreshPermissionStatus: () => Promise<void>;
  register: (userId: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  subscribeToActivities: (userId: string) => () => void;
  markAllRead: (userId: string) => Promise<void>;
  clearError: () => void;
  resetSession: () => void;
};

function getNotificationErrorMessage(error: unknown) {
  if (error instanceof NotificationPermissionError) {
    return 'Izin notifikasi ditolak. Aktifkan melalui pengaturan perangkat.';
  }

  if (error instanceof NotificationConfigurationError) {
    return 'Isi EXPO_PUBLIC_EAS_PROJECT_ID untuk mengambil push token.';
  }

  return 'Gagal mengaktifkan notifikasi. Periksa koneksi dan konfigurasi build.';
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  token: null,
  permissionStatus: null,
  isRegistering: false,
  activities: [],
  unreadCount: 0,
  isLoadingActivities: false,
  isMarkingRead: false,
  error: null,
  activitiesError: null,

  refreshPermissionStatus: async () => {
    const permissionStatus = await getNotificationPermissionStatus();
    set({ permissionStatus });
  },

  register: async (userId) => {
    set({ isRegistering: true, error: null });

    try {
      const token = await registerForPushNotifications(userId);
      const permissionStatus = await getNotificationPermissionStatus();
      set({ token, permissionStatus, isRegistering: false });
    } catch (error) {
      const permissionStatus = await getNotificationPermissionStatus();
      set({
        permissionStatus,
        isRegistering: false,
        error: getNotificationErrorMessage(error),
      });
      throw error;
    }
  },

  sendTestNotification: async () => {
    set({ error: null });

    try {
      await scheduleTestNotification();
    } catch (error) {
      set({ error: getNotificationErrorMessage(error) });
      throw error;
    }
  },

  subscribeToActivities: (userId) => {
    set({
      activities: [],
      unreadCount: 0,
      isLoadingActivities: true,
      activitiesError: null,
    });

    return subscribeActivityNotifications(
      userId,
      (activities) => {
        set({
          activities,
          unreadCount: activities.filter((activity) => !activity.read).length,
          isLoadingActivities: false,
          activitiesError: null,
        });
      },
      (error) => {
        set({
          isLoadingActivities: false,
          activitiesError: error.message,
        });
      },
    );
  },

  markAllRead: async (userId) => {
    const state = get();
    const unreadActivities = state.activities.filter(
      (activity) => !activity.read,
    );

    if (unreadActivities.length === 0 || state.isMarkingRead) {
      return;
    }

    const originalActivities = state.activities;

    set({
      activities: originalActivities.map((activity) => ({
        ...activity,
        read: true,
      })),
      unreadCount: 0,
      isMarkingRead: true,
      activitiesError: null,
    });

    try {
      await markActivityNotificationsRead(
        userId,
        unreadActivities.map((activity) => activity.id),
      );
      set({ isMarkingRead: false });
    } catch (error) {
      set({
        activities: originalActivities,
        unreadCount: unreadActivities.length,
        isMarkingRead: false,
        activitiesError:
          error instanceof Error
            ? error.message
            : 'Gagal menandai notifikasi sebagai dibaca.',
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  resetSession: () =>
    set({
      token: null,
      permissionStatus: null,
      isRegistering: false,
      activities: [],
      unreadCount: 0,
      isLoadingActivities: false,
      isMarkingRead: false,
      error: null,
      activitiesError: null,
    }),
}));
