import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
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
  OnboardingPriority,
} from '../../store/onBoardingStore';

import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';

const MIN_PRIORITIES = 3;

export default function Step3Priority() {
  const router = useRouter();

  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setPriorities,
    data,
  } = useOnboardingStore();

  const [priorities, setPrioritiesList] = useState<OnboardingPriority[]>([]);
  const [priorityOrder, setPriorityOrder] = useState<number[]>(
    data.priorityIds
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(
          ENDPOINTS.onboarding.priorities
        );

        setPrioritiesList(res.data);
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível carregar as prioridades.'
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const togglePriority = (id: number) => {
    setPriorityOrder((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  };

  const handleNext = async () => {
    setSaving(true);

    try {
      setPriorities(priorityOrder);

      nextStep();

      router.push('/(onboarding)/step4-education');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
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
        title="Prioridades Profissionais"
        subtitle="Escolha o que é mais importante para você. Em ordem de importancia."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {priorities.map((item) => {
          const idx = priorityOrder.indexOf(item.id);

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.card,
                idx >= 0 && styles.cardSelected,
              ]}
              onPress={() => togglePriority(item.id)}
            >
              <Text style={styles.icon}>
                {item.icon}
              </Text>

              <Text style={styles.name}>
                {item.name}
              </Text>

              {idx >= 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {idx + 1}
                  </Text>
                </View>
              ) : (
                <View style={styles.badgeEmpty} />
              )}
            </TouchableOpacity>
          );
        })}

        {priorityOrder.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setPriorityOrder([])}
          >
            <Ionicons
              name="refresh-outline"
              size={14}
              color={COLORS.textMuted}
            />

            <Text style={styles.clearText}>
              Limpar seleção
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Selecione pelo menos {MIN_PRIORITIES} prioridades
        </Text>

        <PrimaryButton
          label="Continuar"
          onPress={handleNext}
          disabled={
            priorityOrder.length < MIN_PRIORITIES
          }
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

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scroll: {
    padding: SPACING.md,
    gap: 8,
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    marginBottom: 8,
  },

  cardSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },

  icon: {
    fontSize: 20,
    marginRight: 12,
  },

  name: {
    flex: 1,
    fontFamily: FONT.medium,
    color: COLORS.text,
  },

  badge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    color: '#fff',
    fontFamily: FONT.bold,
    fontSize: 11,
  },

  badgeEmpty: {
    width: 24,
    height: 24,
  },

  clearBtn: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
  },

  clearText: {
    marginLeft: 4,
    color: COLORS.textMuted,
    fontFamily: FONT.regular,
    fontSize: 12,
  },

  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  footerText: {
    textAlign: 'center',
    marginBottom: 10,
    color: COLORS.textMuted,
    fontFamily: FONT.regular,
    fontSize: 12,
  },
});