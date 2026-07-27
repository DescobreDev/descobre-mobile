import axios from "axios";
import * as SecureStore from 'expo-secure-store';

console.log('[api] baseURL configurada:', process.env.EXPO_PUBLIC_API_URL);

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('candidate_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  console.log('[api] →', config.method?.toUpperCase(), (config.baseURL ?? '') + (config.url ?? ''));
  console.log('[api] → headers:', JSON.stringify(config.headers));
  if (config.data) console.log('[api] → body:', JSON.stringify(config.data));

  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('[api] ← sucesso', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('[api] ← ERRO capturado');
    console.log('[api] error.message:', error.message);
    console.log('[api] error.code:', error.code);
    console.log('[api] tem response?', !!error.response);
    console.log('[api] tem request?', !!error.request);

    if (error.response) {
      console.log('[api] status:', error.response.status);
      console.log('[api] data:', JSON.stringify(error.response.data));
    } else if (error.request) {
      console.log('[api] SEM RESPOSTA do servidor (rede/timeout/CORS)');
    } else {
      console.log('[api] erro ao montar a requisição:', error.message);
    }

    const message =
      error.response?.data?.message ?? 'Erro inesperado. Tente novamente.';
    return Promise.reject(new Error(message));
  },
);

export default api;