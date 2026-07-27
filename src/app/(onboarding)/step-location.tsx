import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { getUfFromStateName } from '../../utils/location';

import {
  OnboardingHeader,
  COLORS,
  FONT,
  SPACING,
} from '../../components/onboarding/OnboardingHeader';

import { PrimaryButton } from '../../components/onboarding/PrimaryButton';
import { SmartLocationInput } from '../../components/onboarding/SmartLocationInput';

import { useOnboardingStore } from '../../store/onBoardingStore';

type GpsStatus = 'idle' | 'loading' | 'success' | 'error';

export default function StepLocation() {
  const router = useRouter();

  const { currentStep, totalSteps, nextStep, prevStep, setLocation, data } =
    useOnboardingStore();

  const [city, setCity] = useState(data.city);
  const [state, setState] = useState(data.state);
  const [saving, setSaving] = useState(false);

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('idle');

  const canAdvance = city.trim().length > 0 && state.length > 0;

  const handleUseGps = async () => {
    if (gpsStatus === 'loading') return; // evita clique duplo

    setGpsStatus('loading');

    try {
      // 1. Verifica se o serviço de localização (GPS) do aparelho está ligado
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        alert(
          'Seu GPS está desligado. Ative os serviços de localização nas configurações do seu aparelho para usar essa opção.'
        );
        setGpsStatus('error');
        return;
      }

      // 2. Verifica/pede permissão do app
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permita o acesso à localização para usar essa opção.');
        setGpsStatus('error');
        return;
      }

      // 3. No Android, força o prompt de "alta precisão" caso não esteja ativo.
      // Resolve boa parte dos casos de "Current location is unavailable".
      if (Platform.OS === 'android') {
        try {
          await Location.enableNetworkProviderAsync();
        } catch (e) {
          // usuário recusou o prompt de alta precisão, ou já está habilitado
          console.log('enableNetworkProviderAsync:', e);
        }
      }

      // 4. Busca a posição, com timeout mais generoso (emulador é mais lento)
      let location;
      try {
        location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 20000)
          ),
        ]);
      } catch (err) {
        // Fallback: tenta usar a última posição conhecida antes de desistir
        const lastKnown = await Location.getLastKnownPositionAsync();
        if (lastKnown) {
          location = lastKnown;
        } else {
          throw err;
        }
      }

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const uf = getUfFromStateName(address[0].region ?? '');
        setCity(address[0].city ?? '');
        setState(uf);
        setGpsStatus('success');
      } else {
        alert('Não conseguimos identificar sua cidade a partir da sua localização.');
        setGpsStatus('error');
      }
    } catch (error) {
      console.error(error);

      if ((error as Error)?.message === 'timeout') {
        alert(
          'A busca pela localização demorou demais. Tente novamente ou digite manualmente.'
        );
      } else {
        alert('Não foi possível obter sua localização. Verifique se o GPS está ativado.');
      }

      setGpsStatus('error');
    } finally {
      setTimeout(
        () => setGpsStatus('idle'),
        gpsStatus === 'success' ? 1500 : 0
      );
    }
  };

  const handleNext = async () => {
    setSaving(true);

    try {
      setLocation(city.trim(), state);
      nextStep();
      router.push('/(onboarding)/step-priority');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const isGpsLoading = gpsStatus === 'loading';
  const isGpsSuccess = gpsStatus === 'success';

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title="Localização"
        subtitle="Onde você está, ou pretende estar disponível para trabalhar?"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          onPress={handleUseGps}
          activeOpacity={0.75}
          disabled={isGpsLoading}
          style={[
            styles.gpsButton,
            isGpsLoading && styles.gpsButtonActive,
            isGpsSuccess && styles.gpsButtonSuccess,
          ]}
        >
          {isGpsLoading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.primary ?? COLORS.textMuted}
            />
          ) : (
            <Ionicons
              name={isGpsSuccess ? 'checkmark-circle' : 'location-outline'}
              size={18}
              color={isGpsSuccess ? '#fff' : COLORS.textMuted}
            />
          )}

          <Text
            style={[
              styles.gpsButtonLabel,
              (isGpsLoading || isGpsSuccess) && styles.gpsButtonLabelActive,
            ]}
          >
            {isGpsLoading
              ? 'Buscando localização...'
              : isGpsSuccess
              ? 'Localização encontrada!'
              : 'Usar minha localização atual'}
          </Text>
        </TouchableOpacity>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Cidade</Text>
          <SmartLocationInput
            city={city}
            state={state}
            onSelect={(selectedCity, uf) => {
              setCity(selectedCity);
              setState(uf);
            }}
            placeholder="Ex: Itapetininga"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!canAdvance && (
          <Text style={styles.footerHint}>
            Informe cidade e estado para continuar
          </Text>
        )}

        <PrimaryButton
          label="Continuar"
          onPress={handleNext}
          disabled={!canAdvance}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },

  gpsButtonActive: {
    borderColor: COLORS.primary ?? COLORS.border,
    backgroundColor: (COLORS.primary ?? '#000000') + '15',
  },

  gpsButtonSuccess: {
    borderColor: COLORS.primary ?? '#22c55e',
    backgroundColor: COLORS.primary ?? '#22c55e',
  },

  gpsButtonLabel: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.textMuted,
  },

  gpsButtonLabelActive: {
    color: '#fff',
  },

  section: {
    marginBottom: SPACING.xl,
  },

  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },

  footerHint: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});