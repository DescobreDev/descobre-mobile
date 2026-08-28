import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { useAuthStore } from '../store/authStore';
import { registerForPushNotificationsAsync } from '../utils/registerPushToken';

export default function RootLayout() {
  const { token, candidate, pendingWelcome, loadFromStorage } = useAuthStore();
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

  // Registrar push token quando o candidato estiver autenticado
  useEffect(() => {
    if (!token) return;

    registerForPushNotificationsAsync().then((pushToken) => {
      if (pushToken) {
        // próximo passo: mandar esse pushToken pro seu backend
        console.log('Token pronto pra salvar:', pushToken);
      }
    });
  }, [token]);

  useEffect(() => {
    if (!fontsLoaded || token === null) return;
    // ... resto igual, não mexe
  }, [fontsLoaded, token, candidate?.profileCompleted, pendingWelcome, segments]);

  if (!fontsLoaded || token === null) return null;

  return (
    <KeyboardProvider>
      <Slot />
    </KeyboardProvider>
  );
}