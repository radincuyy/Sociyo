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

Untuk Android FCM, unduh `google-services.json` dari aplikasi Android Firebase
dengan package `com.radincuyy.sociyo`, letakkan di root project, lalu pastikan
`android.googleServicesFile` pada `app.json` mengarah ke file tersebut. Rebuild
development build setiap kali konfigurasi native Firebase berubah.

Pengiriman remote push melalui Expo juga memerlukan kredensial FCM V1 pada
project EAS. Akun penerima harus menekan **Aktifkan notifikasi** minimal sekali
agar `expoPushToken` tersimpan pada profil Firestore.

## Progress Saat Ini

### Selesai

- Authentication email/password, Google Sign-In, reset password, dan sesi persisten.
- Profile CRUD, navigation Stack + Tab + Drawer, dan dark/light theme.
- Create/read/delete post dengan Firebase Storage dan Firestore.
- Feed paginated, infinite scroll, like, comment, search user, dan explore grid.
- Follow/unfollow dari hasil pencarian pengguna.
- Story upload 24 jam, story ring, progress viewer, tap navigation, swipe, pause,
  slide transition, dan reply bottom sheet.
- Photo viewer dengan pinch, pan, double-tap zoom, dan swipe dismiss.
- Custom animated pull-to-refresh, staggered feed card, dan animasi bottom tab.
- Registrasi izin notifikasi dan Expo push token ke profil Firestore.
- Aktivitas notifikasi real-time untuk follow, like, dan comment.
- Reply story masuk ke DM real-time, tampil pada tab Pesan, dan mengirim Expo push
  notification ke perangkat penerima yang sudah mengaktifkan notifikasi.
- Feed menyimpan cache per akun dan tetap dapat dibaca saat perangkat offline.
- Gambar post memakai shared hero transition menuju detail post.
- Form komentar mengikuti keyboard dan safe area Android menggunakan Reanimated.
- Profil publik pengguna lain dengan follow/unfollow, tab Postingan/Media, dan
  tombol untuk memulai percakapan DM.
- Avatar dan nama pengguna pada Search, Feed, dan Post Detail membuka profil publik.

### Status Timeline

- Minggu 13 Foundation Sprint: selesai.
- Minggu 14 Core Features Sprint: selesai untuk alur aplikasi dan setup push token.
- Minggu 14 Feature-Specific Sprint: tiga fitur unggulan sudah dapat didemokan,
  yaitu Immersive Story Viewer, Animated Feed, dan Interactive Photo Viewer.
- Minggu 15 Advanced Sprint: offline feed cache dan fitur unggulan Smooth Navigation
  Transitions sudah diimplementasikan; tahap berikutnya adalah pengujian perangkat
  dan optimasi performa.

### Berikutnya

- Melakukan smoke test push notification dan DM pada dua akun.
- Smoke test offline cache, shared transition, form komentar, push notification,
  dan DM menggunakan development build Android.
- Performance profiling, bug fixing lintas perangkat, build APK, test report,
  screenshot README, dan dokumentasi final.
