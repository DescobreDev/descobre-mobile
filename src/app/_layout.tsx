import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { token, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (token === null) return;

    const inAuth = segments[0] === 'auth';

    if (!token && !inAuth) {
      router.replace('/auth/login');
    } else if (token && inAuth) {
      router.replace('/');
    }
  }, [token, segments]);

  return <Slot />;
}