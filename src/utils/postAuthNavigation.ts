import type { Router } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export function redirectAfterAuth(router: Router) {
  const candidate = useAuthStore.getState().candidate;

  if (!candidate?.profileCompleted) {
    router.replace('/(onboarding)/step-disc');
    return;
  }

  router.replace('/(app)/home');
}