import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Bell, Home, ListVideo, PlusCircle, Search, Settings, UserRound } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { colors } from '../theme/colors';
import type {
  AuthStackParamList,
  MainDrawerParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CreatePostScreen } from '../screens/create/CreatePostScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AnimationCatalogScreen } from '../screens/catalog/AnimationCatalogScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { StoryViewerScreen } from '../screens/story/StoryViewerScreen';
import { PhotoViewerScreen } from '../screens/media/PhotoViewerScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();

function BootScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <View style={[styles.bootScreen, { backgroundColor: palette.background }]}>
      <ActivityIndicator color={palette.primary} size="large" />
      <Text style={[styles.bootText, { color: palette.textMuted }]}>Menyiapkan sesi...</Text>
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.textMuted,
        tabBarStyle: {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.border,
          minHeight: 62,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarIcon: ({ color, size }) => {
          const iconSize = Math.max(size, 21);
          if (route.name === 'Feed') return <Home size={iconSize} color={color} />;
          if (route.name === 'Search') return <Search size={iconSize} color={color} />;
          if (route.name === 'Create') return <PlusCircle size={iconSize + 2} color={color} />;
          if (route.name === 'Notifications') return <Bell size={iconSize} color={color} />;
          return <UserRound size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ title: 'Create' }} />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Alerts' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: palette.primary,
        drawerInactiveTintColor: palette.textMuted,
        drawerStyle: { backgroundColor: palette.surface },
        drawerLabelStyle: { fontWeight: '700' },
      }}
    >
      <Drawer.Screen
        name="HomeTabs"
        component={MainTabs}
        options={{
          title: 'Sociyo',
          drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="AnimationCatalog"
        component={AnimationCatalogScreen}
        options={{
          title: 'Animation Catalog',
          drawerIcon: ({ color, size }) => <ListVideo size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Drawer.Navigator>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  const navigationTheme: Theme = useMemo(
    () => ({
      ...(mode === 'dark' ? DarkTheme : DefaultTheme),
      colors: {
        ...(mode === 'dark' ? DarkTheme.colors : DefaultTheme.colors),
        background: palette.background,
        card: palette.surface,
        primary: palette.primary,
        text: palette.text,
        border: palette.border,
        notification: palette.accent,
      },
    }),
    [mode, palette],
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isInitializing ? (
          <RootStack.Screen name="Boot" component={BootScreen} />
        ) : isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainDrawer} />
            <RootStack.Screen name="PostDetail" component={PostDetailScreen} />
            <RootStack.Screen name="StoryViewer" component={StoryViewerScreen} />
            <RootStack.Screen name="PhotoViewer" component={PhotoViewerScreen} />
          </>
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  bootScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  bootText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
