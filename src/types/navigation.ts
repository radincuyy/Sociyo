import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Search: undefined;
  Create: undefined;
  Notifications: undefined;
  Profile: undefined;
};

export type MainDrawerParamList = {
  HomeTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  AnimationCatalog: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Boot: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainDrawerParamList> | undefined;
  PostDetail: { postId: string };
  StoryViewer: { storyId?: string };
  PhotoViewer: { imageUrl: string; alt?: string };
};
