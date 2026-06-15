export type Story = {
  id: string;
  author: string;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  viewed: boolean;
};

export type Post = {
  id: string;
  author: string;
  username: string;
  avatarUrl?: string | null;
  imageUrl?: string | null;
  caption: string;
  location?: string | null;
  likes: number;
  comments: number;
  createdAt: string;
};
