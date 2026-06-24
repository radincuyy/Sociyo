import {
  createNavigationContainerRef,
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import * as ExpoNotifications from 'expo-notifications';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ListVideo, LogOut, MessageCircle, PlusCircle, Search, Settings } from 'lucide-react-native';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useMessageStore } from '../store/useMessageStore';
import { useThemeStore } from '../store/useThemeStore';
import { configureNotificationChannels } from '../services/notificationService';
import { colors } from '../theme/colors';
import type {
  AuthStackParamList,
  MainDrawerParamList,
  MainTabParamList,
  RootStackParamList,
} from '../types/navigation';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { MessageThreadScreen } from '../screens/messages/MessageThreadScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CreatePostScreen } from '../screens/create/CreatePostScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { AnimationCatalogScreen } from '../screens/catalog/AnimationCatalogScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { CreateStoryScreen } from '../screens/story/CreateStoryScreen';
import { StoryViewerScreen } from '../screens/story/StoryViewerScreen';
import { PhotoViewerScreen } from '../screens/media/PhotoViewerScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

const drawerItems = [
  { name: 'HomeTabs', label: 'Sociyo', Icon: Home },
  { name: 'AnimationCatalog', label: 'Animation Catalog', Icon: ListVideo },
  { name: 'Settings', label: 'Settings', Icon: Settings },
] as const;

function BootScreen() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <View style={[styles.bootScreen, { backgroundColor: palette.background }]}>
      <Image
        source={require('../../assets/sociyo-icon.png')}
        resizeMode="contain"
        style={styles.bootLogo}
      />
      <Text style={[styles.bootBrand, { color: palette.text }]}>Sociyo</Text>
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
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabs() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const userId = useAuthStore((state) => state.user?.id ?? null);
  const subscribeToActivities = useNotificationStore(
    (state) => state.subscribeToActivities,
  );
  const resetNotificationSession = useNotificationStore(
    (state) => state.resetSession,
  );
  const subscribeThreads = useMessageStore((state) => state.subscribeThreads);
  const resetMessages = useMessageStore((state) => state.reset);
  const totalUnreadMessages = useMessageStore((state) => state.totalUnread);

  useEffect(() => {
    if (!userId) {
      resetNotificationSession();
      resetMessages();
      return;
    }

    const unsubscribeActivities = subscribeToActivities(userId);
    const unsubscribeThreads = subscribeThreads(userId);

    return () => {
      unsubscribeActivities();
      unsubscribeThreads();
      resetNotificationSession();
      resetMessages();
    };
  }, [
    resetMessages,
    resetNotificationSession,
    subscribeThreads,
    subscribeToActivities,
    userId,
  ]);

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
        tabBarIcon: ({ color, focused, size }) => {
          const iconSize = Math.max(size, 21);
          let icon: ReactNode;

          if (route.name === 'Feed') {
            icon = <Home size={iconSize} color={color} />;
          } else if (route.name === 'Messages') {
            icon = <MessageCircle size={iconSize} color={color} />;
          } else if (route.name === 'Create') {
            icon = <PlusCircle size={iconSize + 2} color={color} />;
          } else if (route.name === 'Search') {
            icon = <Search size={iconSize} color={color} />;
          } else {
            icon = <ProfileTabIcon focused={focused} size={iconSize} />;
          }

          return (
            <AnimatedTabIcon
              focused={focused}
              badgeColor={palette.accent}
              badgeCount={
                route.name === 'Messages' ? totalUnreadMessages : 0
              }
            >
              {icon}
            </AnimatedTabIcon>
          );
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Messages" component={MessagesScreen} options={{ title: 'Pesan' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ title: 'Create' }} />
      <Tab.Screen name="Search" component={SearchScreen} options={{ title: 'Search' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

type AnimatedTabIconProps = {
  focused: boolean;
  badgeColor: string;
  badgeCount: number;
  children: ReactNode;
};

function AnimatedTabIcon({
  focused,
  badgeColor,
  badgeCount,
  children,
}: AnimatedTabIconProps) {
  const activeProgress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withSpring(focused ? 1 : 0, {
      damping: 14,
      stiffness: 210,
      mass: 0.7,
    });
  }, [activeProgress, focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: activeProgress.value * -2 },
      { scale: 1 + activeProgress.value * 0.14 },
    ],
  }));

  return (
    <Animated.View style={[styles.animatedTabIcon, iconStyle]}>
      {children}
      {badgeCount > 0 ? (
        <View style={[styles.messageBadge, { backgroundColor: badgeColor }]}>
          <Text style={styles.messageBadgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
}

type ProfileTabIconProps = {
  focused: boolean;
  size: number;
};

function ProfileTabIcon({ focused, size }: ProfileTabIconProps) {
  const user = useAuthStore((state) => state.user);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const avatarSize = Math.max(24, size + 3);

  return (
    <View
      style={[
        styles.profileTabAvatar,
        {
          borderColor: focused ? palette.primary : palette.border,
          opacity: focused ? 1 : 0.78,
        },
      ]}
    >
      <Avatar
        displayName={user?.displayName ?? ''}
        username={user?.username ?? ''}
        avatarUrl={user?.avatarUrl ?? null}
        size={avatarSize}
      />
    </View>
  );
}

function MainDrawer() {
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <Drawer.Navigator
      drawerContent={(props) => <MainDrawerContent {...props} />}
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

function MainDrawerContent(props: DrawerContentComponentProps) {
  const logout = useAuthStore((state) => state.logout);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerContent}>
      <View style={styles.drawerBrand}>
        <Image
          source={require('../../assets/sociyo-icon.png')}
          resizeMode="contain"
          style={styles.drawerLogo}
        />
        <View style={styles.drawerBrandCopy}>
          <Text style={[styles.drawerBrandTitle, { color: palette.text }]}>Sociyo</Text>
          <Text style={[styles.drawerBrandSubtitle, { color: palette.textMuted }]}>
            Social moments, animated.
          </Text>
        </View>
      </View>

      {drawerItems.map((item) => {
        const isFocused = props.state.routeNames[props.state.index] === item.name;

        return (
          <DrawerItem
            key={item.name}
            label={item.label}
            focused={isFocused}
            activeTintColor={palette.primary}
            inactiveTintColor={palette.textMuted}
            activeBackgroundColor={palette.surfaceMuted}
            labelStyle={styles.drawerItemLabel}
            icon={({ color, size }) => <item.Icon size={size} color={color} />}
            onPress={() => {
              props.navigation.navigate(item.name);
            }}
          />
        );
      })}

      <View style={[styles.drawerFooter, { borderTopColor: palette.border }]}>
        <DrawerItem
          label="Logout"
          icon={({ size }) => <LogOut size={size} color={palette.accent} />}
          inactiveTintColor={palette.accent}
          labelStyle={styles.drawerLogoutLabel}
          onPress={() => {
            void logout();
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export function AppNavigator() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const mode = useThemeStore((state) => state.mode);
  const palette = colors[mode];
  const [navigationReady, setNavigationReady] = useState(false);
  const [pendingThreadId, setPendingThreadId] = useState<string | null>(null);

  useEffect(() => {
    void configureNotificationChannels().catch((error: unknown) => {
      console.warn('[notifications] channel setup failed', { error });
    });
  }, []);

  useEffect(() => {
    function captureMessageThread(
      response: ExpoNotifications.NotificationResponse | null,
    ) {
      const data = response?.notification.request.content.data;
      const threadId =
        data && typeof data.threadId === 'string' ? data.threadId : null;
      const screen =
        data && typeof data.screen === 'string' ? data.screen : null;

      if (screen === 'MessageThread' && threadId) {
        setPendingThreadId(threadId);
      }
    }

    const subscription =
      ExpoNotifications.addNotificationResponseReceivedListener(
        captureMessageThread,
      );

    void ExpoNotifications.getLastNotificationResponseAsync()
      .then((response) => {
        captureMessageThread(response);
        if (response) {
          void ExpoNotifications.clearLastNotificationResponseAsync().catch(
            (error: unknown) => {
              console.warn('[notifications] clear response failed', { error });
            },
          );
        }
      })
      .catch((error: unknown) => {
        console.warn('[notifications] last response read failed', { error });
      });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (
      !isAuthenticated ||
      !navigationReady ||
      !pendingThreadId ||
      !navigationRef.isReady()
    ) {
      return;
    }

    navigationRef.navigate('MessageThread', {
      threadId: pendingThreadId,
    });
    setPendingThreadId(null);
  }, [isAuthenticated, navigationReady, pendingThreadId]);

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
    <NavigationContainer
      ref={navigationRef}
      theme={navigationTheme}
      onReady={() => setNavigationReady(true)}
    >
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isInitializing ? (
          <RootStack.Screen name="Boot" component={BootScreen} />
        ) : isAuthenticated ? (
          <>
            <RootStack.Screen name="Main" component={MainDrawer} />
            <RootStack.Screen name="Notifications" component={NotificationsScreen} />
            <RootStack.Screen name="CreateStory" component={CreateStoryScreen} />
            <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
            <RootStack.Screen name="UserProfile" component={UserProfileScreen} />
            <RootStack.Screen name="MessageThread" component={MessageThreadScreen} />
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
  bootLogo: {
    width: 108,
    height: 108,
    marginBottom: 4,
  },
  bootBrand: {
    fontSize: 34,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0,
  },
  bootText: {
    fontSize: 14,
    fontWeight: '700',
  },
  profileTabAvatar: {
    borderWidth: 2,
    borderRadius: 18,
    padding: 1,
  },
  animatedTabIcon: {
    width: 36,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadge: {
    position: 'absolute',
    top: -3,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  drawerContent: {
    flex: 1,
  },
  drawerBrand: {
    minHeight: 92,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerLogo: {
    width: 54,
    height: 54,
  },
  drawerBrandCopy: {
    flex: 1,
  },
  drawerBrandTitle: {
    fontSize: 22,
    fontStyle: 'italic',
    fontWeight: '400',
    letterSpacing: 0,
  },
  drawerBrandSubtitle: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
  },
  drawerFooter: {
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  drawerLogoutLabel: {
    fontWeight: '800',
  },
  drawerItemLabel: {
    fontWeight: '800',
  },
});
