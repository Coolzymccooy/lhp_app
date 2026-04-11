import { create } from 'zustand';
import api from '../api/client';

interface Admin { id: string; email: string; name: string; role: string; }

interface AuthState {
  admin: Admin | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  admin: null,
  token: localStorage.getItem('lhp_admin_token'),
  // Start in loading state if a token exists so RequireAuth waits for checkAuth
  loading: !!localStorage.getItem('lhp_admin_token'),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('lhp_admin_token', data.token);
      set({ admin: data.admin, token: data.token, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('lhp_admin_token');
    set({ admin: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('lhp_admin_token');
    if (!token) { set({ loading: false }); return; }
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ admin: data.admin, token, loading: false });
    } catch {
      localStorage.removeItem('lhp_admin_token');
      set({ admin: null, token: null, loading: false });
    }
  },
}));
