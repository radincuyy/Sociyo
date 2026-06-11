# Sociyo

Starter tugas besar Kelompok 1 untuk mata kuliah Pemrograman Mobile Lanjut.
Fokus project: social media app React Native + Expo dengan pendekatan animations-first.

## Stack Awal

- Expo SDK 56 + React Native
- TypeScript
- React Navigation v7: Stack, Bottom Tab, Drawer
- Zustand
- Firebase Web SDK
- React Native Reanimated + Gesture Handler
- expo-image, expo-image-picker, expo-notifications

## Menjalankan Project

```bash
npm install
npm run start
```

Untuk Android:

```bash
npm run android
```

## Environment Firebase

Salin `.env.example` menjadi `.env`, lalu isi konfigurasi dari Firebase Console.

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Fokus Minggu 13

- Project Expo sudah dibuat.
- Struktur folder `src` sudah disiapkan.
- Navigasi Stack + Tab + Drawer sudah tersedia.
- Auth Firebase sudah tersedia untuk login, register, dan sesi user.
- Feed, story, profile, search, create post, notifications, settings sudah berupa skeleton.
- Reanimated dan Gesture Handler sudah mulai dipakai untuk katalog animasi awal.
