# Performance Report

Tanggal audit: 28 Juni 2026.

Dokumen ini adalah laporan performa awal untuk deliverable D1-3. Angka real FPS, JS thread, dan UI thread perlu diisi setelah profiling di perangkat Android yang dipakai demo.

## Target Performa

| Area | Target |
| --- | --- |
| Story viewer | Progress, tap, hold, dan swipe terasa 60fps pada perangkat Android mid-range. |
| Feed | Scroll post, image load, pull-to-refresh, dan like animation tidak stutter berat. |
| Photo viewer | Pinch, pan, double tap zoom, dan swipe dismiss responsif. |
| DM/comment keyboard | Input tetap terlihat dan transisi keyboard tidak menabrak system navigation bar. |

## Scene Profiling Wajib

| Scene | Fitur yang dites | Metrik yang perlu dicatat |
| --- | --- | --- |
| Feed | Scroll 30 post, custom refresh, double tap like, shared transition ke detail | FPS rata-rata, dropped frames, JS thread busy, memory image. |
| Story Viewer | Progress bar, tap next/prev, hold pause, swipe story, reply sheet | FPS rata-rata, UI thread frame time, gesture responsiveness. |
| Photo Viewer | Pinch zoom, pan, double tap zoom, swipe down dismiss | FPS rata-rata, UI thread frame time, gesture latency. |

## Optimasi yang Sudah Ada

| Area | Implementasi |
| --- | --- |
| Feed pagination | `getPosts` memakai limit 10 dan `startAfter` untuk infinite scroll. |
| Feed offline cache | Feed terakhir disimpan per user di AsyncStorage. |
| Image rendering | UI gambar memakai `expo-image`. |
| Reanimated worklets | Animasi story, feed card, tab, photo viewer, dan keyboard composer memakai Reanimated. |
| Gesture composition | Feed double tap memakai `Gesture.Exclusive`; photo viewer dan story viewer memakai gesture composition. |
| Client-side fallback sorting | Beberapa query disortir client-side untuk menghindari kebutuhan composite index mendadak saat demo. |
| DM realtime limit | Messages dibatasi `limitToLast(50)` untuk mengurangi beban render thread. |
| Post card image aspect clamp | Gambar feed dibatasi rasio 4:5 sampai 2:1 supaya layout stabil. |
| Story image contain | Story viewer tidak melakukan crop sehingga gambar tidak memicu layout ulang berlebihan. |

## Checklist Profiling Manual

1. Jalankan development build Android.
2. Login akun yang punya minimal 10 post, 3 story, dan 1 thread DM.
3. Buka Dev Menu atau Android Studio Profiler.
4. Rekam scene Feed selama 30 detik: scroll, refresh, double tap like, buka post detail.
5. Rekam scene Story Viewer selama 30 detik: next/prev, hold, swipe, reply sheet.
6. Rekam scene Photo Viewer selama 30 detik: pinch, pan, double tap, swipe down.
7. Catat FPS rata-rata, drop frame yang terlihat, memory peak, dan error/warning console.

## Tabel Hasil Profiling

Isi angka real setelah profiling perangkat.

| Scene | Device | FPS rata-rata | Dropped frames | JS thread | UI thread | Catatan |
| --- | --- | --- | --- | --- | --- | --- |
| Feed | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diprofiling. |
| Story Viewer | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diprofiling. |
| Photo Viewer | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diisi | Belum diprofiling. |

## Risiko Performa yang Masih Perlu Dipantau

| Risiko | Dampak | Mitigasi lanjutan |
| --- | --- | --- |
| Author info dibaca per post/comment | Bisa menambah read Firestore dan latency feed jika data besar | Denormalisasi snapshot author ke post/comment jika skala data membesar. |
| Explore order by likes tanpa cache | Bisa lambat pada data besar | Tambahkan pagination atau cache explore. |
| Story group membaca semua story aktif | Aman untuk demo kecil, berat jika banyak user | Tambahkan limit/following filter. |
| Upload image belum kompres | Upload bisa lambat dan file besar | Tambahkan kompresi image sebelum upload bila waktu cukup. |

## Kesimpulan Sementara

Secara implementasi, jalur animasi utama sudah memakai Reanimated dan Gesture Handler. Laporan ini belum boleh dianggap final sampai angka FPS/JS/UI thread dari perangkat demo sudah diisi.

