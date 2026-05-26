import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
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
import { useOnboardingStore } from '../../store/onBoardingStore';

const EDUCATION_LEVELS = [
  { value: 'FUNDAMENTAL', label: 'Ensino\nFundamental', icon: 'school-outline' as const },
  { value: 'MEDIO', label: 'Ensino\nMédio', icon: 'library-outline' as const },
  { value: 'TECNICO', label: 'Técnico', icon: 'construct-outline' as const },
  { value: 'SUPERIOR', label: 'Superior\n(Graduação)', icon: 'book-outline' as const },
  { value: 'POS_GRADUACAO', label: 'Pós-\nGraduação', icon: 'ribbon-outline' as const },
  { value: 'MESTRADO', label: 'Mestrado', icon: 'flask-outline' as const },
  { value: 'DOUTORADO', label: 'Doutorado', icon: 'planet-outline' as const },
] as const;

type EducationLevelValue = typeof EDUCATION_LEVELS[number]['value'];

const INSTITUTION_SUGGESTIONS = [
  'USP', 'UNICAMP', 'UNESP', 'UFMG', 'UFRJ', 'UnB',
  'FGV', 'PUC', 'Mackenzie', 'Senai', 'Senac',
];

export default function Step3Education() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, prevStep, setEducation, data } =
    useOnboardingStore();

  const [selectedLevel, setSelectedLevel] = useState<EducationLevelValue | null>(
    (data.education?.level as EducationLevelValue) ?? null
  );
  const [institution, setInstitution] = useState(data.education?.institution ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const canAdvance = !!selectedLevel;

  const handleNext = () => {
    setEducation(
      selectedLevel
        ? { level: selectedLevel, institution: institution.trim() }
        : null
    );
    nextStep();
    router.push('/(onboarding)/step4-experience');
  };

  const handleBack = () => {
    prevStep();
    router.back();
  };

  const pickSuggestion = (name: string) => {
    setInstitution(name);
    setShowSuggestions(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        onBack={handleBack}
        title="Escolaridade"
        subtitle="Qual é o seu nível de formação mais alto?"
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── GRID DE NÍVEIS ─────────────────────────────────────────────── */}
        <View style={styles.levelsGrid}>
          {EDUCATION_LEVELS.map((lvl) => {
            const active = selectedLevel === lvl.value;
            return (
              <TouchableOpacity
                key={lvl.value}
                onPress={() => setSelectedLevel(lvl.value)}
                style={[styles.levelCard, active && styles.levelCardActive]}
                activeOpacity={0.75}
                accessibilityRole="radio"
                accessibilityState={{ checked: active }}
              >
                <View style={[styles.levelIcon, active && styles.levelIconActive]}>
                  <Ionicons
                    name={lvl.icon}
                    size={24}
                    color={active ? COLORS.orange : COLORS.text2}
                  />
                </View>
                <Text style={[styles.levelLabel, active && styles.levelLabelActive]}>
                  {lvl.label}
                </Text>
                {active && (
                  <View style={styles.checkDot}>
                    <Ionicons name="checkmark" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── CAMPO INSTITUIÇÃO ──────────────────────────────────────────── */}
        {selectedLevel && (
          <View style={styles.institutionBlock}>
            <Text style={styles.institutionLabel}>
              Instituição{' '}
              <Text style={styles.institutionOptional}>(opcional)</Text>
            </Text>

            <View style={styles.inputWrapper}>
              <Ionicons
                name="business-outline"
                size={18}
                color={COLORS.textMuted}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Nome da instituição"
                placeholderTextColor={COLORS.textMuted}
                value={institution}
                onChangeText={setInstitution}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                returnKeyType="done"
              />
              {institution.length > 0 && (
                <TouchableOpacity onPress={() => setInstitution('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Sugestões rápidas */}
            {showSuggestions && institution.length === 0 && (
              <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionsTitle}>Sugestões</Text>
                <View style={styles.suggestionsRow}>
                  {INSTITUTION_SUGGESTIONS.map((name) => (
                    <TouchableOpacity
                      key={name}
                      onPress={() => pickSuggestion(name)}
                      style={styles.suggestionChip}
                    >
                      <Text style={styles.suggestionText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── RODAPÉ ─────────────────────────────────────────────────────────── */}
      <View style={styles.footer}>
        {!canAdvance && (
          <Text style={styles.footerHint}>Selecione seu nível de formação</Text>
        )}
        <PrimaryButton
          label="Continuar"
          onPress={handleNext}
          disabled={!canAdvance}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  // Grid de níveis — 3 colunas
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: SPACING.xl,
  },
  levelCard: {
    // 3 colunas com gap de 10 em padding 16 cada lado: (width - 32 - 20) / 3
    width: '30.5%',
    aspectRatio: 0.92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    padding: SPACING.sm,
    position: 'relative',
  },
  levelCardActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  levelIcon: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelIconActive: {
    backgroundColor: 'rgba(249,115,22,0.12)',
  },
  levelLabel: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 16,
  },
  levelLabelActive: {
    color: COLORS.orangeDark,
    fontFamily: FONT.semiBold,
  },
  checkDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 99,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Instituição
  institutionBlock: { gap: SPACING.sm },
  institutionLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: COLORS.text,
  },
  institutionOptional: {
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
    height: 52,
  },
  inputIcon: { marginRight: 2 },
  input: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text,
  },

  // Sugestões
  suggestionsBox: {
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  suggestionsTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.text2,
  },

  // Rodapé
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