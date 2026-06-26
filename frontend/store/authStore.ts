// This file manages the shared global state and frontend actions for auth store.
/**
 * authStore.ts — Zustand global authentication store
 *
 * Manages the user state (logged in user details, tokens, authentication status).
 * Handles persistent storage synchronization safely to avoid SSR mismatch issues.
 */

import { create } from 'zustand';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'traveler' | 'guide' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  travelDNA: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      }
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user, token: token || null, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
    set({ user });
  },

  initialize: () => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token');
        const userJson = localStorage.getItem('user');
        
        if (userJson) {
          const user = JSON.parse(userJson) as User;
          set({ user, token: token || null, isAuthenticated: true, isLoading: false });
          return;
        }
      } catch (err) {
        console.error('Error restoring auth state from localStorage:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },
}));
