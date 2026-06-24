import type { NavigatorScreenParams } from '@react-navigation/native';
import type { MessageParticipant } from './social';

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
  EditProfile: undefined;
  UserProfile: { userId: string };
  MessageThread: {
    threadId: string;
    recipient?: MessageParticipant;
  };
  PostDetail: {
    postId: string;
    imageAspectRatio?: number;
    sharedTransitionTag?: string;
  };
  StoryViewer: { userId: string };
  PhotoViewer: { imageUrl: string; alt?: string };
};
