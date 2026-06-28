# Submission Checklist

Tanggal audit: 28 Juni 2026.

Checklist ini merangkum sisa deliverable berdasarkan `memory.md`.

## Sudah Ada di Project

| Deliverable | Status |
| --- | --- |
| Source code GitHub | Sudah ada repo dan branch kerja. |
| React Native + Expo app | Selesai. |
| Stack + Tab + Drawer navigation | Selesai. |
| Firebase Auth email/password | Selesai. |
| Google Sign-In | Selesai pada development build. |
| Firebase Firestore | Selesai untuk post, user, story, DM, notification. |
| Firebase Storage upload | Selesai untuk post, story, avatar. |
| 8+ CRUD/API operations | Selesai, lihat `docs/api-crud.md`. |
| Reanimated animation catalog | Selesai, lihat `docs/animation-catalog.md`. |
| Gesture Handler gestures | Selesai. |
| expo-image | Digunakan pada gambar app. |
| Offline feed cache | Selesai. |
| Dark/light mode | Selesai. |
| User manual draft | Selesai, lihat `docs/user-manual.md`. |
| Architecture docs | Selesai, lihat `docs/architecture.md`. |
| Firestore schema docs | Selesai, lihat `docs/firestore-schema.md`. |
| API docs | Selesai, lihat `docs/api-crud.md`. |
| Test report draft | Selesai, lihat `docs/test-report.md`. |
| Performance report draft | Selesai, lihat `docs/performance-report.md`. |

## Masih Perlu Dikerjakan Manual

| Item | Kenapa manual |
| --- | --- |
| Screenshot fitur utama | Perlu diambil dari device/emulator yang menjalankan app. |
| Screen recording 3-4 menit | Perlu runtime visual dan akun demo. Gunakan `docs/demo-script.md`. |
| Angka FPS/JS/UI thread final | Perlu profiling device. |
| APK build final | Perlu EAS/Android build credential dan proses build eksternal. |
| PPT maksimal 15 slide | Perlu desain slide dan screenshot final. |
| Upload final ke LMS LeADS | Perlu akun mahasiswa. |

## Rekomendasi Urutan Berikutnya

1. Jalankan smoke test dari `docs/test-report.md`.
2. Ambil screenshot setiap fitur utama.
3. Profiling tiga scene utama lalu isi `docs/performance-report.md`.
4. Rekam demo mengikuti `docs/demo-script.md`.
5. Build APK dengan profile EAS yang sudah disiapkan.
6. Buat PPT final dari README dan dokumen teknis.
7. Merge `develop` ke `main` setelah semua bukti final siap.

