import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { ENDPOINTS } from '../../../constants/endpoints';
import { SmartLocationInput } from '../../../components/onboarding/SmartLocationInput';

const C = {
  orange: '#f97316',
  orangeDark: '#c2410c',
  orangeLight: '#fff7ed',
  orangeBorder: 'rgba(249,115,22,0.35)',
  text: '#0d1829',
  text2: '#3d4a5c',
  textMuted: '#6b7684',
  surface: '#ffffff',
  surface2: '#f4f6f9',
  border: '#e4e9f0',
  red: '#dc2626',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const CONTRACT_TYPE_OPTIONS = [
  { value: 'CLT', label: 'CLT' },
  { value: 'PJ', label: 'PJ' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'TEMPORARIO', label: 'Temporário' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'ESTAGIARIO', label: 'Estagiário' },
  { value: 'JUNIOR', label: 'Júnior' },
  { value: 'PLENO', label: 'Pleno' },
  { value: 'SENIOR', label: 'Sênior' },
];

type SalaryRange = {
  id: string;
  label: string;
  min: string;
  max: string | null;
};

const SALARY_RANGES: SalaryRange[] = [
  { id: 'r1', label: 'Até R$ 1.500', min: '0', max: '1500' },
  { id: 'r2', label: 'R$ 1.500 - R$ 3.000', min: '1500', max: '3000' },
  { id: 'r3', label: 'R$ 3.000 - R$ 5.000', min: '3000', max: '5000' },
  { id: 'r4', label: 'R$ 5.000 - R$ 8.000', min: '5000', max: '8000' },
  { id: 'r5', label: 'Acima de R$ 8.000', min: '8000', max: null },
];

type SelectItem = { id: number; name: string };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
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
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function PickerModal({
  visible,
  title,
  items,
  loading,
  onSearch,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  items: SelectItem[];
  loading: boolean;
  onSearch: (text: string) => void;
  onSelect: (item: SelectItem) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalSafe}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={24} color={C.text} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor={C.textMuted}
            value={query}
            onChangeText={(t) => {
              setQuery(t);
              onSearch(t);
            }}
          />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 24 }} color={C.orange} />
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => onSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalItemText}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.modalEmpty}>Nenhum resultado encontrado.</Text>}
          />
        )}
      </View>
    </Modal>
  );
}

export default function EditPersonalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dados pessoais
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [acceptsTravel, setAcceptsTravel] = useState(false);

  // Preferências de vaga
  const [sector, setSector] = useState<SelectItem | null>(null);
  const [position, setPosition] = useState<SelectItem | null>(null);
  const [selectedSalaryRangeId, setSelectedSalaryRangeId] = useState<string | null>(null);
  const [salaryNegotiable, setSalaryNegotiable] = useState(false);
  const [contractTypes, setContractTypes] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<string | null>(null);

  // Picker de setor/cargo
  const [sectorModalVisible, setSectorModalVisible] = useState(false);
  const [positionModalVisible, setPositionModalVisible] = useState(false);
  const [sectorOptions, setSectorOptions] = useState<SelectItem[]>([]);
  const [positionOptions, setPositionOptions] = useState<SelectItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);

  const firstName = name ? name.split(' ')[0] : 'C';

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(ENDPOINTS.profile.get);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
        setCity(data.city ?? '');
        setState(data.state ?? '');
        setAcceptsTravel(!!data.acceptsTravel);

        setSector(data.desiredSector ? { id: data.desiredSector.id, name: data.desiredSector.name } : null);
        setPosition(data.desiredPosition ? { id: data.desiredPosition.id, name: data.desiredPosition.name } : null);

        const matchedRange = SALARY_RANGES.find(
          (r) =>
            r.min === String(data.desiredSalaryMin ?? '') &&
            (r.max === String(data.desiredSalaryMax ?? '') || (r.max === null && !data.desiredSalaryMax)),
        );
        setSelectedSalaryRangeId(matchedRange?.id ?? null);

        setSalaryNegotiable(!!data.salaryNegotiable);
        setContractTypes(data.contractTypes ?? []);
        setExperienceLevel(data.experienceLevel ?? null);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar seus dados.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const searchSectors = useCallback(async (text: string) => {
    setPickerLoading(true);
    try {
      const { data } = await api.get(ENDPOINTS.onboarding.sectors(text));
      setSectorOptions(data);
    } finally {
      setPickerLoading(false);
    }
  }, []);

  const searchPositions = useCallback(
    async (text: string) => {
      if (!sector) return;
      setPickerLoading(true);
      try {
        const { data } = await api.get(ENDPOINTS.onboarding.positions(sector.id, text));
        setPositionOptions(data);
      } finally {
        setPickerLoading(false);
      }
    },
    [sector],
  );

  const openSectorModal = () => {
    setSectorModalVisible(true);
    searchSectors('');
  };

  const openPositionModal = () => {
    if (!sector) {
      Alert.alert('Selecione o setor primeiro', 'Escolha uma área de atuação antes de definir o cargo.');
      return;
    }
    setPositionModalVisible(true);
    searchPositions('');
  };

  const toggleContractType = (value: string) => {
    setContractTypes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome não pode ficar em branco.');
      return;
    }

    const selectedRange = SALARY_RANGES.find((r) => r.id === selectedSalaryRangeId);

    setSaving(true);
    try {
      await Promise.all([
        api.patch(ENDPOINTS.profile.update, {
          name,
          phone: phone || undefined,
          city: city || undefined,
          state: state || undefined,
          acceptsTravel,
        }),
        api.patch(ENDPOINTS.profile.updatePreferences, {
          desiredSectorId: sector?.id,
          desiredPositionId: position?.id,
          salaryMin: selectedRange ? parseFloat(selectedRange.min) : undefined,
          salaryMax: selectedRange?.max ? parseFloat(selectedRange.max) : undefined,
          salaryNegotiable,
          contractTypes,
          experienceLevel: experienceLevel ?? undefined,
        }),
      ]);
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar suas informações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={C.orange} />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <View style={[styles.headerShadowWrap, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={[C.orange, C.orangeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerGreeting}>Editar perfil</Text>
            <Text style={styles.headerSub}>Dados pessoais e preferências</Text>
          </View>
          <View style={styles.avatarBtn}>
            <Text style={styles.avatarBtnText}>{firstName[0]}</Text>
          </View>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Dados pessoais */}
          <Text style={styles.sectionTitle}>Dados pessoais</Text>
          <View style={styles.card}>
            <Field label="Nome completo">
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome completo"
                placeholderTextColor={C.textMuted}
              />
            </Field>

            <Field label="Telefone">
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor={C.textMuted}
                keyboardType="phone-pad"
              />
            </Field>

            <Field label="Localização">
              <SmartLocationInput
                city={city}
                state={state}
                onSelect={(selectedCity, uf) => {
                  setCity(selectedCity);
                  setState(uf);
                }}
                placeholder="Ex: Itapetininga"
              />
            </Field>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Aceito viajar a trabalho</Text>
              <Switch
                value={acceptsTravel}
                onValueChange={setAcceptsTravel}
                trackColor={{ false: C.border, true: C.orangeLight }}
                thumbColor={acceptsTravel ? C.orange : C.textMuted}
                ios_backgroundColor={C.border}
              />
            </View>
          </View>

          {/* Preferências de vaga */}
          <Text style={styles.sectionTitle}>Vaga desejada</Text>
          <View style={styles.card}>
            <Field label="Área de atuação">
              <TouchableOpacity style={styles.selectInput} onPress={openSectorModal} activeOpacity={0.7}>
                <Text style={[styles.selectInputText, !sector && styles.selectInputPlaceholder]}>
                  {sector?.name ?? 'Selecionar setor'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={C.textMuted} />
              </TouchableOpacity>
            </Field>

            <Field label="Cargo desejado">
              <TouchableOpacity style={styles.selectInput} onPress={openPositionModal} activeOpacity={0.7}>
                <Text style={[styles.selectInputText, !position && styles.selectInputPlaceholder]}>
                  {position?.name ?? 'Selecionar cargo'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={C.textMuted} />
              </TouchableOpacity>
            </Field>

            <Field label="Faixa salarial desejada">
              <View style={styles.chipsWrap}>
                {SALARY_RANGES.map((range) => (
                  <Chip
                    key={range.id}
                    label={range.label}
                    active={selectedSalaryRangeId === range.id}
                    onPress={() => setSelectedSalaryRangeId(range.id)}
                  />
                ))}
              </View>
            </Field>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Salário é negociável</Text>
              <Switch
                value={salaryNegotiable}
                onValueChange={setSalaryNegotiable}
                trackColor={{ false: C.border, true: C.orangeLight }}
                thumbColor={salaryNegotiable ? C.orange : C.textMuted}
                ios_backgroundColor={C.border}
              />
            </View>

            <Field label="Regime de contratação">
              <View style={styles.chipsWrap}>
                {CONTRACT_TYPE_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={contractTypes.includes(opt.value)}
                    onPress={() => toggleContractType(opt.value)}
                  />
                ))}
              </View>
            </Field>

            <Field label="Nível de experiência">
              <View style={styles.chipsWrap}>
                {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    active={experienceLevel === opt.value}
                    onPress={() => setExperienceLevel(opt.value)}
                  />
                ))}
              </View>
            </Field>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar alterações</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <PickerModal
        visible={sectorModalVisible}
        title="Selecionar setor"
        items={sectorOptions}
        loading={pickerLoading}
        onSearch={searchSectors}
        onSelect={(item) => {
          setSector(item);
          setPosition(null);
          setSectorModalVisible(false);
        }}
        onClose={() => setSectorModalVisible(false)}
      />

      <PickerModal
        visible={positionModalVisible}
        title="Selecionar cargo"
        items={positionOptions}
        loading={pickerLoading}
        onSearch={searchPositions}
        onSelect={(item) => {
          setPosition(item);
          setPositionModalVisible(false);
        }}
        onClose={() => setPositionModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.surface2 },

  headerShadowWrap: {
    backgroundColor: C.orange,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 18,
  },
  headerGreeting: { fontFamily: F.bold, fontSize: 20, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarBtnText: { fontFamily: F.bold, fontSize: 16, color: '#fff' },

  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  sectionTitle: {
    fontFamily: F.semiBold,
    fontSize: 15,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 2,
  },
  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 22,
    gap: 2,
  },

  field: { marginBottom: 14 },
  fieldLabel: { fontFamily: F.medium, fontSize: 13.5, color: C.text2, marginBottom: 6 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    paddingHorizontal: 14,
    fontFamily: F.regular,
    fontSize: 15,
    color: C.text,
  },
  selectInput: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectInputText: { fontFamily: F.medium, fontSize: 15, color: C.text },
  selectInputPlaceholder: { color: C.textMuted, fontFamily: F.regular },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 6,
  },
  switchLabel: { fontFamily: F.medium, fontSize: 14.5, color: C.text },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { borderColor: C.orange, backgroundColor: C.orange },
  chipText: { fontFamily: F.medium, fontSize: 13.5, color: C.text2 },
  chipTextActive: { color: '#fff', fontFamily: F.semiBold },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  saveBtn: {
    height: 52,
    borderRadius: 14,
    backgroundColor: C.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { fontFamily: F.semiBold, fontSize: 16, color: '#fff' },

  modalSafe: { flex: 1, backgroundColor: C.surface2, paddingTop: 50 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  modalTitle: { fontFamily: F.semiBold, fontSize: 17, color: C.text },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 12,
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 15, color: C.text },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  modalItemText: { fontFamily: F.medium, fontSize: 15, color: C.text },
  modalEmpty: { textAlign: 'center', marginTop: 40, fontFamily: F.regular, color: C.textMuted },
});