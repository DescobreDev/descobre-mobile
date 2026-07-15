import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'expo-router';

export default function OnboardingLayout() {
  const { candidate } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (candidate?.profileCompleted) {
      router.replace('/(app)/home');
    }
  }, [candidate]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <Stack.Screen name="step-disc" />
      <Stack.Screen name="step-interests" />
      <Stack.Screen name="step-job-preferences" />
      <Stack.Screen name="step-location" />
      <Stack.Screen name="step-priority" />
      <Stack.Screen name="step-education" />
      <Stack.Screen name="step-experience" />
      <Stack.Screen name="step-skills" />
      <Stack.Screen name="step-avatar" />
      <Stack.Screen
        name="onboarding-complete"
        options={{ animation: 'fade', gestureEnabled: false }}
      />
    </Stack>
  );
}