import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
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
  ContractType,
  ExperienceLevel,
} from '../../store/onBoardingStore';

import api from '../../services/api';
import { ENDPOINTS } from '../../constants/endpoints';

const SEARCH_DEBOUNCE_MS = 300;

interface SearchOption {
  id: number;
  name: string;
}

const CONTRACT_TYPES: { value: ContractType; label: string }[] = [
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'FREELANCER', label: 'Freelancer' },
];

const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'JUNIOR', label: 'Júnior' },
  { value: 'PLENO', label: 'Pleno' },
  { value: 'SENIOR', label: 'Sênior' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
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
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>

      {selected && (
        <Ionicons name="checkmark-circle" size={14} color={COLORS.orange} />
      )}
    </TouchableOpacity>
  );
}

// Autocomplete genérico: digita, filtra via API com debounce, seleciona da lista.
interface SearchSelectProps {
  label: string;
  placeholder: string;
  value: SearchOption | null;
  onSelect: (item: SearchOption | null) => void;
  fetchOptions: (query: string) => Promise<SearchOption[]>;
}

function SearchSelect({
  label,
  placeholder,
  value,
  onSelect,
  fetchOptions,
}: SearchSelectProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchOption[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setLoading(true);

    const timeout = setTimeout(async () => {
      try {
        const options = await fetchOptions(query);
        setResults(options);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query, open]);

  if (value) {
    return (
      <View style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <View style={styles.selectedRow}>
          <Text style={styles.selectedText}>{value.name}</Text>
          <TouchableOpacity
            onPress={() => {
              onSelect(null);
              setQuery('');
              setResults([]);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <TextInput
        value={query}
        onChangeText={(text) => {
          setQuery(text);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        style={styles.input}
      />

      {open && (
        <View style={styles.dropdown}>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={COLORS.orange}
              style={styles.dropdownLoading}
            />
          ) : results.length === 0 ? (
            <Text style={styles.dropdownEmpty}>Nenhum resultado</Text>
          ) : (
            results.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </View>
  );
}

export default function StepJobPreferences() {
  const router = useRouter();

  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    setJobPreferences,
    data,
  } = useOnboardingStore();

  const [selectedSector, setSelectedSector] = useState<SearchOption | null>(
    data.desiredSectorId
      ? { id: data.desiredSectorId, name: data.desiredSectorName }
      : null
  );

  const [selectedPosition, setSelectedPosition] = useState<SearchOption | null>(
    data.desiredPositionId
      ? { id: data.desiredPositionId, name: data.desiredPositionName }
      : null
  );

  const [salaryMin, setSalaryMin] = useState(data.salaryMin);
  const [salaryMax, setSalaryMax] = useState(data.salaryMax);
  const [salaryNegotiable, setSalaryNegotiable] = useState(
    data.salaryNegotiable
  );

  const [selectedContractTypes, setSelectedContractTypes] = useState<
    ContractType[]
  >(data.contractTypes);

  const [selectedLevel, setSelectedLevel] = useState<ExperienceLevel | null>(
    data.experienceLevel
  );

  const [acceptsTravel, setAcceptsTravel] = useState<boolean | null>(
    data.acceptsTravel
  );

  const [saving, setSaving] = useState(false);

  const fetchSectors = async (query: string): Promise<SearchOption[]> => {
    const res = await api.get(ENDPOINTS.onboarding.sectors(query));
    return res.data;
  };

  const fetchPositions = async (query: string): Promise<SearchOption[]> => {
    if (!selectedSector) return [];
    const res = await api.get(
      ENDPOINTS.onboarding.positions(selectedSector.id, query)
    );
    return res.data;
  };

  const handleSelectSector = (item: SearchOption | null) => {
    setSelectedSector(item);
    // trocar/limpar o setor invalida a posição escolhida anteriormente
    setSelectedPosition(null);
  };

  const toggleContractType = (value: ContractType) => {
    setSelectedContractTypes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const canAdvance =
    !!selectedSector &&
    !!selectedPosition &&
    selectedContractTypes.length > 0 &&
    !!selectedLevel &&
    acceptsTravel !== null;

  const handleNext = async () => {
    setSaving(true);

    try {
      setJobPreferences({
        desiredSectorId: selectedSector?.id ?? null,
        desiredSectorName: selectedSector?.name ?? '',
        desiredPositionId: selectedPosition?.id ?? null,
        desiredPositionName: selectedPosition?.name ?? '',
        salaryMin,
        salaryMax,
        salaryNegotiable,
        contractTypes: selectedContractTypes,
        experienceLevel: selectedLevel,
        acceptsTravel,
      });

      nextStep();

      router.push('/(onboarding)/step-location');
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
        title="Preferências de Vaga"
        subtitle="Conte pra gente que tipo de oportunidade você procura."
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cargo desejado (Setor -> Posição, busca com filtro) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cargo desejado</Text>

          <SearchSelect
            label="Setor"
            placeholder="Buscar setor..."
            value={selectedSector}
            onSelect={handleSelectSector}
            fetchOptions={fetchSectors}
          />

          {selectedSector && (
            <SearchSelect
              label="Cargo"
              placeholder="Buscar cargo..."
              value={selectedPosition}
              onSelect={setSelectedPosition}
              fetchOptions={fetchPositions}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pretensão salarial</Text>

          <View style={styles.salaryRow}>
            <View style={styles.salaryInputWrapper}>
              <Text style={styles.fieldLabel}>Mínimo (R$)</Text>
              <TextInput
                value={salaryMin}
                onChangeText={setSalaryMin}
                keyboardType="numeric"
                placeholder="Ex: 2500"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                editable={!salaryNegotiable}
              />
            </View>

            <View style={styles.salaryInputWrapper}>
              <Text style={styles.fieldLabel}>Máximo (R$)</Text>
              <TextInput
                value={salaryMax}
                onChangeText={setSalaryMax}
                keyboardType="numeric"
                placeholder="Ex: 4000"
                placeholderTextColor={COLORS.textMuted}
                style={styles.input}
                editable={!salaryNegotiable}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setSalaryNegotiable((prev) => !prev)}
            activeOpacity={0.75}
            style={styles.negotiableRow}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: salaryNegotiable }}
          >
            <Ionicons
              name={salaryNegotiable ? 'checkbox' : 'square-outline'}
              size={20}
              color={salaryNegotiable ? COLORS.orange : COLORS.textMuted}
            />
            <Text style={styles.negotiableLabel}>Salário negociável</Text>
          </TouchableOpacity>
        </View>

        {/* Regimes aceitos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Regimes aceitos</Text>
          <View style={styles.chipsRow}>
            {CONTRACT_TYPES.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={selectedContractTypes.includes(option.value)}
                onPress={() => toggleContractType(option.value)}
              />
            ))}
          </View>
        </View>

        {/* Nível profissional */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nível profissional</Text>
          <View style={styles.chipsRow}>
            {EXPERIENCE_LEVELS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={selectedLevel === option.value}
                onPress={() => setSelectedLevel(option.value)}
              />
            ))}
          </View>
        </View>

        {/* Aceita viagens */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aceita viagens a trabalho?</Text>
          <View style={styles.chipsRow}>
            <Chip
              label="Sim"
              selected={acceptsTravel === true}
              onPress={() => setAcceptsTravel(true)}
            />
            <Chip
              label="Não"
              selected={acceptsTravel === false}
              onPress={() => setAcceptsTravel(false)}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {!canAdvance && (
          <Text style={styles.footerHint}>
            Preencha todos os campos para continuar
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

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  fieldBlock: {
    marginBottom: SPACING.md,
  },

  fieldLabel: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
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

  chipLabel: {
    fontFamily: FONT.medium,
    fontSize: 16,
    color: COLORS.text2,
  },

  chipLabelSelected: {
    color: COLORS.orangeDark,
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

  dropdown: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    maxHeight: 180,
    overflow: 'hidden',
  },

  dropdownLoading: {
    paddingVertical: 12,
  },

  dropdownEmpty: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    padding: 12,
    textAlign: 'center',
  },

  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  dropdownItemText: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.text,
  },

  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: COLORS.orange,
    backgroundColor: COLORS.orangeLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  selectedText: {
    fontFamily: FONT.semiBold,
    fontSize: 15,
    color: COLORS.orangeDark,
    flex: 1,
  },

  salaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },

  salaryInputWrapper: {
    flex: 1,
  },

  negotiableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },

  negotiableLabel: {
    fontFamily: FONT.medium,
    fontSize: 15,
    color: COLORS.text2,
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