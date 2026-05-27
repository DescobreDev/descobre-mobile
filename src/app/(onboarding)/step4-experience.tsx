// - Opção "Em busca do primeiro emprego" desabilita o formulário
// - Primeira experiência é pedida por padrão
// - Experiências adicionais são opcionais (botão "Adicionar mais")
// - Cada card pode ser expandido para edição e removido

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Switch,
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
import { useOnboardingStore, OnboardingExperience } from '../../store/onBoardingStore';


function emptyExperience(): OnboardingExperience {
  return {
    company: '',
    position: '',
    startDate: '',
    endDate: null,
    current: false,
    description: '',
  };
}

function formatMonthYear(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 6)}`;
}

function toIsoDate(display: string): string {
  const parts = display.split('/');
  if (parts.length !== 2) return '';
  return `${parts[1]}-${parts[0]}`;
}

function isValidMonthYear(value: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/\d{4}$/;
  return regex.test(value);
}

function isExperienceValid(exp: OnboardingExperience): boolean {
  return (
    exp.company.trim().length > 0 &&
    exp.position.trim().length > 0 &&
    isValidMonthYear(exp.startDate) &&
    (exp.current || isValidMonthYear(exp.endDate ?? ''))
  );
}

interface ExperienceCardProps {
  exp: OnboardingExperience;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onChange: (updated: OnboardingExperience) => void;
  onRemove: () => void;
  isFirst: boolean;
}

function ExperienceCard({
  exp,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
  isFirst,
}: ExperienceCardProps) {
  const valid = isExperienceValid(exp);

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      {/* Cabeçalho do card */}
      <TouchableOpacity
        onPress={onToggle}
        style={styles.cardHeader}
        activeOpacity={0.75}
      >
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.cardIndexBadge, valid && styles.cardIndexBadgeOk]}>
            {valid ? (
              <Ionicons name="checkmark" size={12} color="#fff" />
            ) : (
              <Text style={styles.cardIndexText}>{index + 1}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {exp.position || (isFirst ? 'Experiência principal' : `Experiência ${index + 1}`)}
            </Text>
            {exp.company ? (
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {exp.company}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={styles.cardHeaderRight}>
          {!isFirst && (
            <TouchableOpacity
              onPress={onRemove}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.removeBtn}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.red} />
            </TouchableOpacity>
          )}
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.text2}
          />
        </View>
      </TouchableOpacity>

      {/* Formulário expansível */}
      {expanded && (
        <View style={styles.cardBody}>
          <View style={styles.divider} />

          <Field
            label="Empresa *"
            placeholder="Nome da empresa"
            value={exp.company}
            onChangeText={(v) => onChange({ ...exp, company: v })}
          />
          <Field
            label="Cargo *"
            placeholder="Ex: Analista de Dados"
            value={exp.position}
            onChangeText={(v) => onChange({ ...exp, position: v })}
          />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Field
                label="Início *"
                placeholder="MM/AAAA"
                value={exp.startDate}
                onChangeText={(v) =>
                  onChange({ ...exp, startDate: formatMonthYear(v) })
                }
                keyboardType="number-pad"
                maxLength={7}
              />
            </View>
            {!exp.current && (
              <View style={{ flex: 1 }}>
                <Field
                  label="Término *"
                  placeholder="MM/AAAA"
                  value={exp.endDate ?? ''}
                  onChangeText={(v) =>
                    onChange({ ...exp, endDate: formatMonthYear(v) })
                  }
                  keyboardType="number-pad"
                  maxLength={7}
                />
              </View>
            )}
          </View>

          {/* Toggle emprego atual */}
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Emprego atual</Text>
            <Switch
              value={exp.current}
              onValueChange={(v) =>
                onChange({ ...exp, current: v, endDate: v ? null : '' })
              }
              trackColor={{ false: COLORS.border, true: COLORS.orange }}
              thumbColor="#fff"
            />
          </View>

          {/* Descrição opcional */}
          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>
              Descrição{' '}
              <Text style={styles.fieldOptional}>(opcional)</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Principais responsabilidades e conquistas..."
              placeholderTextColor={COLORS.textMuted}
              value={exp.description}
              onChangeText={(v) => onChange({ ...exp, description: v })}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>
      )}
    </View>
  );
}

// ─── CAMPO GENÉRICO ───────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
  maxLength?: number;
}

function Field({ label, placeholder, value, onChangeText, keyboardType = 'default', maxLength }: FieldProps) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        returnKeyType="next"
      />
    </View>
  );
}

// ─── TELA PRINCIPAL ───────────────────────────────────────────────────────────

export default function Step4Experience() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, prevStep, setExperiences, setFirstJobSeeker, data } =
    useOnboardingStore();

  const [firstJobSeeker, setFirstJobSeekerLocal] = useState(data.firstJobSeeker);
  const [experiences, setExperiencesLocal] = useState<OnboardingExperience[]>(
    data.experiences.length > 0 ? data.experiences : [emptyExperience()]
  );
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const toggleFirstJob = (v: boolean) => {
    setFirstJobSeekerLocal(v);
    if (v) setExpandedIndex(-1);
    else setExpandedIndex(0);
  };

  const addExperience = () => {
    const next = [...experiences, emptyExperience()];
    setExperiencesLocal(next);
    setExpandedIndex(next.length - 1);
  };

  const updateExp = (index: number, updated: OnboardingExperience) => {
    const next = [...experiences];
    next[index] = updated;
    setExperiencesLocal(next);
  };

  const removeExp = (index: number) => {
    Alert.alert('Remover experiência', 'Tem certeza?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: () => {
          const next = experiences.filter((_, i) => i !== index);
          setExperiencesLocal(next);
          setExpandedIndex(Math.max(0, index - 1));
        },
      },
    ]);
  };

  // Primeiro emprego: sempre pode avançar
  // Com experiências: pelo menos a primeira deve ser válida
  const firstExpValid = firstJobSeeker || isExperienceValid(experiences[0]);

  const handleNext = () => {
    setFirstJobSeeker(firstJobSeeker);
    // Salva apenas as válidas (as adicionais incompletas são ignoradas)
    const validExps = firstJobSeeker
      ? []
      : experiences.filter(isExperienceValid).map((exp) => ({
          ...exp,
          startDate: toIsoDate(exp.startDate),
          endDate: exp.endDate ? toIsoDate(exp.endDate) : null,
        }));
    setExperiences(validExps);
    nextStep();
    router.push('/(onboarding)/step5-skills');
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
        title="Experiências"
        subtitle="Conte-nos sua trajetória profissional."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        <TouchableOpacity
          onPress={() => toggleFirstJob(!firstJobSeeker)}
          style={[styles.firstJobToggle, firstJobSeeker && styles.firstJobToggleActive]}
          activeOpacity={0.8}
        >
          <View style={styles.firstJobLeft}>
            <Text style={styles.firstJobEmoji}>🌱</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.firstJobTitle, firstJobSeeker && styles.firstJobTitleActive]}>
                Em busca do primeiro emprego
              </Text>
              <Text style={styles.firstJobSub}>
                Não tem histórico profissional? Sem problema!
              </Text>
            </View>
          </View>
          <View style={[styles.checkBox, firstJobSeeker && styles.checkBoxActive]}>
            {firstJobSeeker && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
        </TouchableOpacity>

        {/* Cards de experiência */}
        {!firstJobSeeker && (
          <View style={styles.experiencesBlock}>
            {experiences.map((exp, i) => (
              <ExperienceCard
                key={i}
                exp={exp}
                index={i}
                expanded={expandedIndex === i}
                onToggle={() => setExpandedIndex(expandedIndex === i ? -1 : i)}
                onChange={(updated) => updateExp(i, updated)}
                onRemove={() => removeExp(i)}
                isFirst={i === 0}
              />
            ))}

            {/* Botão adicionar */}
            <TouchableOpacity
              onPress={addExperience}
              style={styles.addBtn}
              activeOpacity={0.75}
            >
              <Ionicons name="add-circle-outline" size={20} color={COLORS.orange} />
              <Text style={styles.addBtnText}>Adicionar outra experiência</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {!firstExpValid && (
          <Text style={styles.footerHint}>
            Preencha empresa, cargo e período da primeira experiência
          </Text>
        )}
        <PrimaryButton
          label="Continuar"
          onPress={handleNext}
          disabled={!firstExpValid}
        />
      </View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xl },

  // Toggle primeiro emprego
  firstJobToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  firstJobToggleActive: {
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
  },
  firstJobLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  firstJobEmoji: { fontSize: 24 },
  firstJobTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 2,
  },
  firstJobTitleActive: { color: COLORS.orangeDark },
  firstJobSub: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxActive: {
    backgroundColor: COLORS.orange,
    borderColor: COLORS.orange,
  },

  // Cards
  experiencesBlock: { gap: 10 },
  card: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
  },
  cardExpanded: { borderColor: COLORS.orange },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  cardIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 99,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIndexBadgeOk: { backgroundColor: COLORS.green },
  cardIndexText: {
    fontFamily: FONT.bold,
    fontSize: 12,
    color: COLORS.text2,
  },
  cardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.text,
  },
  cardSubtitle: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.text2,
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  removeBtn: { padding: 4 },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  cardBody: { padding: SPACING.md, gap: SPACING.sm },

  // Campos
  row: { flexDirection: 'row', gap: SPACING.sm },
  fieldBlock: { gap: 4 },
  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  fieldOptional: {
    fontFamily: FONT.regular,
    color: COLORS.textMuted,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputMultiline: {
    height: 80,
    paddingTop: 10,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  switchLabel: {
    fontFamily: FONT.medium,
    fontSize: 14,
    color: COLORS.text,
  },

  // Botão adicionar
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
    marginTop: 4,
  },
  addBtnText: {
    fontFamily: FONT.semiBold,
    fontSize: 14,
    color: COLORS.orange,
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