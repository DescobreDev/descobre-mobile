import React, { useState, useEffect } from 'react';
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
import { useOnboardingStore, OnboardingInterest, OnboardingPriority } from '../../store/onBoardingStore';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';

const MIN_INTERESTS = 1;
const MIN_PRIORITIES = 3;
const MAX_INTERESTS = 8;

interface ChipProps {
  label: string;
  emoji: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

function Chip({ label, emoji, selected, onPress, disabled }: ChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled && !selected}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && !selected && styles.chipDisabled,
      ]}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <Text style={styles.chipEmoji}>{emoji}</Text>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
      {selected && (
        <Ionicons name="checkmark-circle" size={14} color={COLORS.orange} />
      )}
    </TouchableOpacity>
  );
}

interface PriorityItemProps {
  item: OnboardingPriority;
  order: number | null;
  onPress: () => void;
}

function PriorityItem({ item, order, onPress }: PriorityItemProps) {
  const selected = order !== null;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.priorityItem, selected && styles.priorityItemSelected]}
      activeOpacity={0.75}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      <Text style={styles.priorityIcon}>{item.icon}</Text>
      <Text
        style={[styles.priorityName, selected && styles.priorityNameSelected]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
      {selected ? (
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>{order}</Text>
        </View>
      ) : (
        <View style={styles.orderBadgeEmpty} />
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
    setPriorities,
    data,
  } = useOnboardingStore();

  const [interests, setInterestsList] = useState<OnboardingInterest[]>([]);
  const [priorities, setPrioritiesList] = useState<OnboardingPriority[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [selectedInterests, setSelectedInterests] = useState<number[]>(
    data.interestIds
  );

  const [priorityOrder, setPriorityOrder] = useState<number[]>(
    data.priorityIds
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [interestsRes, prioritiesRes] = await Promise.all([
          api.get(ENDPOINTS.onboarding.interests),
          api.get(ENDPOINTS.onboarding.priorities),
        ]);
        setInterestsList(interestsRes.data);
        setPrioritiesList(prioritiesRes.data);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= MAX_INTERESTS) return prev;
      return [...prev, id];
    });
  };

  const togglePriority = (id: number) => {
    setPriorityOrder((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      return [...prev, id];
    });
  };

  const grouped = interests.reduce<Record<string, OnboardingInterest[]>>(
    (acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    },
    {}
  );

  const canAdvance =
    selectedInterests.length >= MIN_INTERESTS &&
    priorityOrder.length >= MIN_PRIORITIES;

  const handleNext = async () => {
    setSaving(true);
    try {
      setInterests(selectedInterests);
      setPriorities(priorityOrder);
      nextStep();
      router.push('/(onboarding)/step3-education');
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
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={COLORS.orange} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title="Interesses & Prioridades"
        subtitle="Conte-nos o que te motiva — isso conecta você às vagas certas."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Áreas de interesse</Text>
            <Text style={styles.sectionCounter}>
              {selectedInterests.length}/{MAX_INTERESTS}
            </Text>
          </View>
          <Text style={styles.sectionHint}>
            Selecione ao menos 1 área que desperta seu interesse.
          </Text>

          {Object.entries(grouped).map(([category, items]) => (
            <View key={category} style={styles.categoryBlock}>
              <Text style={styles.categoryLabel}>{category}</Text>
              <View style={styles.chipsRow}>
                {items.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    emoji={item.emoji}
                    selected={selectedInterests.includes(item.id)}
                    onPress={() => toggleInterest(item.id)}
                    disabled={selectedInterests.length >= MAX_INTERESTS}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.section, styles.sectionLast]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prioridades profissionais</Text>
            <Text
              style={[
                styles.sectionCounter,
                priorityOrder.length >= MIN_PRIORITIES && styles.sectionCounterOk,
              ]}
            >
              {priorityOrder.length} / mín. {MIN_PRIORITIES}
            </Text>
          </View>
          <Text style={styles.sectionHint}>
            Toque para selecionar em ordem de importância — o primeiro que tocar será o #1.
          </Text>

          <View style={styles.prioritiesList}>
            {priorities.map((item) => {
              const idx = priorityOrder.indexOf(item.id);
              return (
                <PriorityItem
                  key={item.id}
                  item={item}
                  order={idx >= 0 ? idx + 1 : null}
                  onPress={() => togglePriority(item.id)}
                />
              );
            })}
          </View>

          {priorityOrder.length > 0 && (
            <TouchableOpacity
              onPress={() => setPriorityOrder([])}
              style={styles.clearBtn}
              accessibilityRole="button"
            >
              <Ionicons name="refresh-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.clearBtnText}>Limpar seleção</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!canAdvance && (
          <Text style={styles.footerHint}>
            {selectedInterests.length < MIN_INTERESTS
              ? 'Selecione ao menos 1 interesse'
              : `Selecione ao menos ${MIN_PRIORITIES} prioridades`}
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
  safe: { flex: 1, backgroundColor: COLORS.surface },
  centered: { alignItems: 'center', justifyContent: 'center' },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  section: {
    marginBottom: SPACING.xl,
  },
  sectionLast: { marginBottom: 0 },
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
  sectionCounterOk: {
    color: COLORS.green,
  },
  sectionHint: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    marginBottom: SPACING.md,
    lineHeight: 19,
  },

  categoryBlock: { marginBottom: SPACING.md },
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
    opacity: 0.38,
  },
  chipEmoji: { fontSize: 14 },
  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.text2,
  },
  chipLabelSelected: {
    color: COLORS.orangeDark,
  },

  prioritiesList: { gap: 8 },
  priorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  priorityItemSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  priorityIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  priorityName: {
    flex: 1,
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.text2,
  },
  priorityNameSelected: {
    color: COLORS.orangeDark,
  },
  orderBadge: {
    width: 24,
    height: 24,
    borderRadius: 99,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBadgeText: {
    fontFamily: FONT.bold,
    fontSize: 11,
    color: '#fff',
  },
  orderBadgeEmpty: { width: 24, height: 24 },

  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-end',
    marginTop: SPACING.sm,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
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