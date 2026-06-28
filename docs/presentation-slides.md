# Sociyo Presentation Slides

Draft ini mengikuti ketentuan tugas besar: maksimal 15 slide, ada demo section, menjelaskan fitur umum, fitur unggulan Kelompok 1, stack teknis, testing, performa, dan deliverable.

## Panduan Visual

- Gunakan tema light-first dengan aksen biru Sociyo `#0C8CE9`.
- Pakai screenshot HP asli untuk fitur utama. Hindari slide penuh teks.
- Komposisi aman: 1 judul, 3-5 poin, 1 visual utama.
- Font rekomendasi: Inter, SF Pro, atau Aptos.
- Rasio slide: 16:9.
- Setiap screenshot diberi label singkat, misalnya "Feed", "Story Viewer", "DM".

---

## Slide 1 - Cover

**Judul:** Sociyo  
**Subjudul:** Animations-First Social Media Experience  
**Isi slide:**
- Tugas Besar Pemrograman Mobile Lanjut
- Kelompok 1
- D3 Ilmu Komputer UPN Veteran Jakarta
- Anggota: [isi nama anggota kelompok]

**Visual:** Logo/icon Sociyo + 2-3 mockup layar utama.

**Speaker notes:**  
Sociyo adalah aplikasi media sosial berbasis React Native dan Expo. Fokus kelompok kami adalah membuat pengalaman social media yang terasa hidup melalui animasi, gesture, story viewer, dan transisi visual.

---

## Slide 2 - Latar Belakang dan Tujuan

**Judul:** Kenapa Sociyo?

**Isi slide:**
- Media sosial modern tidak hanya butuh fitur, tetapi juga interaksi yang terasa natural.
- Sociyo dibuat sebagai social media app dengan feed, story, profile, search, DM, dan notifikasi.
- Fokus utama: animations-first experience untuk meningkatkan feel aplikasi.

**Visual:** Diagram sederhana "User -> Feed -> Story -> DM -> Notification".

**Speaker notes:**  
Tujuan kami bukan hanya membuat CRUD social media, tetapi juga membangun pengalaman yang mirip aplikasi sosial modern: responsif, ada feedback visual, dan nyaman digunakan di mobile.

---

## Slide 3 - Requirement Mapping

**Judul:** Kesesuaian dengan Requirement

**Isi slide:**
- React Native + Expo, TypeScript.
- Navigation: Stack, Bottom Tab, Drawer.
- State management: Zustand.
- Firebase Auth, Firestore, dan Storage.
- Reanimated + Gesture Handler + expo-image.
- Minimum 8 operasi CRUD/API terpenuhi.

**Visual:** Checklist requirement dengan status "Done".

**Speaker notes:**  
Semua requirement utama sudah kami penuhi. Project memakai Expo SDK 56, Firebase untuk backend, Zustand untuk state, dan Reanimated serta Gesture Handler untuk kebutuhan animasi.

---

## Slide 4 - Tech Stack

**Judul:** Stack Teknologi

**Isi slide:**
- Frontend: Expo, React Native, TypeScript.
- Navigation: React Navigation Stack, Tab, Drawer.
- State: Zustand.
- Backend: Firebase Authentication, Firestore, Storage.
- Media & push: expo-image, expo-image-picker, expo-notifications.
- Animasi: Reanimated + Gesture Handler.

**Visual:** Layer stack berbentuk kartu: UI, State, Services, Firebase.

**Speaker notes:**  
Kami memisahkan layer aplikasi menjadi screen, component, store, service, dan type. Dengan struktur ini, UI tidak langsung memegang query Firebase, melainkan lewat store dan service.

---

## Slide 5 - Architecture

**Judul:** Arsitektur Aplikasi

**Isi slide:**
- Screens menampilkan UI dan interaksi.
- Zustand stores menyimpan state client.
- Services mengelola operasi Firebase dan push notification.
- Firebase menjadi backend utama untuk auth, database, dan media.
- AsyncStorage menyimpan cache feed offline.

**Visual:** Diagram:
`Screens -> Zustand Stores -> Services -> Firebase/AsyncStorage/Expo Push`

**Speaker notes:**  
Alur data utama berjalan dari screen ke Zustand, lalu ke service Firebase. Untuk feed offline, data post terakhir disimpan ke AsyncStorage per akun.

---

## Slide 6 - Firestore dan Storage Schema

**Judul:** Struktur Data Firebase

**Isi slide:**
- `users`: profil, avatar, counter, push token.
- `posts`: caption, image URL, likes, comments.
- `stories`: story 24 jam dan viewedBy.
- `threads/messages`: direct message dan story reply.
- Storage: post image, story image, avatar.

**Visual:** Mini ERD/collection map.

**Speaker notes:**  
Firestore dipakai untuk seluruh data utama aplikasi. Untuk file media, kami menyimpan file di Firebase Storage dan menyimpan URL download-nya di dokumen Firestore.

---

## Slide 7 - Authentication dan Profile

**Judul:** Auth Flow dan Profile CRUD

**Isi slide:**
- Register dan login email/password.
- Google Sign-In dengan development build.
- Forgot password via Firebase Auth.
- Profile CRUD: nama, username, bio, avatar upload.
- Public profile untuk melihat profil user lain.

**Visual:** Screenshot Login/Register/Edit Profile/Profile.

**Speaker notes:**  
Saat user login, aplikasi memastikan profil Firestore tersedia. Edit profile mendukung upload avatar dari file lokal, bukan input URL manual.

---

## Slide 8 - Core Social Features

**Judul:** Feed, Post, Search, dan Social Graph

**Isi slide:**
- Feed paginated dan infinite scroll.
- Create post dengan caption dan upload gambar.
- Like, comment, delete post.
- Search user dan explore post gambar.
- Follow/unfollow user.

**Visual:** Screenshot Feed + Create Post + Search.

**Speaker notes:**  
Fitur inti social media sudah bisa didemokan end-to-end: membuat post, melihat feed, like/comment, mencari user, membuka profil publik, dan follow/unfollow.

---

## Slide 9 - Featured 1: Immersive Story Viewer

**Judul:** Immersive Story Viewer

**Isi slide:**
- Story upload aktif 24 jam.
- Progress bar animasi seperti Instagram.
- Tap kanan/kiri untuk next/previous.
- Hold untuk pause dan resume.
- Swipe horizontal antar story.
- Reply story masuk ke DM.

**Visual:** Screenshot Story Row + Story Viewer + Reply Sheet.

**Speaker notes:**  
Story viewer menjadi fitur unggulan utama. Progress bar memakai Reanimated, gesture memakai Gesture Handler, dan reply story langsung masuk ke percakapan DM.

---

## Slide 10 - Featured 2: Animated Feed

**Judul:** Animated Feed Micro-interactions

**Isi slide:**
- Story ring rotation.
- Post card stagger fade-in.
- Double tap image untuk like.
- Heart spring animation.
- Like count micro-animation.
- Custom pull-to-refresh indicator.

**Visual:** Screenshot feed dengan anotasi ikon animasi.

**Speaker notes:**  
Di feed, user mendapat feedback visual untuk aksi penting. Double tap memakai `Gesture.Exclusive`, sedangkan animasi visualnya memakai Reanimated.

---

## Slide 11 - Featured 3 dan 4: Photo Viewer dan Smooth Transition

**Judul:** Photo Viewer dan Navigation Transition

**Isi slide:**
- Pinch-to-zoom foto.
- Pan foto saat zoom.
- Double tap untuk zoom cepat.
- Swipe down untuk dismiss.
- Shared hero transition post image ke detail.
- Bottom tab active animation.
- Keyboard-aware comment dan DM composer.

**Visual:** Screenshot Photo Viewer + Post Detail + DM keyboard.

**Speaker notes:**  
Photo viewer memakai `Gesture.Simultaneous` untuk menggabungkan pinch, pan, dan double tap. Smooth navigation juga terlihat dari shared image transition dan form yang mengikuti keyboard.

---

## Slide 12 - Notification, DM, Offline, Theme

**Judul:** Fitur Pendukung Aplikasi Modern

**Isi slide:**
- DM realtime dengan Firestore `onSnapshot`.
- Story reply masuk DM.
- Expo push notification untuk pesan langsung.
- Bell notification untuk follow, like, comment.
- Offline feed cache dengan AsyncStorage.
- Light/dark theme switching.

**Visual:** Screenshot Pesan + Settings Notification + Dark Mode.

**Speaker notes:**  
Push notification membutuhkan development build dan kredensial FCM/EAS yang valid. Untuk UX, story reply tidak masuk bell notification, tetapi masuk DM seperti aplikasi sosial modern.

---

## Slide 13 - Demo Section

**Judul:** Alur Demo Live

**Isi slide:**
1. Login atau Google Sign-In.
2. Scroll feed, refresh, double tap like.
3. Buka post detail dan tambah komentar.
4. Create post gambar.
5. Buat dan lihat story.
6. Reply story ke DM.
7. Tunjukkan push notification.
8. Search user, public profile, follow/unfollow.
9. Edit profile dan avatar.
10. Buka Animation Catalog.

**Visual:** Timeline demo 3-4 menit.

**Speaker notes:**  
Slide ini dipakai saat masuk sesi demo. Urutan demo disusun agar fitur umum, fitur unggulan, dan fitur teknis semuanya terlihat tanpa terlalu lama berpindah-pindah layar.

---

## Slide 14 - Testing, Bug Fixing, dan Performance

**Judul:** Testing dan Optimasi

**Isi slide:**
- TypeScript validation: `npm run typecheck`.
- Smoke test dua akun untuk DM dan push notification.
- Offline test dengan feed cache.
- Performance scene: Feed, Story Viewer, Photo Viewer.
- Bug fixing: keyboard composer, DM layout, story progress, auth persistence.

**Visual:** Tabel singkat test status + 3 scene performance.

**Speaker notes:**  
Pengujian dilakukan dengan smoke test manual karena aplikasi bergantung pada Firebase, media upload, push notification, dan gesture device. Performance report disiapkan untuk tiga scene utama.

---

## Slide 15 - Kesimpulan dan Q&A

**Judul:** Kesimpulan

**Isi slide:**
- Sociyo memenuhi fitur minimum social media app.
- Semua fitur unggulan Kelompok 1 sudah tersedia untuk demo.
- Aplikasi memakai Firebase end-to-end untuk auth, data, media, dan notification.
- Dokumentasi teknis, animation catalog, test report, dan demo script sudah disiapkan.
- Next: final screenshot, screen recording, profiling real device, APK final.

**Visual:** Logo Sociyo + QR/link GitHub/APK jika sudah siap.

**Speaker notes:**  
Kesimpulannya, Sociyo sudah berada di fase polish dan finalisasi deliverable. Bagian akhir yang perlu dilengkapi adalah bukti visual dan hasil profiling real device sebelum submit.

