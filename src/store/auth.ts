import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState } from '../types';

const VALID_CREDENTIALS = {
  email: 'management@eagleinfoservice.com',
  password: 'eisShared2025!'
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
          set({ isAuthenticated: true });
        } else {
          throw new Error('Invalid credentials');
        }
      },
      logout: () => set({ isAuthenticated: false })
    }),
    {
      name: 'auth-storage'
    }
  )
);