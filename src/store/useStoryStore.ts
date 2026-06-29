import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';
import {
  createStory as createStoryService,
  getStoryGroups as getStoryGroupsService,
  markStoryViewed as markStoryViewedService,
  sendStoryReply as sendStoryReplyService,
} from '../services/storyService';
import type { StoryGroup } from '../types/social';
import type { SendMessageResult } from '../types/social';

type StoryState = {
  groups: StoryGroup[];
  loading: boolean;
  creating: boolean;
  replying: boolean;
  error: string | null;
  replyError: string | null;
  fetchStories: () => Promise<void>;
  createStory: (imageUri: string, caption: string) => Promise<string>;
  markViewed: (storyId: string) => Promise<void>;
  sendReply: (
    storyId: string,
    storyImageUrl: string | null,
    recipientId: string,
    text: string,
  ) => Promise<SendMessageResult>;
  clearReplyError: () => void;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  groups: [],
  loading: false,
  creating: false,
  replying: false,
  error: null,
  replyError: null,

  fetchStories: async () => {
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const userId = getCurrentUserId();
      const groups = await getStoryGroupsService(userId ?? undefined);
      set({ groups, loading: false });
    } catch {
      set({ loading: false, error: 'Gagal memuat story.' });
    }
  },

  createStory: async (imageUri, caption) => {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('Sesi login tidak ditemukan.');
    }

    set({ creating: true, error: null });

    try {
      const storyId = await createStoryService(userId, imageUri, caption);
      set({ creating: false });
      await get().fetchStories();
      return storyId;
    } catch (error) {
      set({ creating: false, error: 'Gagal membuat story.' });
      throw error;
    }
  },

  markViewed: async (storyId: string) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    const original = get().groups;

    // optimistic update
    const updatedGroups = original.map((group) => ({
      ...group,
      stories: group.stories.map((s) => (s.id === storyId ? { ...s, viewed: true } : s)),
      hasUnviewed: group.stories.map((s) => (s.id === storyId ? { ...s, viewed: true } : s)).some((s) => !s.viewed),
    }));

    set({ groups: updatedGroups });

    try {
      await markStoryViewedService(storyId, userId);
    } catch {
      set({ groups: original });
    }
  },

  sendReply: async (storyId, storyImageUrl, recipientId, text) => {
    const userId = getCurrentUserId();

    if (!userId) {
      throw new Error('Sesi login tidak ditemukan.');
    }

    set({ replying: true, replyError: null });

    try {
      const result = await sendStoryReplyService({
        storyId,
        storyImageUrl,
        authorId: userId,
        recipientId,
        text,
      });
      set({ replying: false });
      return result;
    } catch (error) {
      set({
        replying: false,
        replyError:
          error instanceof Error
            ? error.message
            : 'Gagal mengirim balasan story.',
      });
      throw error;
    }
  },

  clearReplyError: () => set({ replyError: null }),
}));
