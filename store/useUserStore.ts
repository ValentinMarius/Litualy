import { create } from "zustand";
import type { User } from "@/types";

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  incrementStreak: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  incrementStreak: () =>
    set((state) =>
      state.user ? { user: { ...state.user, streakCount: state.user.streakCount + 1 } } : state,
    ),
}));
