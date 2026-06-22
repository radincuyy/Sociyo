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
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
EXPO_PUBLIC_EAS_PROJECT_ID=
```

Untuk Google Sign-In, aktifkan provider Google di Firebase Authentication, lalu isi
`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` dengan OAuth Client ID tipe Web. Untuk Android,
buat OAuth Client tipe Android dengan package `com.radincuyy.sociyo` dan SHA-1 debug
project ini, lalu gunakan development build karena native Google Sign-In tidak tersedia
di Expo Go.

Untuk Expo push notifications, isi `EXPO_PUBLIC_EAS_PROJECT_ID` dari konfigurasi
project EAS. Setelah menambahkan plugin `expo-notifications`, rebuild development
build agar konfigurasi native diterapkan.

## Progress Saat Ini

### Selesai

- Authentication email/password, Google Sign-In, reset password, dan sesi persisten.
- Profile CRUD, navigation Stack + Tab + Drawer, dan dark/light theme.
- Create/read/delete post dengan Firebase Storage dan Firestore.
- Feed paginated, infinite scroll, like, comment, search user, dan explore grid.
- Follow/unfollow dari hasil pencarian pengguna.
- Story upload 24 jam, story ring, progress viewer, tap navigation, swipe, dan pause.
- Photo viewer dengan pinch, pan, double-tap zoom, dan swipe dismiss.
- Registrasi izin notifikasi dan Expo push token ke profil Firestore.

### Berikutnya

- Menampilkan aktivitas notifikasi dari backend dan mengirim push notification.
- Reply story dengan bottom sheet.
- Custom animated pull-to-refresh dan animasi bottom tab.
- Offline cache, performance profiling, APK, dan dokumentasi final.
