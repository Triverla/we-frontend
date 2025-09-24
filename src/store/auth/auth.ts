import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@woothomes/types/account";
interface Token {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Add setState to AuthState type
interface AuthState {
  user: User | null;
  token: Token | null;
  passwordResetEmail: string | null;
  passwordResetPin: string | null;
  hydrated: boolean;
  setAuth: (token: Token, user: User) => void;
  resetAuth: () => void;
  setState: (state: Partial<AuthState>) => void;
  setPasswordResetEmail: (email: string) => void;
  setPasswordResetPin: (pin: string) => void;
  clearPasswordResetData: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      hydrated: false,
      passwordResetEmail: null,
      passwordResetPin: null,
      setAuth: (token, user) => set({ token, user }),
      resetAuth: () => set({ token: null, user: null }),
      setPasswordResetEmail: (email) => set({ passwordResetEmail: email }),
      setPasswordResetPin: (pin) => set({ passwordResetPin: pin }),
      clearPasswordResetData: () =>
        set({ passwordResetEmail: null, passwordResetPin: null }),
      setState: set,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        passwordResetEmail: state.passwordResetEmail,
        passwordResetPin: state.passwordResetPin,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setState?.({ hydrated: true });
      },
    }
  )
);
