import { create } from 'zustand';

import { useAuthStore } from './useAuthStore';
import {
  getStoryGroups as getStoryGroupsService,
  markStoryViewed as markStoryViewedService,
} from '../services/storyService';
import type { StoryGroup } from '../types/social';

type StoryState = {
  groups: StoryGroup[];
  loading: boolean;
  fetchStories: () => Promise<void>;
  markViewed: (storyId: string) => Promise<void>;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  groups: [],
  loading: false,

  fetchStories: async () => {
    if (get().loading) return;

    set({ loading: true });

    try {
      const userId = getCurrentUserId();
      const groups = await getStoryGroupsService(userId ?? undefined);
      set({ groups, loading: false });
    } catch {
      set({ loading: false });
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
