# Animation Catalog - Draft D1-2

Dokumen ini menjadi dasar deliverable D1-2 Kelompok 1.

| Animasi | Lokasi | Library | Hook/API |
| --- | --- | --- | --- |
| Story ring rotation | `src/components/StoryBubble.tsx` | Reanimated | `useSharedValue`, `useAnimatedStyle`, `withRepeat` |
| Post card stagger fade-in | `src/components/AnimatedPostCard.tsx` | Reanimated | `withDelay`, `withTiming` |
| Double-tap heart burst | `src/components/AnimatedPostCard.tsx` | Reanimated + Gesture Handler | `Gesture.Exclusive`, `runOnJS`, `withSequence` |
| Story progress pause/resume | `src/screens/story/StoryViewerScreen.tsx` | Reanimated | `withTiming`, `cancelAnimation` |
| Pinch + pan photo viewer | `src/screens/media/PhotoViewerScreen.tsx` | Reanimated + Gesture Handler | `Gesture.Simultaneous`, `useAnimatedStyle` |

Catatan profiling FPS, JS thread, dan UI thread akan ditambahkan saat scene utama sudah stabil.
