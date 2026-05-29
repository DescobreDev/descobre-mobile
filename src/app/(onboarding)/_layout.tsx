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
      <Stack.Screen name="step1-disc" />
      <Stack.Screen name="step2-interests" />
      <Stack.Screen name="step3-priority" />
      <Stack.Screen name="step4-education" />
      <Stack.Screen name="step5-experience" />
      <Stack.Screen name="step6-skills" />
      <Stack.Screen name="step7-avatar" />
    </Stack>
  );
}