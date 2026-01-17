import { create } from 'zustand';
import type { LoginResponse } from '@policy-flow/contracts';

interface AuthState {
  user: LoginResponse['user'] | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (authData: LoginResponse) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,

  setAuth: (authData) => {
    // Save tokens to localStorage
    localStorage.setItem('accessToken', authData.accessToken);
    localStorage.setItem('refreshToken', authData.refreshToken);

    set({
      user: authData.user,
      accessToken: authData.accessToken,
      refreshToken: authData.refreshToken,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    // Remove tokens from localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },
}));
