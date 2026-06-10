import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';

import { useAuthStore } from '../store/authStore';

export default function RootLayout() {
  const { token, candidate, loadFromStorage } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (!fontsLoaded || token === null) return;

    const inAuth       = segments[0] === 'auth';
    const inOnboarding = segments[0] === '(onboarding)';

    const isAuthenticated = !!token;
    const needsOnboarding = isAuthenticated && candidate?.profileCompleted === false;

    if (!isAuthenticated) {
      if (!inAuth) router.replace('/auth/login');
      return;
    }

    if (needsOnboarding) {
      if (!inOnboarding) router.replace('/(onboarding)/step1-disc');
      return;
    }

    if (inAuth || inOnboarding) {
      router.replace('/(app)/home');
    }
  }, [fontsLoaded, token, candidate?.profileCompleted, segments]);

  if (!fontsLoaded || token === null) return null;

  return <Slot />;
}