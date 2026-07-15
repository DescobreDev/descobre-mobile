import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
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

import { useOnboardingStore } from '../../store/onBoardingStore';

const UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text
        style={[styles.chipLabel, selected && styles.chipLabelSelected]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

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
        setCity(address[0].city ?? '');

        const uf = getUfFromStateName(address[0].region ?? '');

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
          disabled={false}
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
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Ex: Itapetininga"
            placeholderTextColor={COLORS.textMuted}
            style={styles.input}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.fieldLabel}>Estado</Text>
          <View style={styles.chipsRow}>
            {UFS.map((uf) => (
              <Chip
                key={uf}
                label={uf}
                selected={state === uf}
                onPress={() => setState(uf)}
              />
            ))}
          </View>
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
    opacity: 0.6,
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

  input: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  chipSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },

  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.text2,
  },

  chipLabelSelected: {
    color: COLORS.orangeDark,
    fontFamily: FONT.semiBold,
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