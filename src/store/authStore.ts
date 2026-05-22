import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import { ENDPOINTS } from '../constants/endpoints';

interface Candidate {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profileCompleted: boolean;
}

interface AuthState {
  candidate: Candidate | null;
  token: string | null;
  isLoading: boolean;
  register: (data: { cpf: string; password: string }) => Promise<{ name: string }>;
  login: (data: { cpf: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  candidate: null,
  token: null,
  isLoading: false,

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('candidate_token');
    set({ token: token ?? '' });
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post(ENDPOINTS.auth.register, data);
      return { name: response.data.candidate.name };
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.post(ENDPOINTS.auth.login, data);
      const { token, candidate } = response.data;
      await SecureStore.setItemAsync('candidate_token', token);
      set({ token, candidate });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('candidate_token');
    set({ candidate: null, token: '' });
  },
}));