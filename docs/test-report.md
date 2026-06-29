# Test Report

Tanggal audit: 28 Juni 2026.

Dokumen ini mencatat status pengujian menjelang deliverable Minggu 15.

## Scope

| Area | Status implementasi | Status test |
| --- | --- | --- |
| Auth email/password | Selesai | Perlu smoke test akun baru dan akun lama. |
| Google Sign-In | Selesai | Sudah pernah berhasil di development build, perlu retest sebelum demo. |
| Forgot password | Selesai | Perlu cek email reset terkirim. |
| Profile CRUD | Selesai | Perlu test edit nama, username unik, bio, upload avatar file lokal. |
| Feed pagination | Selesai | Perlu test scroll sampai load more. |
| Create/read/delete post | Selesai | Perlu test post teks, post gambar, dan delete milik sendiri. |
| Like/comment | Selesai | Perlu test counter, animasi like, comment multiline. |
| Follow/unfollow | Selesai | Perlu test dari UserProfile. |
| Search/explore | Selesai | Perlu test prefix username dan post gambar populer. |
| Story upload/view/reply | Selesai | Perlu test aspect ratio story, progress bar, pause, tap, swipe, reply ke DM. |
| DM realtime | Selesai | Perlu test dua akun aktif dan unread count. |
| Push notification | Selesai di app | Perlu test development build dengan FCM/EAS credentials yang valid. |
| Offline feed cache | Selesai | Perlu test mode airplane setelah feed pernah dimuat. |
| Dark/light mode | Selesai | Perlu test semua tab utama. |
| Animation catalog | Selesai | Perlu cek dari drawer. |

## Smoke Test Manual

Gunakan dua akun berbeda, misalnya Akun A dan Akun B.

1. Register akun baru.
2. Login email/password.
3. Logout lalu login ulang untuk memastikan sesi Auth persistent.
4. Login dengan Google pada development build.
5. Kirim reset password dari Forgot Password.
6. Edit profile: nama, username, bio, dan avatar dari file lokal.
7. Buat post teks.
8. Buat post gambar.
9. Buka post detail dari area post.
10. Buka profil publik dari avatar user.
11. Like post dari Feed dan dari double tap image.
12. Tambahkan komentar multiline.
13. Follow dan unfollow user lain.
14. Cari username di Search.
15. Buka explore image grid.
16. Buat story gambar.
17. Buka story viewer, test tap kanan, tap kiri, hold pause, swipe.
18. Reply story dari Akun A ke Akun B.
19. Pastikan reply story masuk ke tab Pesan.
20. Kirim DM biasa.
21. Aktifkan push notification di Settings.
22. Kirim DM dari akun lain, pastikan push muncul di HP penerima.
23. Matikan internet setelah Feed pernah dimuat, lalu buka ulang Feed untuk cek cache.
24. Ganti light/dark theme dan cek Feed, Profile, DM, Settings.

## Bug yang Sudah Diperbaiki

| Bug | Status |
| --- | --- |
| Drawer error `useLegacyImplementation` pada Reanimated modern | Diperbaiki. |
| Auth state tidak persistent karena AsyncStorage belum dipasang | Diperbaiki. |
| Navigator tanpa screen saat state auth loading | Diperbaiki. |
| Google Sign-In OAuth client salah tipe/custom scheme | Diperbaiki lewat Android client dan development build. |
| Reply story masuk bell notification | Diubah masuk DM dan push device. |
| Custom sound `default` expo-notifications | Diperbaiki dengan konfigurasi channel tanpa custom sound file. |
| Maximum update depth saat buka DM | Diperbaiki di flow message/read handling. |
| DM story reply bubble tidak menampilkan teks | Diperbaiki dengan layout bubble ala chat. |
| Keyboard comment terlalu jauh/menabrak nav bar | Diperbaiki dengan Reanimated keyboard-aware composer. |
| Keyboard DM menutupi input/header | Diperbaiki dengan composer dan message area yang ikut naik. |
| Story image ter-crop saat upload/view | Diperbaiki dengan `contentFit="contain"` dan tanpa crop picker. |
| Story progress bar tidak penuh pada story yang dilewati | Diperbaiki dengan segment state berdasarkan index. |

## Validasi Lokal

| Command | Hasil |
| --- | --- |
| `npm run typecheck` | Lolos pada 28 Juni 2026. |

## Catatan Keterbatasan

- Aku tidak dapat melakukan screen recording, screenshot device, atau profiling real FPS tanpa perangkat/runtime yang kamu jalankan.
- Push notification remote harus dites pada development build yang sudah memiliki `google-services.json`, EAS project ID, dan FCM credentials valid.
- APK build perlu akses EAS/Android build environment dan credential akun, jadi hasil final build harus kamu jalankan manual jika tidak ingin aku menyentuh server/build eksternal.
