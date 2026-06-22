import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  DrawerContentScrollView,
  DrawerItem,
  createDrawerNavigator,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, ListVideo, LogOut, MessageCircle, PlusCircle, Search, Settings } from 'lucide-react-native';
import { useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
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
import { SearchScreen } from '../screens/search/SearchScreen';
import { CreatePostScreen } from '../screens/create/CreatePostScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
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
          if (route.name === 'Feed') return <Home size={iconSize} color={color} />;
          if (route.name === 'Messages') return <MessageCircle size={iconSize} color={color} />;
          if (route.name === 'Create') return <PlusCircle size={iconSize + 2} color={color} />;
          if (route.name === 'Search') return <Search size={iconSize} color={color} />;
          return <ProfileTabIcon focused={focused} size={iconSize} />;
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
            <RootStack.Screen name="Notifications" component={NotificationsScreen} />
            <RootStack.Screen name="CreateStory" component={CreateStoryScreen} />
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
