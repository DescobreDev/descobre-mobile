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
import { useOnboardingStore, OnboardingSkill, OnboardingLanguage } from '../../store/onBoardingStore';

const SKILL_LEVELS = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
] as const;

const LANGUAGE_LEVELS = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
  { value: 'FLUENTE', label: 'Fluente' },
  { value: 'NATIVO', label: 'Nativo' },
] as const;

const COMMON_SKILLS = [
  'Excel', 'Power BI', 'SQL', 'Python', 'JavaScript',
  'Atendimento ao cliente', 'Liderança', 'Gestão de projetos',
  'Photoshop', 'AutoCAD',
];

const COMMON_LANGUAGES = [
  'Inglês', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Mandarim', 'Português', 'Japonês',
];

type SkillLevel = typeof SKILL_LEVELS[number]['value'];
type LangLevel = typeof LANGUAGE_LEVELS[number]['value'];

// ─── CHIP DE NÍVEL ────────────────────────────────────────────────────────────
interface LevelChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  small?: boolean;
}
function LevelChip({ label, selected, onPress, small = false }: LevelChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.levelChip, selected && styles.levelChipSelected, small && styles.levelChipSmall]}
      activeOpacity={0.75}
    >
      <Text style={[styles.levelChipText, selected && styles.levelChipTextSelected, small && styles.levelChipTextSmall]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────────────────────
export default function Step5Skills() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, prevStep, setSkills, setLanguages, data } =
    useOnboardingStore();

  // ── HABILIDADES ─────────────────────────────────────────────────────────────
  const [skills, setSkillsLocal] = useState<OnboardingSkill[]>(data.skills);
  const [skillInput, setSkillInput] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<SkillLevel>('INTERMEDIARIO');

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkillsLocal([...skills, { name: trimmed, level: selectedSkillLevel }]);
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setSkillsLocal(skills.filter((_, i) => i !== index));
  };

  const updateSkillLevel = (index: number, level: SkillLevel) => {
    const next = [...skills];
    next[index] = { ...next[index], level };
    setSkillsLocal(next);
  };

  // ── IDIOMAS ─────────────────────────────────────────────────────────────────
  const [languages, setLanguagesLocal] = useState<OnboardingLanguage[]>(data.languages);
  const [addingLanguage, setAddingLanguage] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState('');
  const [pendingLangLevel, setPendingLangLevel] = useState<LangLevel>('INTERMEDIARIO');

  const confirmLanguage = () => {
    if (!pendingLanguage) return;
    if (languages.some((l) => l.language === pendingLanguage)) {
      setAddingLanguage(false);
      return;
    }
    setLanguagesLocal([...languages, { language: pendingLanguage, level: pendingLangLevel }]);
    setPendingLanguage('');
    setPendingLangLevel('INTERMEDIARIO');
    setAddingLanguage(false);
  };

  const removeLanguage = (index: number) => {
    setLanguagesLocal(languages.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    setSkills(skills);
    setLanguages(languages);
    nextStep();
    router.push('/(onboarding)/step6-avatar');
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
        title="Habilidades & Idiomas"
        subtitle="Adicione competências que fazem parte do seu dia a dia."
        optional
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── SEÇÃO HABILIDADES ──────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>

          {/* Nível padrão para novas habilidades */}
          <View style={styles.defaultLevelRow}>
            <Text style={styles.defaultLevelLabel}>Nível padrão:</Text>
            <View style={styles.defaultLevelChips}>
              {SKILL_LEVELS.map((lvl) => (
                <LevelChip
                  key={lvl.value}
                  label={lvl.label}
                  selected={selectedSkillLevel === lvl.value}
                  onPress={() => setSelectedSkillLevel(lvl.value)}
                  small
                />
              ))}
            </View>
          </View>

          {/* Input para nova habilidade */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Ex: Gestão de projetos"
              placeholderTextColor={COLORS.textMuted}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={() => addSkill(skillInput)}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => addSkill(skillInput)}
              style={styles.addIconBtn}
              disabled={!skillInput.trim()}
            >
              <Ionicons
                name="add"
                size={22}
                color={skillInput.trim() ? COLORS.orange : COLORS.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Sugestões rápidas */}
          <View style={styles.suggestRow}>
            {COMMON_SKILLS.filter(
              (s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
            ).slice(0, 6).map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => addSkill(s)}
                style={styles.suggestionChip}
              >
                <Ionicons name="add" size={12} color={COLORS.orange} />
                <Text style={styles.suggestionChipText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lista de habilidades adicionadas */}
          {skills.length > 0 && (
            <View style={styles.addedList}>
              {skills.map((skill, i) => (
                <View key={i} style={styles.addedItem}>
                  <View style={styles.addedItemTop}>
                    <Text style={styles.addedItemName}>{skill.name}</Text>
                    <TouchableOpacity onPress={() => removeSkill(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Ionicons name="close" size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.levelChipsRow}>
                    {SKILL_LEVELS.map((lvl) => (
                      <LevelChip
                        key={lvl.value}
                        label={lvl.label}
                        selected={skill.level === lvl.value}
                        onPress={() => updateSkillLevel(i, lvl.value)}
                        small
                      />
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── SEÇÃO IDIOMAS ──────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>

          {/* Idiomas adicionados */}
          {languages.map((lang, i) => (
            <View key={i} style={styles.langCard}>
              <View style={styles.langCardHeader}>
                <Text style={styles.langName}>{lang.language}</Text>
                <TouchableOpacity onPress={() => removeLanguage(i)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.levelChipsRow}>
                {LANGUAGE_LEVELS.map((lvl) => (
                  <LevelChip
                    key={lvl.value}
                    label={lvl.label}
                    selected={lang.level === lvl.value}
                    onPress={() => {
                      const next = [...languages];
                      next[i] = { ...next[i], level: lvl.value };
                      setLanguagesLocal(next);
                    }}
                    small
                  />
                ))}
              </View>
            </View>
          ))}

          {/* Painel adicionar idioma */}
          {addingLanguage ? (
            <View style={styles.langAddPanel}>
              <Text style={styles.langAddLabel}>Selecione o idioma</Text>
              <View style={styles.langOptions}>
                {COMMON_LANGUAGES.filter(
                  (l) => !languages.some((lang) => lang.language === l)
                ).map((l) => (
                  <TouchableOpacity
                    key={l}
                    onPress={() => setPendingLanguage(l)}
                    style={[styles.langOption, pendingLanguage === l && styles.langOptionSelected]}
                  >
                    <Text style={[styles.langOptionText, pendingLanguage === l && styles.langOptionTextSelected]}>
                      {l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {pendingLanguage !== '' && (
                <>
                  <Text style={[styles.langAddLabel, { marginTop: SPACING.sm }]}>Nível</Text>
                  <View style={styles.levelChipsRow}>
                    {LANGUAGE_LEVELS.map((lvl) => (
                      <LevelChip
                        key={lvl.value}
                        label={lvl.label}
                        selected={pendingLangLevel === lvl.value}
                        onPress={() => setPendingLangLevel(lvl.value)}
                        small
                      />
                    ))}
                  </View>
                </>
              )}

              <View style={styles.langPanelBtns}>
                <TouchableOpacity onPress={() => setAddingLanguage(false)} style={styles.langCancelBtn}>
                  <Text style={styles.langCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLanguage}
                  style={[styles.langConfirmBtn, !pendingLanguage && { opacity: 0.4 }]}
                  disabled={!pendingLanguage}
                >
                  <Text style={styles.langConfirmText}>Adicionar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setAddingLanguage(true)}
              style={styles.addBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.orange} />
              <Text style={styles.addBtnText}>Adicionar idioma</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continuar" onPress={handleNext} />
        <TouchableOpacity onPress={handleNext} style={styles.skipBtn}>
          <Text style={styles.skipText}>Pular esta etapa</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },

  section: { marginBottom: SPACING.xl },
  sectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  defaultLevelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
    flexWrap: 'wrap',
  },
  defaultLevelLabel: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.text2,
  },
  defaultLevelChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  addIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  suggestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: SPACING.md,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.orangeBorder,
    backgroundColor: COLORS.orangeLight,
  },
  suggestionChipText: {
    fontFamily: FONT.medium,
    fontSize: 12,
    color: COLORS.orangeDark,
  },

  addedList: { gap: 8 },
  addedItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  addedItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addedItemName: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  levelChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  // Level chip
  levelChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  levelChipSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  levelChipSmall: { paddingHorizontal: 9, paddingVertical: 4 },
  levelChipText: {
    fontFamily: FONT.medium,
    fontSize: 13,
    color: COLORS.text2,
  },
  levelChipTextSelected: { color: COLORS.orangeDark },
  levelChipTextSmall: { fontSize: 11 },

  // Idiomas
  langCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 8,
  },
  langCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  langName: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.text },

  langAddPanel: {
    borderWidth: 1.5,
    borderColor: COLORS.orangeBorder,
    borderRadius: 14,
    padding: SPACING.md,
    backgroundColor: COLORS.orangeLight,
    gap: SPACING.sm,
  },
  langAddLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.orangeDark,
  },
  langOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  langOptionSelected: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.surface,
  },
  langOptionText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.text2 },
  langOptionTextSelected: { color: COLORS.orangeDark },

  langPanelBtns: { flexDirection: 'row', gap: SPACING.sm, marginTop: 4 },
  langCancelBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  langCancelText: { fontFamily: FONT.medium, fontSize: 14, color: COLORS.text2 },
  langConfirmBtn: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langConfirmText: { fontFamily: FONT.semiBold, fontSize: 14, color: '#fff' },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    borderWidth: 1.5,
    borderColor: COLORS.orangeBorder,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: SPACING.md,
  },
  addBtnText: { fontFamily: FONT.semiBold, fontSize: 14, color: COLORS.orange },

  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 4,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontFamily: FONT.medium, fontSize: 13, color: COLORS.textMuted },
});