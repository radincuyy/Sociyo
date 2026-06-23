import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Feed: undefined;
  Messages: undefined;
  Create: undefined;
  Search: undefined;
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
  Notifications: undefined;
  CreateStory: undefined;
  MessageThread: { threadId: string };
  PostDetail: { postId: string };
  StoryViewer: { userId: string };
  PhotoViewer: { imageUrl: string; alt?: string };
};
