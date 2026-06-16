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
