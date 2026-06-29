import { create } from 'zustand';
import type { QueryDocumentSnapshot } from 'firebase/firestore';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';

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
import { readFeedCache, writeFeedCache } from '../services/feedCache';
import type { Comment, Post } from '../types/social';
import { useAuthStore } from './useAuthStore';

type PostState = {
  posts: Post[];
  isLoading: boolean;
  isRefreshing: boolean;
  isCreating: boolean;
  hasMore: boolean;
  isOffline: boolean;
  cacheUpdatedAt: string | null;
  error: string | null;
  lastDoc: QueryDocumentSnapshot | null;

  fetchPosts: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  createPost: (input: CreatePostInput) => Promise<string>;
  toggleLike: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  setOfflineStatus: (isOffline: boolean) => void;
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

function isOfflineState(state: NetInfoState): boolean {
  return state.isConnected !== true || state.isInternetReachable === false;
}

type FeedCacheWriteResult = {
  cacheUpdatedAt: string | null;
  cacheError: string | null;
};

async function persistFeedCache(userId: string, posts: Post[]): Promise<FeedCacheWriteResult> {
  try {
    const cacheUpdatedAt = await writeFeedCache(userId, posts);
    return { cacheUpdatedAt, cacheError: null };
  } catch (error) {
    console.error('[feed-cache] write failed', { userId, error });
    return {
      cacheUpdatedAt: null,
      cacheError: 'Feed berhasil dimuat, tetapi cache offline gagal diperbarui.',
    };
  }
}

async function loadCachedFeed(userId: string): Promise<{
  posts: Post[];
  cacheUpdatedAt: string | null;
  error: string | null;
}> {
  const cache = await readFeedCache(userId);

  if (!cache) {
    return {
      posts: [],
      cacheUpdatedAt: null,
      error: 'Tidak ada koneksi dan feed belum pernah disimpan di perangkat ini.',
    };
  }

  return {
    posts: cache.posts,
    cacheUpdatedAt: cache.cachedAt,
    error: null,
  };
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  isRefreshing: false,
  isCreating: false,
  hasMore: true,
  isOffline: false,
  cacheUpdatedAt: null,
  error: null,
  lastDoc: null,

  fetchPosts: async () => {
    if (get().isLoading) return;

    set({ isLoading: true, error: null });

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Feed tidak dapat dimuat karena sesi pengguna tidak tersedia.');
      }

      const networkState = await NetInfo.fetch();
      if (isOfflineState(networkState)) {
        const cachedFeed = await loadCachedFeed(userId);

        set({
          ...cachedFeed,
          lastDoc: null,
          hasMore: false,
          isLoading: false,
          isOffline: true,
        });
        return;
      }

      const page = await getPosts(userId);
      const cacheResult = await persistFeedCache(userId, page.posts);

      set({
        posts: page.posts,
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
        isLoading: false,
        isOffline: false,
        cacheUpdatedAt: cacheResult.cacheUpdatedAt,
        error: cacheResult.cacheError,
      });
    } catch (error) {
      console.error('[feed] initial load failed', { error });
      set({
        isLoading: false,
        error: 'Gagal memuat feed. Periksa koneksi lalu coba lagi.',
      });
    }
  },

  refreshPosts: async () => {
    set({ isRefreshing: true, error: null });

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Feed tidak dapat diperbarui karena sesi pengguna tidak tersedia.');
      }

      const networkState = await NetInfo.fetch();
      if (isOfflineState(networkState)) {
        const cachedFeed = await loadCachedFeed(userId);

        set({
          ...cachedFeed,
          lastDoc: null,
          hasMore: false,
          isRefreshing: false,
          isOffline: true,
        });
        return;
      }

      const page = await getPosts(userId);
      const cacheResult = await persistFeedCache(userId, page.posts);

      set({
        posts: page.posts,
        lastDoc: page.lastDoc,
        hasMore: page.hasMore,
        isRefreshing: false,
        isOffline: false,
        cacheUpdatedAt: cacheResult.cacheUpdatedAt,
        error: cacheResult.cacheError,
      });
    } catch (error) {
      console.error('[feed] refresh failed', { error });
      set({
        isRefreshing: false,
        error: 'Gagal memuat ulang feed. Periksa koneksi lalu coba lagi.',
      });
    }
  },

  loadMorePosts: async () => {
    const { isLoading, isRefreshing, hasMore, isOffline, lastDoc } = get();
    if (isLoading || isRefreshing || !hasMore || isOffline) return;

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
    } catch (error) {
      console.error('[feed] pagination failed', { error });
      set({ isLoading: false, error: 'Gagal memuat postingan berikutnya.' });
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
    } catch (error) {
      console.error('[createPost]', error);
      set({ isCreating: false, error: 'Gagal membuat post.' });
      throw error;
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
    } catch (error) {
      console.error('[post-like] update failed', { postId, userId, error });
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
    } catch (error) {
      console.error('[post-delete] delete failed', { postId, userId, error });
      set({ posts: original, error: 'Gagal menghapus post.' });
    }
  },

  setOfflineStatus: (isOffline) => set({ isOffline }),
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
  return getUserPostsService(userId, { currentUserId: currentUserId ?? undefined });
}
