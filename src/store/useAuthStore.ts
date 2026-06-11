import { create } from 'zustand';

export type SessionUser = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

type AuthState = {
  user: SessionUser | null;
  isAuthenticated: boolean;
  loginWithDemo: () => void;
  logout: () => void;
};

const demoUser: SessionUser = {
  id: 'demo-user',
  displayName: 'Raka Animavibe',
  username: 'raka.vibe',
  avatarUrl:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80',
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loginWithDemo: () => set({ user: demoUser, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
