import { create } from 'zustand';
import type { QueryDocumentSnapshot } from 'firebase/firestore';

import {
  createPost as createPostService,
  deletePost as deletePostService,
  getComments as getCommentsService,
  addComment as addCommentService,
  getPostById,
  getPosts,
  getUserPosts as getUserPostsService,
  toggleLike as toggleLikeService,
} from '../services/postService';
import type { Comment, Post } from '../types/social';
import { useAuthStore } from './useAuthStore';

type PostState = {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  hasMore: boolean;
  error: string | null;
  lastDoc: QueryDocumentSnapshot | null;

  fetchPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<string>;
  toggleLike: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  clearError: () => void;
};

type CreatePostInput = {
  caption: string;
  imageUri?: string | null;
  location?: string | null;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  hasMore: true,
  error: null,
  lastDoc: null,

  fetchPosts: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();
      const page = await getPosts(userId ?? undefined);

      set({
        posts: page.posts,
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false, error: 'Gagal memuat feed.' });
    }
  },

  refreshPosts: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const userId = getCurrentUserId();
      const page = await getPosts(userId ?? undefined);

      set({
        posts: page.posts,
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
        isRefreshing: false,
      });
    } catch {
      set({ isRefreshing: false, error: 'Gagal memuat ulang feed.' });
    }
  },

  loadMorePosts: async () => {
    const { isLoading, isRefreshing, hasMore, lastDoc } = get();
    if (isLoading || isRefreshing || !hasMore) return;

    set({ isLoading: true });

    try {
      const userId = getCurrentUserId();
      const page = await getPosts(userId ?? undefined, lastDoc);

      set((state) => ({
        posts: [...state.posts, ...page.posts],
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
        isLoading: false,
      }));
    } catch {
      set({ isLoading: false, error: 'Gagal memuat post lainnya.' });
    }
  },

  createPost: async ({ caption, imageUri, location }) => {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('Belum login.');

    set({ isCreating: true, error: null });

    try {
      const postId = await createPostService({
        authorId: userId,
        caption,
        imageUri,
        location,
      });

      const newPost = await getPostById(postId, userId);

      if (newPost) {
        set((state) => ({
          posts: [newPost, ...state.posts],
          isCreating: false,
        }));
      } else {
        set({ isCreating: false });
      }

      return postId;
    } catch {
      set({ isCreating: false, error: 'Gagal membuat post.' });
      throw new Error('Gagal membuat post.');
    }
  },

  toggleLike: async (postId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId
          ? {
            ...post,
            likedByMe: !post.likedByMe,
            likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
          }
          : post,
      ),
    }));

    try {
      await toggleLikeService(postId, userId);
    } catch {
      set((state) => ({
        posts: state.posts.map((post) =>
          post.id === postId
            ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: post.likedByMe ? post.likes - 1 : post.likes + 1,
            }
            : post,
        ),
      }));
    }
  },

  deletePost: async (postId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const original = get().posts;

    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    }));

    try {
      await deletePostService(postId, userId);
    } catch {
      set({ posts: original, error: 'Gagal menghapus post.' });
    }
  },

  clearError: () => set({ error: null }),
}));

export async function fetchComments(postId: string): Promise<Comment[]> {
  return getCommentsService(postId);
}

export async function postComment(postId: string, text: string): Promise<string> {
  const userId = getCurrentUserId();
  if (!userId) throw new Error('Belum login.');

  return addCommentService({ postId, authorId: userId, text });
}

export async function fetchUserPosts(userId: string): Promise<Post[]> {
  const currentUserId = getCurrentUserId();
  return getUserPostsService(userId, currentUserId ?? undefined);
}
