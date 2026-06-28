# User Manual

Tanggal audit: 28 Juni 2026.

Panduan ini ditulis untuk pengguna non-teknis yang ingin mencoba fitur Sociyo.

## Persiapan

1. Install APK atau buka development build Sociyo yang sudah dibagikan.
2. Pastikan internet aktif untuk login, feed, upload foto, dan DM.
3. Untuk push notification, gunakan development build Android yang sudah berisi konfigurasi Firebase native.

## Membuat Akun

1. Buka Sociyo.
2. Pilih Register.
3. Isi nama, username, email, dan password.
4. Tekan Register.
5. Setelah berhasil, aplikasi masuk ke Feed.

## Login

1. Buka Sociyo.
2. Isi email dan password, lalu tekan Sign in.
3. Alternatif: tekan tombol Google untuk login dengan akun Google.

## Reset Password

1. Pada halaman Login, pilih Forgot Password.
2. Masukkan email akun.
3. Tekan Forgot Password.
4. Cek email untuk link reset password dari Firebase.

## Mengubah Profil

1. Masuk ke tab Profile.
2. Tekan Edit profile.
3. Ubah nama, username, bio, atau foto profil.
4. Untuk foto profil, pilih gambar dari perangkat.
5. Tekan Done untuk menyimpan.

## Membuat Post

1. Masuk ke tab Create.
2. Tulis caption.
3. Tambahkan foto jika diperlukan.
4. Tambahkan lokasi jika ingin.
5. Tekan Posting.

## Membaca Feed

1. Masuk ke tab Feed.
2. Scroll untuk melihat post terbaru.
3. Tarik layar ke bawah untuk refresh.
4. Saat offline, feed terakhir yang pernah tersimpan tetap dapat dibuka.

## Like dan Comment

1. Pada Feed, tekan ikon hati untuk like.
2. Double tap gambar post untuk like cepat.
3. Tekan ikon komentar atau area post untuk membuka detail.
4. Tulis komentar di input bawah.
5. Tombol enter keyboard dipakai untuk line break, bukan mengirim komentar.
6. Tekan tombol kirim untuk mengirim komentar.

## Search dan Explore

1. Masuk ke tab Search.
2. Ketik username untuk mencari pengguna.
3. Tekan profil untuk membuka profil publik.
4. Bagian explore menampilkan post gambar populer.

## Follow Pengguna

1. Buka profil publik dari Search, Feed, atau Post Detail.
2. Tekan Follow untuk mengikuti.
3. Tekan Following untuk berhenti mengikuti.

## Membuat Story

1. Dari Feed, tekan item Cerita Anda.
2. Pilih foto dari galeri.
3. Foto story ditampilkan sesuai aspect ratio aslinya.
4. Tekan Bagikan.

## Melihat Story

1. Tekan story bubble pengguna di Feed.
2. Tap kanan untuk story berikutnya.
3. Tap kiri untuk story sebelumnya.
4. Tahan layar untuk pause progress.
5. Swipe horizontal untuk berpindah story.
6. Tekan input reply di bawah untuk membalas story.

## Pesan Langsung

1. Masuk ke tab Pesan.
2. Pilih thread pesan.
3. Tulis pesan di input bawah.
4. Tekan tombol kirim.
5. Reply story otomatis masuk ke DM dan dapat mengirim push notification ke penerima.

## Notifikasi

1. Masuk ke Settings.
2. Pada kartu Push notifications, tekan Aktifkan notifikasi.
3. Izinkan notifikasi dari sistem Android.
4. Tekan Kirim notifikasi tes untuk memastikan local notification muncul.
5. Bell di Feed menampilkan aktivitas follow, like, dan comment. Reply story masuk ke DM.

## Theme

1. Buka Settings.
2. Gunakan toggle theme untuk berpindah light/dark.

## Slot Screenshot Deliverable

Screenshot perlu diambil langsung dari perangkat karena aku tidak memegang UI runtime kamu. Daftar screenshot yang disarankan:

| Screenshot | Lokasi |
| --- | --- |
| Login/Register | Auth screens. |
| Feed + story row | Tab Feed. |
| Create post | Tab Create. |
| Post detail + comment keyboard | Post Detail. |
| Story viewer | StoryViewer. |
| DM thread + story reply | MessageThread. |
| Profile + edit profile | Profile dan EditProfile. |
| Search + public profile | Search dan UserProfile. |
| Settings notification | Settings. |

