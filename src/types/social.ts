export type Story = {
  id: string;
  author: string;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  viewed: boolean;
};

export type StoryGroup = {
  userId: string;
  author: string;
  username: string;
  avatarUrl?: string | null;
  stories: Story[];
  hasUnviewed: boolean;
};

export type Post = {
  id: string;
  authorId: string;
  author: string;
  username: string;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  caption: string;
  location?: string | null;
  likes: number;
  comments: number;
  likedByMe: boolean;
  createdAt: string;
};

export type Comment = {
  id: string;
  authorId: string;
  author: string;
  username: string;
  avatarUrl?: string | null;
  text: string;
  createdAt: string;
};

export type PostDoc = {
  authorId: string;
  caption: string;
  imageUrl: string | null;
  location: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: unknown;
  updatedAt: unknown;
};

export type CommentDoc = {
  authorId: string;
  text: string;
  createdAt: unknown;
};

export type StoryDoc = {
  authorId: string;
  imageUrl: string;
  caption: string;
  createdAt: unknown;
  expiresAt: unknown;
  viewedBy: string[];
};

export type ActivityNotificationType = 'follow' | 'like' | 'comment' | 'story_reply';

export type ActivityNotification = {
  id: string;
  type: ActivityNotificationType;
  actorId: string;
  actorName: string;
  actorAvatarUrl: string | null;
  entityId: string | null;
  preview: string | null;
  read: boolean;
  createdAt: string;
};

export type MessageKind = 'text' | 'story_reply';

export type DirectMessage = {
  id: string;
  senderId: string;
  recipientId: string;
  kind: MessageKind;
  text: string;
  storyId: string | null;
  storyImageUrl: string | null;
  createdAt: string;
};

export type MessageParticipant = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
};

export type MessageThread = {
  id: string;
  participantIds: string[];
  otherUser: MessageParticipant;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
  unreadCount: number;
};

export type PushDeliveryStatus = 'sent' | 'not_registered' | 'failed';

export type SendMessageResult = {
  messageId: string;
  threadId: string;
  pushDelivery: PushDeliveryStatus;
};
