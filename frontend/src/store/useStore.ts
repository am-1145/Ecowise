import { create } from 'zustand';
import axios from 'axios';

export interface IUserStore {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  stats: any | null;
  activities: any[];
  goals: any[];
  actions: any[];
  challenges: any[];
  products: any[];
  transactions: any[];
  loading: boolean;
  error: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchActivities: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  fetchActions: () => Promise<void>;
  fetchChallenges: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  logActivity: (data: any) => Promise<void>;
  updateUserStats: (points: number, level: number, xp: number, badges: string[]) => void;
}

import { API_URL } from '../config';

export const useStore = create<IUserStore>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  stats: null,
  activities: [],
  goals: [],
  actions: [],
  challenges: [],
  products: [],
  transactions: [],
  loading: false,
  error: null,

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true, error: null });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      stats: null,
      activities: [],
      goals: [],
      actions: [],
      challenges: [],
      products: [],
      transactions: []
    });
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: res.data.user });
    } catch (err: any) {
      console.error('Fetch profile failed:', err);
      get().logout();
    }
  },

  fetchStats: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/carbon/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ stats: res.data });
    } catch (err: any) {
      console.error('Fetch stats failed:', err);
    }
  },

  fetchActivities: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/carbon/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ activities: res.data.activities });
    } catch (err: any) {
      console.error('Fetch activities failed:', err);
    }
  },

  fetchGoals: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/goals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ goals: res.data.goals });
    } catch (err: any) {
      console.error('Fetch goals failed:', err);
    }
  },

  fetchActions: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/actions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ actions: res.data.actions });
    } catch (err: any) {
      console.error('Fetch actions failed:', err);
    }
  },

  fetchChallenges: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/gamification/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ challenges: res.data.challenges });
    } catch (err: any) {
      console.error('Fetch challenges failed:', err);
    }
  },

  fetchProducts: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/marketplace/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ products: res.data.products });
    } catch (err: any) {
      console.error('Fetch products failed:', err);
    }
  },

  fetchTransactions: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/marketplace/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ transactions: res.data.transactions });
    } catch (err: any) {
      console.error('Fetch transactions failed:', err);
    }
  },

  logActivity: async (data: any) => {
    const { token } = get();
    if (!token) return;
    try {
      set({ loading: true });
      const res = await axios.post(`${API_URL}/carbon/log`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Refresh user profile levels & stats
      if (res.data.gamification && get().user) {
        set({
          user: {
            ...get().user,
            ...res.data.gamification
          }
        });
      }
      await get().fetchStats();
      await get().fetchActivities();
      set({ loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to log carbon activity.', loading: false });
      throw err;
    }
  },

  updateUserStats: (points, level, xp, badges) => {
    const current = get().user;
    if (current) {
      set({
        user: {
          ...current,
          points,
          level,
          xp,
          badges
        }
      });
    }
  }
}));
