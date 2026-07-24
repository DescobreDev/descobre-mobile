import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
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

export default function StepLocation() {
  const router = useRouter();

  const { currentStep, totalSteps, nextStep, prevStep, setLocation, data } =
    useOnboardingStore();

  const [city, setCity] = useState(data.city);
  const [state, setState] = useState(data.state);
  const [saving, setSaving] = useState(false);

  const canAdvance = city.trim().length > 0 && state.length > 0;

  const handleUseGps = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        alert('Permita o acesso à localização.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const uf = getUfFromStateName(address[0].region ?? '');

        setCity(address[0].city ?? '');
        setState(uf);
      }
    } catch (error) {
      console.error(error);
      alert('Não foi possível obter sua localização.');
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
          style={styles.gpsButton}
        >
          <Ionicons name="location-outline" size={18} color={COLORS.textMuted} />
          <Text style={styles.gpsButtonLabel}>
            Usar minha localização atual
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

  gpsButtonLabel: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.textMuted,
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