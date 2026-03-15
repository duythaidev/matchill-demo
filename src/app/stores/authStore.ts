import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  skillLevel: number;
  sports: string[];
  location: { city: string; lat?: number; lng?: number };
  radiusKm: number;
  bio?: string;
  role?: 'player' | 'venueOwner' | 'admin';
  reputation: {
    score: number;
    attendanceRate: number;
    avgRating: number;
  };
  badges: string[];
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      token: null,
      setUser: (user, token) =>
        set({
          currentUser: user,
          isAuthenticated: !!user,
          token: token || null,
        }),
      logout: () =>
        set({
          currentUser: null,
          isAuthenticated: false,
          token: null,
        }),
      updateUser: (updates) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, ...updates }
            : null,
        })),
    }),
    {
      name: 'matchill-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);