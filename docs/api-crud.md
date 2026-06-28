# API and CRUD Documentation

Tanggal audit: 28 Juni 2026.

Sociyo tidak memakai REST backend sendiri. Operasi API pada project ini berupa service function di sisi client yang berinteraksi langsung dengan Firebase Auth, Firestore, Firebase Storage, Expo Push API, dan AsyncStorage.

## Authentication dan Profile

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Register email/password | `useAuthStore.register` | Firebase Auth + Firestore | Membuat akun dan dokumen `users/{uid}`. |
| Login email/password | `useAuthStore.login` | Firebase Auth | Login dan memuat profil Firestore. |
| Google Sign-In | `useAuthStore.loginWithGoogle` + `useGoogleSignIn` | Google OAuth + Firebase Auth | Login Google dengan development build. |
| Forgot password | `useAuthStore.sendPasswordReset` | Firebase Auth | Mengirim email reset password. |
| Logout | `useAuthStore.logout` | Firebase Auth | Menghapus sesi client. |
| Ensure user profile | `ensureUserProfile` | Firestore | Membuat atau update profil saat login. |
| Update profile | `useAuthStore.updateUserProfile` | Firestore + Firebase Auth | Update display name, username, bio, avatar. |
| Upload avatar | `profileService.uploadAvatarImage` | Firebase Storage | Upload file lokal ke `avatars/{userId}/profile.jpg`. |
| Read public profile | `profileService.getPublicUserProfile` | Firestore | Mengambil profil publik user lain. |

## Feed dan Post

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Upload post image | `postService.uploadPostImage` | Firebase Storage | Upload gambar ke `posts/{authorId}`. |
| Create post | `postService.createPost` | Firestore + Storage | Membuat post dan menaikkan `postsCount`. |
| Read feed | `postService.getPosts` | Firestore | Pagination 10 post berdasarkan `createdAt desc`. |
| Read post detail | `postService.getPostById` | Firestore | Mengambil satu post beserta author dan status liked. |
| Read user posts | `postService.getUserPosts` | Firestore | Mengambil post milik satu user. |
| Delete post | `postService.deletePost` | Firestore + Storage | Menghapus post dan menurunkan `postsCount`. |
| Toggle like | `postService.toggleLike` | Firestore | Membuat/menghapus `likes/{userId}` dan update counter. |
| Add comment | `postService.addComment` | Firestore | Menambah komentar dan update `commentsCount`. |
| Read comments | `postService.getComments` | Firestore | Mengambil komentar urut naik. |

## Follow

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Check following | `followService.isFollowing` | Firestore | Cek `users/{current}/following/{target}`. |
| Follow user | `followService.followUser` | Firestore | Batch set following/follower dan update counter. |
| Unfollow user | `followService.unfollowUser` | Firestore | Batch delete following/follower dan update counter. |
| Toggle follow | `followService.toggleFollow` | Firestore | Wrapper follow/unfollow. |
| Get followers | `followService.getFollowers` | Firestore | Membaca subcollection followers. |
| Get following | `followService.getFollowing` | Firestore | Membaca subcollection following. |

## Story

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Upload story image | `storyService.uploadStoryImage` | Firebase Storage | Upload gambar ke `stories/{authorId}`. |
| Create story | `storyService.createStory` | Firestore + Storage | Membuat story aktif 24 jam. |
| Read story groups | `storyService.getStoryGroups` | Firestore | Mengambil story aktif lalu group per author. |
| Mark viewed | `storyService.markStoryViewed` | Firestore | Menambah userId ke `viewedBy`. |
| Send story reply | `storyService.sendStoryReply` | Firestore + Expo Push | Validasi story lalu kirim sebagai DM `story_reply`. |

## Direct Message

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Build thread ID | `messageService.getDirectMessageThreadId` | Local | ID deterministik dua user. |
| Send text message | `messageService.sendTextMessage` | Firestore + Expo Push | Simpan pesan, update thread, kirim push jika token tersedia. |
| Send story reply message | `messageService.sendStoryReplyMessage` | Firestore + Expo Push | Simpan pesan `story_reply`. |
| Subscribe threads | `messageService.subscribeMessageThreads` | Firestore realtime | Realtime daftar DM user. |
| Subscribe messages | `messageService.subscribeMessages` | Firestore realtime | Realtime isi thread. |
| Read thread | `messageService.getMessageThread` | Firestore | Ambil detail thread dan validasi participant. |
| Mark read | `messageService.markThreadRead` | Firestore | Set unread count user menjadi 0. |

## Notification

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Configure channel | `notificationService.configureNotificationChannels` | Native Android | Channel aktivitas sosial dan pesan langsung. |
| Get permission | `notificationService.getNotificationPermissionStatus` | Expo Notifications | Cek status izin notifikasi. |
| Register push token | `notificationService.registerForPushNotifications` | Expo + Firestore | Ambil Expo token dan simpan ke `users/{uid}`. |
| Unregister push token | `notificationService.unregisterPushNotifications` | Firestore | Hapus token dan disable push. |
| Send DM push | `notificationService.sendDirectMessagePush` | Expo Push API | Kirim remote push untuk DM. |
| Test notification | `notificationService.scheduleTestNotification` | Expo Notifications | Menampilkan local notification. |
| Create activity notification | `activityService.createActivityNotification` | Firestore | Bell notification untuk follow/like/comment. |
| Subscribe activity notification | `activityService.subscribeActivityNotifications` | Firestore realtime | Realtime bell notification, story reply difilter. |
| Mark activity read | `activityService.markActivityNotificationsRead` | Firestore | Batch update `read = true`. |

## Search, Explore, dan Offline

| Operasi | Lokasi | Backend | Keterangan |
| --- | --- | --- | --- |
| Search users | `searchService.searchUsers` | Firestore | Prefix search berdasarkan username. |
| Explore posts | `searchService.getExplorePosts` | Firestore | Post gambar populer berdasarkan likes. |
| Read feed cache | `feedCache.readFeedCache` | AsyncStorage | Mengambil snapshot feed offline per user. |
| Write feed cache | `feedCache.writeFeedCache` | AsyncStorage | Menyimpan snapshot feed terbaru per user. |

## Hitungan Minimum CRUD

Requirement minimum adalah 8 operasi CRUD/API. Project saat ini sudah melewati angka itu. Minimal yang dapat didemokan:

1. Register user.
2. Login user.
3. Update profile.
4. Create post.
5. Read feed.
6. Delete post.
7. Toggle like.
8. Add comment.
9. Follow/unfollow.
10. Create story.
11. Reply story ke DM.
12. Send direct message.
13. Register push notification token.

