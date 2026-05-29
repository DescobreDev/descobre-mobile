import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import {
  OnboardingHeader,
  COLORS,
  FONT,
  SPACING,
} from '../../components/onboarding/OnboardingHeader';

import { PrimaryButton } from '../../components/onboarding/PrimaryButton';

import {
  useOnboardingStore,
  OnboardingInterest,
} from '../../store/onBoardingStore';

import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';

const MIN_INTERESTS = 3;

interface ChipProps {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function Chip({
  label,
  emoji,
  selected,
  onPress,
  disabled,
}: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled && !selected}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && !selected && styles.chipDisabled,
      ]}
    >
      <Text style={styles.chipEmoji}>{emoji}</Text>

      <Text
        style={[
          styles.chipLabel,
          selected && styles.chipLabelSelected,
        ]}
      >
        {label}
      </Text>

      {selected && (
        <Ionicons
          name="checkmark-circle"
          size={14}
          color={COLORS.orange}
        />
      )}
    </TouchableOpacity>
  );
}

export default function Step2Interests() {
  const router = useRouter();

  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setInterests,
    data,
  } = useOnboardingStore();

  const [interests, setInterestsList] = useState<
    OnboardingInterest[]
  >([]);

  const [loadingData, setLoadingData] = useState(true);

  const [selectedInterests, setSelectedInterests] = useState<number[]>(
    data.interestIds
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const interestsRes = await api.get(
          ENDPOINTS.onboarding.interests
        );

        setInterestsList(interestsRes.data);
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível carregar os interesses.'
        );
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, []);

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const grouped = interests.reduce<
    Record<string, OnboardingInterest[]>
  >((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }

    acc[item.category].push(item);

    return acc;
  }, {});

  const canAdvance =
    selectedInterests.length >= MIN_INTERESTS;

  const handleNext = async () => {
    setSaving(true);

    try {
      setInterests(selectedInterests);

      nextStep();

      router.push('/(onboarding)/step3-priority');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  if (loadingData) {
    return (
      <SafeAreaView
        style={[styles.safe, styles.centered]}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.orange}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title="Áreas de Interesse"
        subtitle="Selecione as áreas que mais combinam com você, no mínimo 3."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          {Object.entries(grouped).map(
            ([category, items]) => (
              <View
                key={category}
                style={styles.categoryBlock}
              >
                <Text style={styles.categoryLabel}>
                  {category}
                </Text>

                <View style={styles.chipsRow}>
                  {items.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.name}
                      emoji={item.emoji}
                      selected={selectedInterests.includes(
                        item.id
                      )}
                      onPress={() =>
                        toggleInterest(item.id)
                      }
                    />
                  ))}
                </View>
              </View>
            )
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!canAdvance && (
          <Text style={styles.footerHint}>
            Selecione ao menos 1 interesse
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

  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  sectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: COLORS.text,
  },

  sectionCounter: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  sectionHint: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    marginBottom: SPACING.md,
    lineHeight: 19,
  },

  categoryBlock: {
    marginBottom: SPACING.md,
  },

  categoryLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },

  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },

  chipSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },

  chipDisabled: {
    opacity: 0.4,
  },

  chipEmoji: {
    fontSize: 14,
  },

  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.text2,
  },

  chipLabelSelected: {
    color: COLORS.orangeDark,
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
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});