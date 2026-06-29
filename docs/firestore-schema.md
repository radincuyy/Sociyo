# Firestore Schema

Tanggal audit: 28 Juni 2026.

Dokumen ini mendeskripsikan struktur data Firestore yang dipakai Sociyo.

## `users/{userId}`

Profil utama pengguna. Dokumen dibuat saat register, login Google, atau login pertama.

| Field | Type | Keterangan |
| --- | --- | --- |
| `displayName` | string | Nama profil. |
| `username` | string | Username lower-case tanpa `@`, dipakai untuk search. |
| `email` | string atau null | Email Firebase Auth. |
| `avatarUrl` | string atau null | URL foto profil dari Firebase Storage atau Google account. |
| `bio` | string | Bio singkat profil. |
| `followersCount` | number | Counter follower. |
| `followingCount` | number | Counter following. |
| `postsCount` | number | Counter post. |
| `createdAt` | timestamp | Waktu profil dibuat. |
| `updatedAt` | timestamp | Waktu profil terakhir diperbarui. |
| `lastLoginAt` | timestamp | Waktu login terakhir. |
| `expoPushToken` | string atau null | Token Expo push notification. |
| `pushNotificationsEnabled` | boolean | Status opt-in notifikasi perangkat. |
| `pushTokenPlatform` | string | Platform token, misalnya `android`. |
| `pushTokenUpdatedAt` | timestamp | Waktu token push diperbarui. |

### `users/{userId}/followers/{followerId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `createdAt` | timestamp | Waktu user mulai mengikuti target. |

### `users/{userId}/following/{targetUserId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `createdAt` | timestamp | Waktu user mengikuti target. |

### `users/{userId}/notifications/{notificationId}`

Dipakai untuk bell notification di Feed. Reply story tidak ditampilkan di bell karena dialihkan ke DM.

| Field | Type | Keterangan |
| --- | --- | --- |
| `type` | `follow` atau `like` atau `comment` atau `story_reply` | Tipe aktivitas. UI bell menyaring `story_reply`. |
| `actorId` | string | User yang memicu aktivitas. |
| `actorName` | string | Snapshot nama aktor. |
| `actorAvatarUrl` | string atau null | Snapshot avatar aktor. |
| `entityId` | string atau null | ID post atau user terkait. |
| `preview` | string atau null | Potongan caption/comment. |
| `read` | boolean | Status dibaca. |
| `createdAt` | timestamp | Waktu aktivitas dibuat. |

## `posts/{postId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `authorId` | string | ID pemilik post. |
| `caption` | string | Teks post. |
| `imageUrl` | string atau null | URL gambar post dari Storage. |
| `location` | string atau null | Lokasi opsional. |
| `likesCount` | number | Counter like. |
| `commentsCount` | number | Counter komentar. |
| `createdAt` | timestamp | Waktu post dibuat. |
| `updatedAt` | timestamp | Waktu post diperbarui. |

### `posts/{postId}/likes/{userId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `createdAt` | timestamp | Waktu user melakukan like. |

### `posts/{postId}/comments/{commentId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `authorId` | string | ID penulis komentar. |
| `text` | string | Isi komentar. |
| `createdAt` | timestamp | Waktu komentar dibuat. |

## `stories/{storyId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `authorId` | string | ID pembuat story. |
| `imageUrl` | string | URL gambar story dari Storage. |
| `caption` | string | Saat ini dikirim kosong dari UI karena caption story dinonaktifkan. |
| `createdAt` | timestamp | Waktu story dibuat. |
| `expiresAt` | timestamp/date | Story aktif sampai 24 jam setelah dibuat. |
| `viewedBy` | string[] | Daftar userId yang sudah melihat story. |

## `threads/{threadId}`

`threadId` dibentuk dari dua userId yang diurutkan lalu digabung dengan `__`.

| Field | Type | Keterangan |
| --- | --- | --- |
| `participantIds` | string[] | Dua user yang ikut thread. |
| `participantProfiles` | map | Snapshot profil participant untuk header dan daftar pesan. |
| `lastMessage` | string | Preview pesan terakhir. |
| `lastMessageAt` | timestamp | Waktu pesan terakhir. |
| `lastSenderId` | string | Pengirim pesan terakhir. |
| `unreadCounts` | map number | Jumlah pesan belum dibaca per userId. |
| `updatedAt` | timestamp | Waktu thread terakhir diperbarui. |

### `threads/{threadId}/messages/{messageId}`

| Field | Type | Keterangan |
| --- | --- | --- |
| `senderId` | string | Pengirim pesan. |
| `recipientId` | string | Penerima pesan. |
| `kind` | `text` atau `story_reply` | Jenis pesan. |
| `text` | string | Isi pesan. |
| `storyId` | string atau null | ID story jika pesan berasal dari reply story. |
| `storyImageUrl` | string atau null | Snapshot gambar story untuk kartu reply. |
| `createdAt` | timestamp | Waktu pesan dibuat. |

## Firebase Storage

| Path | Isi |
| --- | --- |
| `posts/{authorId}/{timestamp}.jpg` | Gambar post. |
| `stories/{authorId}/{timestamp}.jpg` | Gambar story. |
| `avatars/{userId}/profile.jpg` | Foto profil user. |

## Query dan Index

| Fitur | Query |
| --- | --- |
| Feed | `posts` order by `createdAt desc`, limit pagination. |
| User posts | `posts` where `authorId == userId`, sort client-side by `createdAt desc`. |
| Explore | `posts` order by `likesCount desc`, skip post tanpa gambar. |
| Search user | `users` range query `username >= term` dan `username <= term + \uf8ff`, order by `username`. |
| Active stories | `stories` where `expiresAt > now`, group dan sort client-side. |
| DM threads | `threads` where `participantIds array-contains currentUserId`, sort client-side by `lastMessageAt desc`. |
| DM messages | `threads/{threadId}/messages` order by `createdAt asc`, limit last 50. |
| Bell notifications | `users/{uid}/notifications` order by `createdAt desc`, limit 50. |

