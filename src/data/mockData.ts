export type Story = {
  id: string;
  author: string;
  avatarUrl: string;
  imageUrl: string;
  viewed: boolean;
};

export type Post = {
  id: string;
  author: string;
  username: string;
  avatarUrl: string;
  imageUrl: string;
  caption: string;
  location: string;
  likes: number;
  comments: number;
  createdAt: string;
};

export const stories: Story[] = [
  {
    id: 'story-1',
    author: 'Naya',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80',
    viewed: false,
  },
  {
    id: 'story-2',
    author: 'Bima',
    avatarUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    viewed: false,
  },
  {
    id: 'story-3',
    author: 'Salsa',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=320&q=80',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
    viewed: true,
  },
];

export const posts: Post[] = [
  {
    id: 'post-1',
    author: 'Naya Pramesti',
    username: 'naya.moves',
    avatarUrl: stories[0].avatarUrl,
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    caption: 'Motion study sore ini. Targetnya micro-interaction terasa halus, bukan ramai.',
    location: 'Jakarta Creative Hub',
    likes: 1240,
    comments: 86,
    createdAt: '12 menit lalu',
  },
  {
    id: 'post-2',
    author: 'Bima Arya',
    username: 'bima.frames',
    avatarUrl: stories[1].avatarUrl,
    imageUrl:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    caption: 'Eksperimen hero transition dari feed ke detail. Semoga 60fps terus.',
    location: 'UPN Veteran Jakarta',
    likes: 978,
    comments: 42,
    createdAt: '34 menit lalu',
  },
  {
    id: 'post-3',
    author: 'Salsa Kirana',
    username: 'salsa.ui',
    avatarUrl: stories[2].avatarUrl,
    imageUrl:
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
    caption: 'Story ring, gesture, dan dark mode masuk backlog animasi minggu ini.',
    location: 'Depok',
    likes: 642,
    comments: 31,
    createdAt: '1 jam lalu',
  },
];
