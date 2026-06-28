# Animation Catalog

Tanggal audit: 28 Juni 2026.

Dokumen ini menjadi deliverable D1-2 Kelompok 1. Semua animasi aplikasi memakai Reanimated API, bukan React Native Animated API.

## Daftar Animasi

| Animasi | Lokasi | Library | Hook/API utama | Tujuan UX |
| --- | --- | --- | --- | --- |
| Story ring rotation | `src/components/StoryBubble.tsx` | Reanimated | `useSharedValue`, `useAnimatedStyle`, `withRepeat`, `withTiming` | Menandai story belum dilihat dengan ring yang hidup. |
| Feed custom story ring | `src/screens/feed/FeedScreen.tsx` | Reanimated | `useSharedValue`, `useAnimatedStyle`, `withRepeat` | Membuat row story terasa aktif. |
| Post card stagger fade-in | `src/components/AnimatedPostCard.tsx` | Reanimated | `withDelay`, `withTiming`, `Easing` | Post muncul bertahap saat feed dimuat. |
| Double-tap heart burst | `src/components/AnimatedPostCard.tsx` | Reanimated + Gesture Handler | `Gesture.Exclusive`, `runOnJS`, `withTiming` | Feedback visual saat user double tap gambar. |
| Heart icon spring | `src/components/AnimatedPostCard.tsx` | Reanimated | `withSequence`, `withSpring` | Ikon like terasa responsif saat ditekan. |
| Like count lift | `src/components/AnimatedPostCard.tsx` | Reanimated | `useAnimatedStyle`, `withTiming` | Counter like bergerak halus setelah perubahan. |
| Pull-to-refresh indicator | `src/components/AnimatedRefreshIndicator.tsx` | Reanimated | `withRepeat`, `withTiming`, `useAnimatedStyle` | Refresh feed memakai indikator custom. |
| Story progress bar | `src/screens/story/StoryViewerScreen.tsx` | Reanimated | `useSharedValue`, `useAnimatedStyle`, `withTiming`, `cancelAnimation` | Progress story berjalan, pause saat hold, dan penuh untuk story yang dilewati. |
| Story slide/fade transition | `src/screens/story/StoryViewerScreen.tsx` | Reanimated | `useAnimatedStyle`, `withTiming` | Perpindahan story terasa smooth. |
| Story reply bottom sheet | `src/screens/story/StoryViewerScreen.tsx` | Reanimated | `withSpring`, `withTiming`, `useAnimatedStyle` | Reply story muncul dari bawah. |
| Story hold pause gesture | `src/screens/story/StoryViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.LongPress`, `Gesture.Simultaneous`, `cancelAnimation` | User bisa menahan story seperti Instagram. |
| Story horizontal pan | `src/screens/story/StoryViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.Pan`, `Gesture.Simultaneous` | Swipe antar story. |
| Photo viewer pinch/pan | `src/screens/media/PhotoViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.Pinch`, `Gesture.Pan`, `Gesture.Simultaneous` | Zoom dan geser foto secara natural. |
| Photo double tap zoom | `src/screens/media/PhotoViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.Tap`, `withSpring` | Zoom cepat pada foto. |
| Photo swipe down dismiss | `src/screens/media/PhotoViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.Pan`, `interpolate`, `withSpring` | Tutup photo viewer dengan gesture. |
| Bottom tab active feedback | `src/navigation/AppNavigator.tsx` | Reanimated | `useSharedValue`, `useAnimatedStyle`, `withSpring` | Tab aktif scale dan warna berubah halus. |
| Post image shared hero transition | `src/utils/postTransition.ts`, `AnimatedPostCard`, `PostDetailScreen` | Reanimated shared transition | `SharedTransition`, `sharedTransitionTag` | Gambar post membesar smooth saat masuk detail. |
| Keyboard-aware comment composer | `src/screens/feed/PostDetailScreen.tsx` | Reanimated | `useAnimatedKeyboard`, `useAnimatedStyle`, `FadeInDown` | Form komentar mengikuti keyboard dan safe area. |
| Keyboard-aware DM composer | `src/screens/messages/MessageThreadScreen.tsx` | Reanimated | `useAnimatedKeyboard`, `useAnimatedStyle` | Input DM dan daftar pesan ikut naik saat keyboard muncul. |

## Gesture Composition

| Scene | Gesture | Komposisi |
| --- | --- | --- |
| Feed image | Single tap photo viewer dan double tap like | `Gesture.Exclusive` |
| Story viewer | Horizontal pan dan long press pause | `Gesture.Simultaneous` |
| Photo viewer | Pinch, pan, double tap | `Gesture.Simultaneous` |

## Catatan Validasi

- Requirement minimum 3 animasi sudah terpenuhi.
- Requirement minimum 2 gesture sudah terpenuhi.
- Scene paling penting untuk performance report: Feed, Story Viewer, Photo Viewer.
- Angka FPS/JS/UI thread real perlu diisi di `docs/performance-report.md` setelah profiling perangkat.
