import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useJobFilterOptions } from '../../hooks/useJobFilterOptions';
import { createLocalSearch, SearchSelect } from '../shared/SearchSelect';
import { SmartLocationInput } from '../onboarding/SmartLocationInput';

import {
  AffirmativeType,
  ExperienceLevel,
  JobFilters,
  JobType,
} from '../../types/jobs';

const C = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  orangeBorder: 'rgba(249,115,22,0.25)',
  text: '#0d1829',
  text2: '#5a6a82',
  textMuted: '#aab4c4',
  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#eef1f6',
  green: '#10b981',
  greenLight: '#ecfdf5',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const JOB_TYPE_OPTIONS: { label: string; value: JobType }[] = [
  { label: 'Efetivo', value: 'STANDARD' },
  { label: 'Estágio', value: 'INTERNSHIP' },
  { label: 'Trainee', value: 'TRAINEE' },
];

const EXPERIENCE_OPTIONS: { label: string; value: ExperienceLevel }[] = [
  { label: 'Estágio', value: 'ESTAGIO' },
  { label: 'Júnior', value: 'JUNIOR' },
  { label: 'Pleno', value: 'PLENO' },
  { label: 'Sênior', value: 'SENIOR' },
  { label: 'Especialista', value: 'ESPECIALISTA' },
];

const AFFIRMATIVE_OPTIONS: { label: string; value: AffirmativeType }[] = [
  { label: 'PCD', value: 'PCD' },
  { label: 'Mulheres', value: 'WOMEN' },
  { label: '50+', value: 'FIFTY_PLUS' },
  { label: 'LGBTQIAPN+', value: 'LGBTQIAPN' },
];

export interface CandidateLocation {
  city?: string | null;
  state?: string | null;
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApply: (filters: Partial<JobFilters>) => void;
  onReset: () => void;
  candidateLocation?: CandidateLocation;
}

// Estado local do formulário — só é confirmado no hook (useJobs) quando o usuário
// toca em "Aplicar filtros". Evita refetch a cada toque dentro do modal.
type DraftFilters = Pick<
  JobFilters,
  | 'sectorId'
  | 'positionId'
  | 'jobType'
  | 'experienceLevel'
  | 'affirmative'
  | 'benefitIds'
  | 'salaryMin'
  | 'salaryMax'
  | 'city'
  | 'state'
>;

function toDraft(filters: JobFilters): DraftFilters {
  return {
    sectorId: filters.sectorId,
    positionId: filters.positionId,
    jobType: filters.jobType,
    experienceLevel: filters.experienceLevel,
    affirmative: filters.affirmative,
    benefitIds: filters.benefitIds,
    salaryMin: filters.salaryMin,
    salaryMax: filters.salaryMax,
    city: filters.city,
    state: filters.state,
  };
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SectionTitle({ icon, title }: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={C.orangeDark} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

export function AdvancedFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
  candidateLocation,
}: AdvancedFiltersModalProps) {
  const insets = useSafeAreaInsets();
  const { sectors, benefits, positions, isLoadingSectors, isLoadingBenefits, isLoadingPositions, loadPositions } =
    useJobFilterOptions();

  const [draft, setDraft] = useState<DraftFilters>(() => toDraft(filters));
  const [usingProfileLocation, setUsingProfileLocation] = useState(true);

  // Sempre que o modal abre, sincroniza com os filtros já aplicados (e, se a região
  // estiver vazia, pré-preenche automaticamente com a cidade/estado do perfil).
  useEffect(() => {
    if (!visible) return;

    const next = toDraft(filters);
    const hasSavedLocation = !!candidateLocation?.city || !!candidateLocation?.state;
    const noRegionSetYet = !filters.city && !filters.state;

    if (hasSavedLocation && noRegionSetYet) {
      next.city = candidateLocation?.city ?? null;
      next.state = candidateLocation?.state ?? null;
      setUsingProfileLocation(true);
    } else {
      setUsingProfileLocation(
        !!candidateLocation &&
        next.city === (candidateLocation.city ?? null) &&
        next.state === (candidateLocation.state ?? null),
      );
    }

    setDraft(next);

    if (next.sectorId) loadPositions(next.sectorId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const patch = (partial: Partial<DraftFilters>) => setDraft((prev) => ({ ...prev, ...partial }));

  const toggleBenefit = (id: number) => {
    setDraft((prev) => ({
      ...prev,
      benefitIds: prev.benefitIds.includes(id)
        ? prev.benefitIds.filter((b) => b !== id)
        : [...prev.benefitIds, id],
    }));
  };

  const handleSectorChange = (sectorId: number | null) => {
    patch({ sectorId, positionId: null });
    loadPositions(sectorId);
  };

  const handleUseProfileLocation = () => {
    setUsingProfileLocation(true);
    patch({ city: candidateLocation?.city ?? null, state: candidateLocation?.state ?? null });
  };

  const handleClearLocation = () => {
    setUsingProfileLocation(false);
    patch({ city: null, state: null });
  };

  const selectedSectorOption = useMemo(
    () => sectors.find((s) => s.id === draft.sectorId) ?? null,
    [sectors, draft.sectorId],
  );
  const selectedPositionOption = useMemo(
    () => positions.find((p) => p.id === draft.positionId) ?? null,
    [positions, draft.positionId],
  );

  // Setores e cargos já vêm carregados em memória (useJobFilterOptions), então o
  // "select2" filtra localmente em vez de bater na API a cada tecla digitada.
  const searchSectors = useMemo(() => createLocalSearch(sectors), [sectors]);
  const searchPositions = useMemo(() => createLocalSearch(positions), [positions]);

  const draftActiveCount = useMemo(() => {
    let count = 0;
    if (draft.sectorId) count++;
    if (draft.positionId) count++;
    if (draft.jobType) count++;
    if (draft.experienceLevel) count++;
    if (draft.affirmative) count++;
    if (draft.benefitIds.length > 0) count++;
    if (draft.salaryMin != null || draft.salaryMax != null) count++;
    if (draft.city || draft.state) count++;
    return count;
  }, [draft]);

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft({
      sectorId: null,
      positionId: null,
      jobType: null,
      experienceLevel: null,
      affirmative: null,
      benefitIds: [],
      salaryMin: null,
      salaryMax: null,
      city: null,
      state: null,
    });
    setUsingProfileLocation(false);
    onReset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtros avançados</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={C.text2} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            {/* Região */}
            <View style={styles.section}>
              <SectionTitle icon="location-outline" title="Região" />
              {candidateLocation?.city || candidateLocation?.state ? (
                <TouchableOpacity
                  onPress={usingProfileLocation ? handleClearLocation : handleUseProfileLocation}
                  style={[styles.autoLocationCard, usingProfileLocation && styles.autoLocationCardActive]}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={usingProfileLocation ? 'checkmark-circle' : 'navigate-outline'}
                    size={20}
                    color={usingProfileLocation ? C.green : C.textMuted}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.autoLocationTitle}>
                      {usingProfileLocation ? 'Usando sua região do perfil' : 'Usar região do meu perfil'}
                    </Text>
                    <Text style={styles.autoLocationSub}>
                      {[candidateLocation?.city, candidateLocation?.state].filter(Boolean).join(', ') || 'Não informado'}
                    </Text>
                  </View>
                  {usingProfileLocation && <Text style={styles.autoLocationClear}>Remover</Text>}
                </TouchableOpacity>
              ) : null}

              <SmartLocationInput
                city={draft.city ?? ''}
                state={draft.state ?? ''}
                onSelect={(city, uf) => {
                  setUsingProfileLocation(false);
                  patch({ city, state: uf });
                }}
              />
            </View>

            {/* Faixa salarial */}
            <View style={styles.section}>
              <SectionTitle icon="cash-outline" title="Faixa salarial" />
              <View style={styles.row}>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Mínimo (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={C.textMuted}
                    keyboardType="numeric"
                    value={draft.salaryMin != null ? String(draft.salaryMin) : ''}
                    onChangeText={(v) => patch({ salaryMin: v ? Number(v.replace(/\D/g, '')) : null })}
                  />
                </View>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Máximo (R$)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Sem limite"
                    placeholderTextColor={C.textMuted}
                    keyboardType="numeric"
                    value={draft.salaryMax != null ? String(draft.salaryMax) : ''}
                    onChangeText={(v) => patch({ salaryMax: v ? Number(v.replace(/\D/g, '')) : null })}
                  />
                </View>
              </View>
            </View>

            {/* Tipo de vaga */}
            <View style={styles.section}>
              <SectionTitle icon="briefcase-outline" title="Tipo de vaga" />
              <View style={styles.chipsWrap}>
                {JOB_TYPE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={draft.jobType === opt.value}
                    onPress={() => patch({ jobType: draft.jobType === opt.value ? null : opt.value })}
                  />
                ))}
              </View>
            </View>

            {/* Nível de experiência */}
            <View style={styles.section}>
              <SectionTitle icon="trending-up-outline" title="Nível de experiência" />
              <View style={styles.chipsWrap}>
                {EXPERIENCE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={draft.experienceLevel === opt.value}
                    onPress={() =>
                      patch({ experienceLevel: draft.experienceLevel === opt.value ? null : opt.value })
                    }
                  />
                ))}
              </View>
            </View>

            {/* Setor e cargo */}
            <View style={[styles.section, { gap: 0 }]}>
              <SectionTitle icon="grid-outline" title="Área e cargo" />
              <SearchSelect
                label="Setor"
                placeholder={isLoadingSectors ? 'Carregando setores...' : 'Buscar setor...'}
                value={selectedSectorOption}
                onSelect={(item) => handleSectorChange(item?.id ?? null)}
                fetchOptions={searchSectors}
                disabled={isLoadingSectors}
              />
              <SearchSelect
                label="Cargo"
                placeholder="Buscar cargo..."
                value={selectedPositionOption}
                onSelect={(item) => patch({ positionId: item?.id ?? null })}
                fetchOptions={searchPositions}
                disabled={!draft.sectorId || isLoadingPositions}
                disabledHint={!draft.sectorId ? 'Selecione um setor primeiro' : 'Carregando cargos...'}
              />
            </View>

            {/* Ação afirmativa */}
            <View style={styles.section}>
              <SectionTitle icon="people-outline" title="Vagas afirmativas" />
              <View style={styles.chipsWrap}>
                {AFFIRMATIVE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={draft.affirmative === opt.value}
                    onPress={() => patch({ affirmative: draft.affirmative === opt.value ? null : opt.value })}
                  />
                ))}
              </View>
            </View>

            {/* Benefícios */}
            <View style={[styles.section, { marginBottom: 0 }]}>
              <SectionTitle icon="gift-outline" title="Benefícios" />
              {isLoadingBenefits ? (
                <ActivityIndicator color={C.orange} style={{ marginVertical: 12 }} />
              ) : (
                <View style={styles.chipsWrap}>
                  {benefits.map((b) => (
                    <Chip
                      key={b.id}
                      label={b.name}
                      active={draft.benefitIds.includes(b.id)}
                      onPress={() => toggleBenefit(b.id)}
                    />
                  ))}
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity onPress={handleReset} style={styles.clearBtn} activeOpacity={0.8}>
              <Text style={styles.clearBtnText}>Limpar tudo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleApply} style={styles.applyBtn} activeOpacity={0.9}>
              <Text style={styles.applyBtnText}>
                Aplicar filtros{draftActiveCount > 0 ? ` (${draftActiveCount})` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(13,24,41,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: '90%',
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: { fontFamily: F.bold, fontSize: 18, color: C.text },

  content: { padding: 20, gap: 22 },
  section: { gap: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  sectionTitle: { fontFamily: F.semiBold, fontSize: 14.5, color: C.text },

  row: { flexDirection: 'row', gap: 10 },
  inputWrap: { gap: 6 },
  inputLabel: { fontFamily: F.medium, fontSize: 12, color: C.text2 },
  input: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    fontFamily: F.regular,
    fontSize: 14,
    color: C.text,
    backgroundColor: C.surface2,
  },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive: { borderColor: C.orange, backgroundColor: C.orangeLight },
  chipText: { fontFamily: F.medium, fontSize: 13, color: C.text2 },
  chipTextActive: { color: C.orangeDark, fontFamily: F.semiBold },

  autoLocationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 12,
  },
  autoLocationCardActive: { borderColor: C.green, backgroundColor: C.greenLight },
  autoLocationTitle: { fontFamily: F.semiBold, fontSize: 13.5, color: C.text },
  autoLocationSub: { fontFamily: F.regular, fontSize: 12.5, color: C.text2, marginTop: 1 },
  autoLocationClear: { fontFamily: F.medium, fontSize: 12, color: C.text2 },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  clearBtn: {
    paddingHorizontal: 18,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearBtnText: { fontFamily: F.semiBold, fontSize: 14, color: C.text2 },
  applyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: '#fff' },
});