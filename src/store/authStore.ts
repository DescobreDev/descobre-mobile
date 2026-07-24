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

  loadFromStorage: () => Promise<void>;
  checkCpf: (cpf: string) => Promise<{ name: string; birthDate: string | null }>;
  register: (data: {
    cpf: string;
    password: string;
    name: string;
    birthDate?: string | null;
  }) => Promise<{ name: string }>;
  login: (data: { cpf: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  setProfileCompleted: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  candidate: null,
  token: null,
  isLoading: false,

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('candidate_token');

    if (!token) {
      set({ token: '' });
      return;
    }

    try {
      const { data } = await api.get(ENDPOINTS.candidates.me);
      set({ token, candidate: data });
    } catch {
      await SecureStore.deleteItemAsync('candidate_token');
      set({ token: '', candidate: null });
    }
  },

  checkCpf: async (cpf) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post(ENDPOINTS.auth.checkCpf, { cpf });
      return { name: data.name, birthDate: data.birthDate ?? null };
    } finally {
      set({ isLoading: false });
    }
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

  setProfileCompleted: () => {
    const { candidate } = get();
    if (!candidate) return;
    set({ candidate: { ...candidate, profileCompleted: true } });
  },
}));