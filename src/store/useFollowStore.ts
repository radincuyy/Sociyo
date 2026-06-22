import { create } from 'zustand';

import {
  isFollowing as checkFollowing,
  toggleFollow as toggleFollowService,
} from '../services/followService';
import { useAuthStore } from './useAuthStore';

type FollowState = {
  followMap: Record<string, boolean>;
  pendingMap: Record<string, boolean>;

  checkFollow: (targetUserId: string) => Promise<boolean>;
  toggleFollow: (targetUserId: string) => Promise<void>;
};

function getCurrentUserId() {
  return useAuthStore.getState().user?.id ?? null;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  followMap: {},
  pendingMap: {},

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
    if (get().pendingMap[targetUserId]) return;

    const currentlyFollowing = get().followMap[targetUserId] ?? false;

    set((state) => ({
      followMap: { ...state.followMap, [targetUserId]: !currentlyFollowing },
      pendingMap: { ...state.pendingMap, [targetUserId]: true },
    }));

    try {
      const isFollowing = await toggleFollowService(userId, targetUserId);
      set((state) => ({
        followMap: { ...state.followMap, [targetUserId]: isFollowing },
        pendingMap: { ...state.pendingMap, [targetUserId]: false },
      }));

      if (isFollowing !== currentlyFollowing) {
        useAuthStore.setState((state) => ({
          user: state.user
            ? {
                ...state.user,
                followingCount: Math.max(
                  0,
                  state.user.followingCount + (isFollowing ? 1 : -1),
                ),
              }
            : null,
        }));
      }
    } catch {
      set((state) => ({
        followMap: { ...state.followMap, [targetUserId]: currentlyFollowing },
        pendingMap: { ...state.pendingMap, [targetUserId]: false },
      }));
    }
  },
}));
