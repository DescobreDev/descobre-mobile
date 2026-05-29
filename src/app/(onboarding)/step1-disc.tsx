import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingHeader, COLORS, FONT, SPACING } from '../../components/onboarding/OnboardingHeader';
import { PrimaryButton } from '../../components/onboarding/PrimaryButton';
import { useOnboardingStore } from '../../store/onBoardingStore'
const DISC_PROFILES = [
  {
    key: 'executor',
    label: 'Executor',
    icon: 'flash-outline' as const,
    color: '#ef4444',
    colorLight: '#fef2f2',
    description: 'Age com rapidez, foco em resultados e assume desafios.',
  },
  {
    key: 'comunicador',
    label: 'Comunicador',
    icon: 'chatbubbles-outline' as const,
    color: '#f97316',
    colorLight: '#fff7ed',
    description: 'Inspira pessoas, colaborativo e entusiasta.',
  },
  {
    key: 'planejador',
    label: 'Planejador',
    icon: 'shield-checkmark-outline' as const,
    color: '#10b981',
    colorLight: '#ecfdf5',
    description: 'Estável, paciente e focado em harmonia e consistência.',
  },
  {
    key: 'analista',
    label: 'Analista',
    icon: 'analytics-outline' as const,
    color: '#6366f1',
    colorLight: '#eef2ff',
    description: 'Preciso, detalhista e orientado a dados e qualidade.',
  },
];

export default function Step1Disc() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, setDiscCompleted } = useOnboardingStore();

  const handleAdvance = () => {
    setDiscCompleted(true);
    nextStep();
    router.push('/(onboarding)/step2-interests');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Seu perfil comportamental"
        subtitle="Entenda como você age no trabalho — isso ajuda a encontrar vagas ideais para você."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.devBadge}>
          <Ionicons name="construct-outline" size={15} color={COLORS.indigo} />
          <Text style={styles.devBadgeText}>Em breve — Teste completo disponível em breve</Text>
        </View>

        <Text style={styles.intro}>
          O <Text style={styles.highlight}>Teste DISC</Text> identifica seu estilo predominante de comportamento. Você terá dois perfis — um principal (visível para as empresas) e um secundário (para você se conhecer melhor).
        </Text>

        <Text style={styles.sectionLabel}>Os 4 perfis</Text>
        <View style={styles.cardsGrid}>
          {DISC_PROFILES.map((profile) => (
            <View
              key={profile.key}
              style={[styles.profileCard, { borderLeftColor: profile.color }]}
            >
              <View style={[styles.iconCircle, { backgroundColor: profile.colorLight }]}>
                <Ionicons name={profile.icon} size={22} color={profile.color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.profileName, { color: profile.color }]}>
                  {profile.label}
                </Text>
                <Text style={styles.profileDesc}>{profile.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={18} color={COLORS.text2} />
          <Text style={styles.infoText}>
            O resultado do seu perfil será atribuído automaticamente ao concluir o teste. Por enquanto, você pode continuar configurando seu perfil.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continuar" onPress={handleAdvance} />
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
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#eef2ff',
    borderRadius: 99,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  devBadgeText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.indigo,
  },
  intro: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text2,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  highlight: {
    fontFamily: FONT.semiBold,
    color: COLORS.text,
  },
  sectionLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  cardsGrid: {
    gap: 10,
    marginBottom: SPACING.lg,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  profileName: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
  },
  profileDesc: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 19,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 19,
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});