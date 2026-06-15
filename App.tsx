import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/useAuthStore';
import { useThemeStore } from './src/store/useThemeStore';
import { colors } from './src/theme/colors';

export default function App() {
  const mode = useThemeStore((state) => state.mode);
  const initializeAuthListener = useAuthStore((state) => state.initializeAuthListener);
  const palette = colors[mode];

  useEffect(() => {
    const unsubscribe = initializeAuthListener();

    return unsubscribe;
  }, [initializeAuthListener]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: palette.background }}>
      <SafeAreaProvider>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
