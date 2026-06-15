import { create } from 'zustand';

import {
  isFollowing as checkFollowing,
  toggleFollow as toggleFollowService,
} from '../services/followService';
import { useAuthStore } from './useAuthStore';

type FollowState = {
  followMap: Record<string, boolean>;

  checkFollow: (targetUserId: string) => Promise<boolean>;
  toggleFollow: (targetUserId: string) => Promise<void>;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  followMap: {},

  checkFollow: async (targetUserId) => {
    const userId = getCurrentUserId();
    if (!userId || userId === targetUserId) return false;

    const cached = get().followMap[targetUserId];
    if (cached !== undefined) return cached;

    const result = await checkFollowing(userId, targetUserId);
    set((state) => ({
      followMap: { ...state.followMap, [targetUserId]: result },
    }));
    return result;
  },

  toggleFollow: async (targetUserId) => {
    const userId = getCurrentUserId();
    if (!userId || userId === targetUserId) return;

    const currentlyFollowing = get().followMap[targetUserId] ?? false;

    set((state) => ({
      followMap: { ...state.followMap, [targetUserId]: !currentlyFollowing },
    }));

    try {
      await toggleFollowService(userId, targetUserId);
    } catch {
      set((state) => ({
        followMap: { ...state.followMap, [targetUserId]: currentlyFollowing },
      }));
    }
  },
}));
