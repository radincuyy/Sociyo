import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { firestore } from './firebase';

const MESSAGE_CHANNEL_ID = 'messages-v2';

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

type DirectMessagePushInput = {
  expoPushToken: string;
  senderName: string;
  messagePreview: string;
  threadId: string;
};

type ExpoPushResponse = {
  data?: {
    status?: string;
    message?: string;
    details?: {
      error?: string;
    };
  };
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
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

async function postExpoPushWithRetry(
  body: Record<string, unknown>,
  maxAttempts: number,
): Promise<ExpoPushResponse> {
  let lastError = new Error('Expo Push API tidak memberikan respons.');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(body),
      });
      const responseBody = (await response.json()) as ExpoPushResponse;

      if (!response.ok) {
        throw new Error(
          `Expo Push API gagal dengan status ${response.status}: ${JSON.stringify(responseBody)}`,
        );
      }

      return responseBody;
    } catch (error) {
      lastError =
        error instanceof Error
          ? error
          : new Error('Permintaan Expo Push API gagal.');
      console.warn('[notifications] push send failed', {
        attempt,
        maxAttempts,
        error: lastError,
      });
    }
  }

  throw lastError;
}

export async function getNotificationPermissionStatus() {
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function configureNotificationChannels(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('social', {
      name: 'Aktivitas sosial',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0C8CE9',
    });
    await Notifications.setNotificationChannelAsync(MESSAGE_CHANNEL_ID, {
      name: 'Pesan langsung',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 180, 120, 180],
      lightColor: '#0C8CE9',
    });
  }
}

export async function registerForPushNotifications(userId: string) {
  await configureNotificationChannels();

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
  const existingOwners = await getDocs(
    query(
      collection(firestore, 'users'),
      where('expoPushToken', '==', tokenResponse.data),
    ),
  );
  const ownershipBatch = writeBatch(firestore);

  existingOwners.docs
    .filter((owner) => owner.id !== userId)
    .forEach((owner) => {
      ownershipBatch.set(
        owner.ref,
        {
          expoPushToken: null,
          pushNotificationsEnabled: false,
          pushTokenUpdatedAt: serverTimestamp(),
        },
        { merge: true },
      );
    });

  if (existingOwners.docs.some((owner) => owner.id !== userId)) {
    await ownershipBatch.commit();
  }

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

export async function unregisterPushNotifications(
  userId: string,
): Promise<void> {
  await setDoc(
    doc(firestore, 'users', userId),
    {
      expoPushToken: null,
      pushNotificationsEnabled: false,
      pushTokenUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function sendDirectMessagePush(
  input: DirectMessagePushInput,
): Promise<void> {
  const response = await postExpoPushWithRetry(
    {
      to: input.expoPushToken,
      sound: 'default',
      title: input.senderName,
      body: input.messagePreview.slice(0, 160),
      channelId: MESSAGE_CHANNEL_ID,
      data: {
        screen: 'MessageThread',
        threadId: input.threadId,
      },
    },
    2,
  );

  if (response.data?.status !== 'ok') {
    throw new Error(
      `Expo Push API menolak pesan: ${response.data?.message ?? 'status tidak diketahui'} (${response.data?.details?.error ?? 'tanpa detail'}).`,
    );
  }
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
