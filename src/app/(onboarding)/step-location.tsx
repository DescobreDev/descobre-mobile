import React, { useState } from 'react';
import {
  View,
  Text,
  // TouchableOpacity, // usado apenas pelo botão de GPS, comentado por enquanto
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  // ActivityIndicator, // idem
} from 'react-native';
import { useRouter } from 'expo-router';
// import * as Location from 'expo-location'; // GPS desativado temporariamente pro MVP
// import { Ionicons } from '@expo/vector-icons'; // usado apenas pelo botão de GPS
// import { getUfFromStateName } from '../../utils/location';

import {
  OnboardingHeader,
  COLORS,
  FONT,
  SPACING,
} from '../../components/onboarding/OnboardingHeader';

import { PrimaryButton } from '../../components/onboarding/PrimaryButton';
import { SmartLocationInput } from '../../components/onboarding/SmartLocationInput';

import { useOnboardingStore } from '../../store/onBoardingStore';

/**
 * ⚠️ TEMPORÁRIO (MVP):
 * O botão "usar minha localização atual" (GPS) foi comentado porque a
 * captura automática de localização ainda está sendo investigada
 * (ver step-location.debug.tsx). Toda a lógica de handleUseGps e o tipo
 * GpsStatus foram removidos por enquanto para simplificar a tela para a
 * demo. Quando o GPS voltar a funcionar, restaurar a partir do arquivo
 * anterior (versão com debug) e remontar o botão abaixo do header.
 */

export default function StepLocation() {
  const router = useRouter();

  const { currentStep, totalSteps, nextStep, prevStep, setLocation, data } =
    useOnboardingStore();

  const [city, setCity] = useState(data.city);
  const [state, setState] = useState(data.state);
  const [saving, setSaving] = useState(false);

  const canAdvance = city.trim().length > 0 && state.length > 0;

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

      <KeyboardAvoidingView
        style={styles.scroll}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Botão de GPS temporariamente removido do MVP — ver nota no topo do arquivo
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
          ...
        </TouchableOpacity>
        */}

        <View style={styles.card}>

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

          <Text style={styles.cardHint}>
            Você poderá alterar essa informação depois, nas configurações do
            seu perfil.
          </Text>
        </View>

        {(city.trim().length > 0 || state.length > 0) && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryDot} />
            <Text style={styles.summaryText}>
              {city.trim().length > 0 ? city : 'Cidade'}
              {state ? ` · ${state}` : ''}
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>

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
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },

  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: (COLORS.primary ?? '#208AEF') + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },

  cardIcon: {
    fontSize: 20,
  },

  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  cardHint: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    lineHeight: 18,
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: SPACING.lg,
    paddingHorizontal: 4,
  },

  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary ?? '#22c55e',
  },

  summaryText: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.text ?? '#111',
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