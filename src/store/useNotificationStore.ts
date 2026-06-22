import type { PermissionStatus } from 'expo-notifications';
import { create } from 'zustand';

import {
  NotificationConfigurationError,
  NotificationPermissionError,
  getNotificationPermissionStatus,
  registerForPushNotifications,
  scheduleTestNotification,
} from '../services/notificationService';

type NotificationState = {
  token: string | null;
  permissionStatus: PermissionStatus | null;
  isRegistering: boolean;
  error: string | null;
  refreshPermissionStatus: () => Promise<void>;
  register: (userId: string) => Promise<void>;
  sendTestNotification: () => Promise<void>;
  clearError: () => void;
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

export const useNotificationStore = create<NotificationState>((set) => ({
  token: null,
  permissionStatus: null,
  isRegistering: false,
  error: null,

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

  clearError: () => set({ error: null }),
}));
