# Demo Script

Tanggal audit: 28 Juni 2026.

Script ini bisa dipakai untuk screen recording 3 sampai 4 menit dan presentasi Minggu 16.

## Persiapan Sebelum Rekam

1. Siapkan dua akun: Akun A sebagai pengirim, Akun B sebagai penerima.
2. Login Akun A di HP utama.
3. Pastikan Akun B sudah mengaktifkan push notification minimal sekali.
4. Siapkan beberapa gambar di galeri untuk post, story, dan avatar.
5. Pastikan internet stabil.

## Alur Demo 3-4 Menit

| Waktu | Aksi | Poin yang dijelaskan |
| --- | --- | --- |
| 0:00 - 0:25 | Tampilkan Login, Google Sign-In, dan masuk Feed | Auth lengkap dan Firebase session. |
| 0:25 - 0:55 | Scroll Feed, pull-to-refresh, double tap like | Animated feed, micro-interaction, pagination. |
| 0:55 - 1:20 | Buka post detail, tambah komentar multiline | Shared transition dan keyboard-aware comment form. |
| 1:20 - 1:45 | Buat post gambar dari tab Create | Firebase Storage dan Firestore create post. |
| 1:45 - 2:20 | Buat story, buka story viewer, tap/hold/swipe | Immersive story viewer dan progress Reanimated. |
| 2:20 - 2:45 | Reply story, buka tab Pesan | Story reply masuk DM, bukan bell notification. |
| 2:45 - 3:05 | Kirim DM dan tunjukkan push notification | Expo push notification untuk pesan langsung. |
| 3:05 - 3:25 | Buka Search dan profil publik, follow/unfollow | Discovery dan social graph. |
| 3:25 - 3:45 | Edit profile dan ganti avatar | Profile CRUD dan upload avatar file lokal. |
| 3:45 - 4:00 | Buka Animation Catalog dari Drawer | Dokumentasi animasi langsung di app. |

## Kalimat Teknis Singkat

- "Sociyo memakai Firebase Auth untuk email/password dan Google Sign-In."
- "Post, story, comment, follow, DM, dan notifikasi disimpan di Firestore."
- "Media post, story, dan avatar diupload ke Firebase Storage."
- "Feed memakai pagination dan cache offline AsyncStorage."
- "Animasi utama memakai Reanimated dan gesture memakai React Native Gesture Handler."
- "Reply story diperlakukan seperti Instagram: masuk ke DM dan dapat memicu push notification."

