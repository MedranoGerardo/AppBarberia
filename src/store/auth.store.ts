import { create } from "zustand";
import { AppUser } from "../types/user.types";

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  setUser: (user: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  logoutStore: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: false,
  setUser: (user: AppUser | null) => set({ user }),
  setLoading: (loading: boolean) => set({ loading }),
  logoutStore: () => set({ user: null, loading: false }),
}));
