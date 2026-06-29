import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Post } from '../types/social';

const FEED_CACHE_VERSION = 1;

type FeedCachePayload = {
  version: number;
  userId: string;
  cachedAt: string;
  posts: Post[];
};

export type FeedCacheSnapshot = {
  cachedAt: string;
  posts: Post[];
};

function getFeedCacheKey(userId: string): string {
  return `sociyo:feed-cache:${userId}`;
}

function isNullableString(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === 'string';
}

function isPost(value: unknown): value is Post {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const post = value as Record<string, unknown>;

  return (
    typeof post.id === 'string' &&
    typeof post.authorId === 'string' &&
    typeof post.author === 'string' &&
    typeof post.username === 'string' &&
    isNullableString(post.avatarUrl) &&
    isNullableString(post.imageUrl) &&
    typeof post.caption === 'string' &&
    isNullableString(post.location) &&
    typeof post.likes === 'number' &&
    typeof post.comments === 'number' &&
    typeof post.likedByMe === 'boolean' &&
    typeof post.createdAt === 'string'
  );
}

function parseFeedCache(rawValue: string, userId: string): FeedCacheSnapshot {
  const parsed: unknown = JSON.parse(rawValue);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Cache feed untuk pengguna ${userId} bukan object yang valid.`);
  }

  const payload = parsed as Record<string, unknown>;
  const posts = payload.posts;

  if (
    payload.version !== FEED_CACHE_VERSION ||
    payload.userId !== userId ||
    typeof payload.cachedAt !== 'string' ||
    !Array.isArray(posts) ||
    !posts.every(isPost)
  ) {
    throw new Error(`Format cache feed untuk pengguna ${userId} tidak valid.`);
  }

  return {
    cachedAt: payload.cachedAt,
    posts,
  };
}

export async function readFeedCache(userId: string): Promise<FeedCacheSnapshot | null> {
  const rawValue = await AsyncStorage.getItem(getFeedCacheKey(userId));

  if (!rawValue) {
    return null;
  }

  return parseFeedCache(rawValue, userId);
}

export async function writeFeedCache(userId: string, posts: Post[]): Promise<string> {
  const cachedAt = new Date().toISOString();
  const payload: FeedCachePayload = {
    version: FEED_CACHE_VERSION,
    userId,
    cachedAt,
    posts,
  };

  await AsyncStorage.setItem(getFeedCacheKey(userId), JSON.stringify(payload));

  return cachedAt;
}
