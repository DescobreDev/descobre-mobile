import React, { useState } from 'react';
import {
  View,
  Text,
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
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const EDUCATION_LEVELS = [
  { value: 'NAO_ALFABETIZADO', label: 'Não\nAlfabetizado', icon: 'reader-outline' as const },
  { value: 'SEM_ESCOLARIDADE', label: 'Sem\nEscolaridade', icon: 'document-outline' as const },
  { value: 'FUNDAMENTAL', label: 'Ensino\nFundamental', icon: 'school-outline' as const },
  { value: 'MEDIO', label: 'Ensino\nMédio', icon: 'library-outline' as const },
  { value: 'TECNICO', label: 'Técnico', icon: 'construct-outline' as const },
  { value: 'SUPERIOR', label: 'Superior\n(Graduação)', icon: 'book-outline' as const },
  { value: 'POS_GRADUACAO', label: 'Pós-\nGraduação', icon: 'ribbon-outline' as const },
  { value: 'MESTRADO', label: 'Mestrado', icon: 'flask-outline' as const },
  { value: 'DOUTORADO', label: 'Doutorado', icon: 'planet-outline' as const },
] as const;

const HIDE_INSTITUTION_LEVELS = [
  'NAO_ALFABETIZADO',
  'NAO_ESCOLARIZADO',
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

  const shouldShowInstitution =
    selectedLevel &&
    !HIDE_INSTITUTION_LEVELS.includes(
      selectedLevel as (typeof HIDE_INSTITUTION_LEVELS)[number]
    );

  const [institution, setInstitution] = useState(data.education?.institution ?? '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const canAdvance = !!selectedLevel;

  const handleNext = () => {
    setEducation(
      selectedLevel
        ? {
          level: selectedLevel,
          institution: shouldShowInstitution
            ? institution.trim()
            : '',
        }
        : null
    );
    nextStep();
    router.push('/(onboarding)/step-experience');
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

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={20}
      >

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

        {shouldShowInstitution && (
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

      </KeyboardAwareScrollView>

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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  levelCard: {
    width: '30.5%',
    aspectRatio: 0.92,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
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
    fontSize: 14,
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

  institutionBlock: { gap: SPACING.sm },
  institutionLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.text,
  },
  institutionOptional: {
    fontFamily: FONT.regular,
    fontSize: 16,
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
    fontSize: 16,
    color: COLORS.text,
  },

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
    fontSize: 14,
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
    fontSize: 16,
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
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});