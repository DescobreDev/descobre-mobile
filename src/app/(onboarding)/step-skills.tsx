import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { OnboardingHeader, COLORS, FONT, SPACING } from '../../components/onboarding/OnboardingHeader';
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
  'Excel', 'Word', 'PowerPoint', 'Premiere Pro',
];

const COMMON_LANGUAGES = [
  'Inglês', 'Espanhol', 'Francês', 'Alemão',
  'Italiano', 'Mandarim', 'Japonês', 'Árabe', 'Português',
];

type SkillLevel = typeof SKILL_LEVELS[number]['value'];
type LangLevel = typeof LANGUAGE_LEVELS[number]['value'];

function LevelChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.chip, selected && styles.chipSelected]} activeOpacity={0.75}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Dropdown({
  value,
  placeholder,
  options,
  onSelect,
}: {
  value: string;
  placeholder: string;
  options: readonly { value: string; label: string }[];
  onSelect: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [layout, setLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = useRef<View>(null);
  const selected = options.find((o) => o.value === value);

  const openDropdown = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setLayout({ x, y, width, height });
      setOpen(true);
    });
  };

  const screenHeight = Dimensions.get('window').height;
  const listMaxHeight = 220;
  const spaceBelow = screenHeight - (layout.y + layout.height);
  const opensUpward = spaceBelow < listMaxHeight && layout.y > listMaxHeight;

  return (
    <View style={styles.dropdownWrapper}>
      <TouchableOpacity
        ref={triggerRef}
        style={[styles.dropdownTrigger, open && styles.dropdownTriggerOpen]}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownValue,
            !selected && styles.dropdownPlaceholder,
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selected?.label ?? placeholder}
        </Text>

        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.text2}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.dropdownList,
              {
                left: layout.x,
                width: layout.width,
                maxHeight: listMaxHeight,
                ...(opensUpward
                  ? { top: layout.y - listMaxHeight - 4 }
                  : { top: layout.y + layout.height + 4 }),
              },
            ]}
          >
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              showsVerticalScrollIndicator
              renderItem={({ item: o }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    value === o.value && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(o.value);
                    setOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === o.value &&
                      styles.dropdownItemTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {o.label}
                  </Text>

                  {value === o.value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color={COLORS.orange}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

interface LangRowProps {
  lang: OnboardingLanguage;
  index: number;
  usedLanguages: string[];
  onChange: (i: number, lang: OnboardingLanguage) => void;
  onRemove: (i: number) => void;
}

function LanguageRow({ lang, index, usedLanguages, onChange, onRemove }: LangRowProps) {
  const availableLangs = COMMON_LANGUAGES.filter(
    (l) => l === lang.language || !usedLanguages.includes(l)
  );

  return (
    <View style={styles.langRow}>
      <View style={styles.langDropdowns}>
        <View style={{ flex: 1.1, minWidth: 0 }}>
          <Dropdown
            value={lang.language}
            placeholder="Selecione."
            options={availableLangs.map((l) => ({
              value: l,
              label: l,
            }))}
            onSelect={(v) => onChange(index, { ...lang, language: v })}
          />
        </View>

        <View style={{ flex: 1, minWidth: 0 }}>
          <Dropdown
            value={lang.level}
            placeholder="Nível"
            options={LANGUAGE_LEVELS}
            onSelect={(v) =>
              onChange(index, {
                ...lang,
                level: v as LangLevel,
              })
            }
          />
        </View>
      </View>
      <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="trash-outline" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

export default function Step5Skills() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, prevStep, setSkills, setLanguages, data } = useOnboardingStore();

  const [skills, setSkillsLocal] = useState<OnboardingSkill[]>(data.skills);
  const [skillInput, setSkillInput] = useState('');

  const [languages, setLanguagesLocal] = useState<OnboardingLanguage[]>(
    data.languages.length > 0 ? data.languages : [{ language: '', level: 'INTERMEDIARIO' }]
  );

  const addSkill = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) return;
    setSkillsLocal([...skills, { name: trimmed, level: 'INTERMEDIARIO' }]);
    setSkillInput('');
  };

  const removeSkill = (i: number) => setSkillsLocal(skills.filter((_, idx) => idx !== i));

  const updateSkillLevel = (i: number, level: SkillLevel) => {
    const next = [...skills];
    next[i] = { ...next[i], level };
    setSkillsLocal(next);
  };

  const addLanguageRow = () => {
    setLanguagesLocal([...languages, { language: '', level: 'INTERMEDIARIO' }]);
  };

  const updateLanguage = (i: number, lang: OnboardingLanguage) => {
    const next = [...languages];
    next[i] = lang;
    setLanguagesLocal(next);
  };

  const removeLanguage = (i: number) => {
    if (languages.length === 1) {
      setLanguagesLocal([{ language: '', level: 'INTERMEDIARIO' }]);
    } else {
      setLanguagesLocal(languages.filter((_, idx) => idx !== i));
    }
  };

  const handleNext = () => {
    setSkills(skills);
    setLanguages(languages.filter((l) => l.language !== ''));
    nextStep();
    router.push('/(onboarding)/step-avatar');
  };

  const handleBack = () => { prevStep(); router.back(); };

  const usedLanguages = languages.map((l) => l.language).filter(Boolean);
  const visibleSuggestions = COMMON_SKILLS.filter(
    (s) => !skills.some((sk) => sk.name.toLowerCase() === s.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep} totalSteps={totalSteps} onBack={handleBack}
        title="Habilidades & Idiomas"
        subtitle="Adicione suas competências e os idiomas que você fala."
        optional
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Habilidades</Text>
          <Text style={styles.sectionHint}>Digite ou toque nas sugestões abaixo</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Ex: Atendimento ao cliente"
              placeholderTextColor={COLORS.textMuted}
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={() => addSkill(skillInput)}
              returnKeyType="done"
            />
            <TouchableOpacity
              onPress={() => addSkill(skillInput)}
              style={[styles.addIconBtn, !skillInput.trim() && { opacity: 0.4 }]}
              disabled={!skillInput.trim()}
            >
              <Ionicons name="add" size={24} color={COLORS.orange} />
            </TouchableOpacity>
          </View>

          {visibleSuggestions.length > 0 && (
            <View style={styles.suggestionRow}>
              {visibleSuggestions.map((s) => (
                <TouchableOpacity key={s} onPress={() => addSkill(s)} style={styles.suggestionChip}>
                  <Ionicons name="add" size={13} color={COLORS.orange} />
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {skills.map((skill, i) => (
            <View key={i} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{skill.name}</Text>
                <TouchableOpacity onPress={() => removeSkill(i)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={styles.cardLabel}>Qual é o seu nível?</Text>
              <View style={styles.chipRow}>
                {SKILL_LEVELS.map((lvl) => (
                  <LevelChip
                    key={lvl.value}
                    label={lvl.label}
                    selected={skill.level === lvl.value}
                    onPress={() => updateSkillLevel(i, lvl.value)}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Idiomas</Text>
          <Text style={styles.sectionHint}>Selecione os idiomas que você fala</Text>

          {languages.map((lang, i) => (
            <LanguageRow
              key={i}
              lang={lang}
              index={i}
              usedLanguages={usedLanguages}
              onChange={updateLanguage}
              onRemove={removeLanguage}
            />
          ))}

          <TouchableOpacity onPress={addLanguageRow} style={styles.addLangBtn} activeOpacity={0.75}>
            <Ionicons name="add-circle-outline" size={22} color={COLORS.orange} />
            <Text style={styles.addLangText}>Adicionar outro idioma</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: 40 },

  section: { marginBottom: SPACING.xl },
  sectionTitle: { fontFamily: FONT.semiBold, fontSize: 18, color: COLORS.text, marginBottom: 2 },
  sectionHint: { fontFamily: FONT.regular, fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.md },

  inputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  textInput: {
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14,
    fontFamily: FONT.regular, fontSize: 16, color: COLORS.text, backgroundColor: COLORS.surface,
  },
  addIconBtn: {
    width: 50, height: 50, borderRadius: 12,
    borderWidth: 1.5, borderColor: COLORS.border,
    alignItems: 'center', justifyContent: 'center',
  },

  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  suggestionChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 99,
    borderWidth: 1, borderColor: COLORS.orangeBorder, backgroundColor: COLORS.orangeLight,
  },
  suggestionText: { fontFamily: FONT.medium, fontSize: 16, color: COLORS.orangeDark },

  card: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14,
    padding: 14, gap: 8, marginBottom: 10,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: FONT.semiBold, fontSize: 18, color: COLORS.text },
  cardLabel: { fontFamily: FONT.regular, fontSize: 16, color: COLORS.text2 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 7, paddingVertical: 4, borderRadius: 99,
    borderWidth: 1.5, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  chipSelected: { borderColor: COLORS.orange, backgroundColor: COLORS.orangeLight },
  chipText: { fontFamily: FONT.medium, fontSize: 16, color: COLORS.text2 },
  chipTextSelected: { color: COLORS.orangeDark },

  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 12,
  },

  langDropdowns: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  removeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dropdownWrapper: {
    flex: 1,
    minWidth: 0,
  },
  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1.5, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, backgroundColor: COLORS.surface,
  },
  dropdownTriggerOpen: { borderColor: COLORS.orange },
  dropdownValue: {
    fontFamily: FONT.regular,
    fontSize: 16,
    color: COLORS.text,
    flex: 1,
    minWidth: 0,
    marginRight: 4,
  },

  dropdownPlaceholder: { color: COLORS.textMuted },
  dropdownList: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    overflow: 'hidden',
  },

  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: { backgroundColor: COLORS.orangeLight },
  dropdownItemText: { fontFamily: FONT.regular, fontSize: 16, color: COLORS.text },
  dropdownItemTextSelected: { fontFamily: FONT.semiBold, color: COLORS.orangeDark },

  addLangBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: COLORS.orangeBorder, borderStyle: 'dashed',
    borderRadius: 14, paddingVertical: 16, marginTop: 4,
  },
  addLangText: { fontFamily: FONT.semiBold, fontSize: 16, color: COLORS.orange },

  footer: {
    padding: SPACING.md, paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface, borderTopWidth: 1, borderTopColor: COLORS.border, gap: 4,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipText: { fontFamily: FONT.medium, fontSize: 16, color: COLORS.textMuted },
});