import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';
import {
  createStory as createStoryService,
  getStoryGroups as getStoryGroupsService,
  markStoryViewed as markStoryViewedService,
} from '../services/storyService';
import type { StoryGroup } from '../types/social';

type StoryState = {
  groups: StoryGroup[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  fetchStories: () => Promise<void>;
  createStory: (imageUri: string, caption: string) => Promise<string>;
  markViewed: (storyId: string) => Promise<void>;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  groups: [],
  loading: false,
  creating: false,
  error: null,

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
}));
