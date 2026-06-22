import { RefreshCw } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Extrapolation,
  cancelAnimation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

type AnimatedRefreshIndicatorProps = {
  refreshing: boolean;
  pullDistance: SharedValue<number>;
  color: string;
  backgroundColor: string;
  borderColor: string;
};

export function AnimatedRefreshIndicator({
  refreshing,
  pullDistance,
  color,
  backgroundColor,
  borderColor,
}: AnimatedRefreshIndicatorProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      rotation.value = 0;
      rotation.value = withRepeat(
        withTiming(360, { duration: 760 }),
        -1,
        false,
      );
      return;
    }

    cancelAnimation(rotation);
    rotation.value = withTiming(0, { duration: 180 });
  }, [refreshing, rotation]);

  const containerStyle = useAnimatedStyle(() => {
    const pullProgress = interpolate(
      pullDistance.value,
      [0, 18, 76],
      [0, 0.45, 1],
      Extrapolation.CLAMP,
    );

    return {
      opacity: refreshing ? 1 : pullProgress,
      transform: [
        {
          translateY: refreshing
            ? 10
            : interpolate(
                pullDistance.value,
                [0, 76],
                [-36, 10],
                Extrapolation.CLAMP,
              ),
        },
        {
          scale: refreshing ? 1 : 0.72 + pullProgress * 0.28,
        },
      ],
    };
  });

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: refreshing
          ? `${rotation.value}deg`
          : `${Math.min(220, pullDistance.value * 3)}deg`,
      },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.indicator,
        {
          backgroundColor,
          borderColor,
        },
        containerStyle,
      ]}
    >
      <Animated.View style={iconStyle}>
        <RefreshCw size={18} color={color} strokeWidth={2.5} />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    top: 0,
    alignSelf: 'center',
    zIndex: 4,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
