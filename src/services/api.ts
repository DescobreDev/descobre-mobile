import axios from "axios";
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
  baseURL: "http://10.0.2.2:3000",
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('candidate_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? 'Erro inesperado. Tente novamente.';
    return Promise.reject(new Error(message));
  },
);

export default api;