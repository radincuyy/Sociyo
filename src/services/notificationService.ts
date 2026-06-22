import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore } from './firebase';

export class NotificationPermissionError extends Error {
  constructor() {
    super('Izin notifikasi belum diberikan.');
    this.name = 'NotificationPermissionError';
  }
}

export class NotificationConfigurationError extends Error {
  constructor() {
    super('EAS Project ID belum dikonfigurasi.');
    this.name = 'NotificationConfigurationError';
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function getProjectId() {
  const environmentProjectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  const easProjectId = Constants.easConfig?.projectId;
  const appConfigProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const projectId = environmentProjectId || easProjectId || appConfigProjectId;

  return typeof projectId === 'string' && projectId.trim().length > 0
    ? projectId.trim()
    : null;
}

async function getExpoPushTokenWithRetry(projectId: string, maxAttempts: number) {
  let lastError: unknown = new Error('Gagal mengambil Expo push token.');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await Notifications.getExpoPushTokenAsync({ projectId });
    } catch (error) {
      lastError = error;
      console.warn('[notifications] token request failed', {
        attempt,
        maxAttempts,
        error,
      });
    }
  }

  throw lastError;
}

export async function getNotificationPermissionStatus() {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('social', {
      name: 'Aktivitas sosial',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0C8CE9',
    });
  }

  const existingPermissions = await Notifications.getPermissionsAsync();
  const finalPermissions =
    existingPermissions.status === 'granted'
      ? existingPermissions
      : await Notifications.requestPermissionsAsync();

  if (finalPermissions.status !== 'granted') {
    throw new NotificationPermissionError();
  }

  const projectId = getProjectId();

  if (!projectId) {
    throw new NotificationConfigurationError();
  }

  const tokenResponse = await getExpoPushTokenWithRetry(projectId, 2);

  await setDoc(
    doc(firestore, 'users', userId),
    {
      expoPushToken: tokenResponse.data,
      pushNotificationsEnabled: true,
      pushTokenPlatform: Platform.OS,
      pushTokenUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return tokenResponse.data;
}

export async function scheduleTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Sociyo',
      body: 'Notifikasi perangkat berhasil diaktifkan.',
      data: { screen: 'Notifications' },
    },
    trigger: null,
  });
}
