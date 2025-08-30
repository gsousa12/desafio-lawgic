import { JwtPayload } from "@/common/types/api/api.types";
import { create } from "zustand";

export type AuthStateType = {
  isAuthenticated: boolean;
  user: JwtPayload | null;
  setAuthenticated: (value: boolean) => void;
  setUser: (user: JwtPayload | null) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthStateType>((set) => ({
  isAuthenticated: false,
  user: null,
  setAuthenticated: (value) => set({ isAuthenticated: value }),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
