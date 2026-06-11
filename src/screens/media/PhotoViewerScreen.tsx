import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowDown } from 'lucide-react-native';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useMemo } from 'react';

import { Screen } from '../../components/Screen';
import type { RootStackParamList } from '../../types/navigation';

type PhotoViewerProps = NativeStackScreenProps<RootStackParamList, 'PhotoViewer'>;

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

export function PhotoViewerScreen({ navigation, route }: PhotoViewerProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const pinch = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          scale.value = clamp(savedScale.value * event.scale, 1, 4);
        })
        .onEnd(() => {
          savedScale.value = scale.value;
          if (scale.value <= 1.02) {
            scale.value = withSpring(1);
            savedScale.value = 1;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedX.value = 0;
            savedY.value = 0;
          }
        }),
    [savedScale, savedX, savedY, scale, translateX, translateY],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((event) => {
          if (scale.value > 1) {
            translateX.value = clamp(savedX.value + event.translationX, -160 * scale.value, 160 * scale.value);
            translateY.value = clamp(savedY.value + event.translationY, -220 * scale.value, 220 * scale.value);
            return;
          }
          translateY.value = event.translationY;
        })
        .onEnd((event) => {
          if (scale.value <= 1 && event.translationY > 150) {
            runOnJS(navigation.goBack)();
            return;
          }
          savedX.value = translateX.value;
          savedY.value = translateY.value;
          if (scale.value <= 1) {
            translateY.value = withSpring(0);
          }
        }),
    [navigation.goBack, savedX, savedY, scale, translateX, translateY],
  );

  const doubleTap = useMemo(
    () =>
      Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
          const nextScale = scale.value > 1 ? 1 : 2.2;
          scale.value = withSpring(nextScale);
          savedScale.value = nextScale;
          if (nextScale === 1) {
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedX.value = 0;
            savedY.value = 0;
          }
        }),
    [savedScale, savedX, savedY, scale, translateX, translateY],
  );

  const composed = Gesture.Simultaneous(pinch, pan, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.min(translateY.value, 180), [0, 180], [1, 0.35]),
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Screen padded={false} style={styles.screen}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.dismiss}>
          <ArrowDown size={22} color="#FFFFFF" />
        </Pressable>
        <Text numberOfLines={1} style={styles.caption}>
          {route.params.alt ?? 'Photo viewer'}
        </Text>
      </View>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.imageWrap, imageStyle]}>
          <Image source={{ uri: route.params.imageUrl }} style={styles.image} contentFit="contain" />
        </Animated.View>
      </GestureDetector>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#000000',
  },
  topBar: {
    minHeight: 56,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  dismiss: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  imageWrap: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
