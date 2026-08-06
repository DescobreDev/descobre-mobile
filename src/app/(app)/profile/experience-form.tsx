import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { ENDPOINTS } from '../../../constants/endpoints';

const C = {
  orange: '#f97316',
  orangeDark: '#c2410c',
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// Formata "2023-01" <-> exibição, mantendo o formato que o backend espera (YYYY-MM)
function isValidYearMonth(value: string) {
  return /^\d{4}-\d{2}$/.test(value);
}

export default function ExperienceFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(''); // formato YYYY-MM
  const [endDate, setEndDate] = useState('');
  const [current, setCurrent] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    (async () => {
      try {
        const { data } = await api.get(ENDPOINTS.resume.get);
        const exp = data.experiences.find((e: any) => String(e.id) === id);
        if (!exp) {
          Alert.alert('Erro', 'Experiência não encontrada.');
          router.back();
          return;
        }
        setCompany(exp.company);
        setPosition(exp.position);
        setDescription(exp.description ?? '');
        setStartDate(exp.startDate.slice(0, 7)); // "2023-01-01T..." -> "2023-01"
        setEndDate(exp.endDate ? exp.endDate.slice(0, 7) : '');
        setCurrent(exp.current);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar essa experiência.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSave = async () => {
    if (!company.trim() || !position.trim()) {
      Alert.alert('Atenção', 'Preencha empresa e cargo.');
      return;
    }
    if (!isValidYearMonth(startDate)) {
      Alert.alert('Atenção', 'Informe a data de início no formato AAAA-MM (ex: 2023-01).');
      return;
    }
    if (!current && endDate && !isValidYearMonth(endDate)) {
      Alert.alert('Atenção', 'Informe a data de término no formato AAAA-MM (ex: 2024-06).');
      return;
    }

    const payload = {
      company,
      position,
      description: description || undefined,
      startDate,
      endDate: current ? undefined : endDate || undefined,
      current,
    };

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(ENDPOINTS.resume.updateExperience(Number(id)), payload);
      } else {
        await api.post(ENDPOINTS.resume.addExperience, payload);
      }
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar essa experiência. Tente novamente.');
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
            <Text style={styles.headerGreeting}>{isEditing ? 'Editar experiência' : 'Nova experiência'}</Text>
            <Text style={styles.headerSub}>Conte sobre essa vivência profissional</Text>
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
          <View style={styles.card}>
            <Field label="Empresa">
              <TextInput
                style={styles.input}
                value={company}
                onChangeText={setCompany}
                placeholder="Nome da empresa"
                placeholderTextColor={C.textMuted}
              />
            </Field>

            <Field label="Cargo">
              <TextInput
                style={styles.input}
                value={position}
                onChangeText={setPosition}
                placeholder="Seu cargo na empresa"
                placeholderTextColor={C.textMuted}
              />
            </Field>

            <Field label="Descrição (opcional)">
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Principais atividades e conquistas"
                placeholderTextColor={C.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Field>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Início (AAAA-MM)</Text>
                <TextInput
                  style={styles.input}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="2023-01"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={7}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>Término (AAAA-MM)</Text>
                <TextInput
                  style={[styles.input, current && styles.inputDisabled]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="2024-06"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numbers-and-punctuation"
                  maxLength={7}
                  editable={!current}
                />
              </View>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Este é meu emprego atual</Text>
              <Switch
                value={current}
                onValueChange={(v) => {
                  setCurrent(v);
                  if (v) setEndDate('');
                }}
                trackColor={{ false: C.border, true: '#fff7ed' }}
                thumbColor={current ? C.orange : C.textMuted}
                ios_backgroundColor={C.border}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isEditing ? 'Salvar alterações' : 'Adicionar experiência'}</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 18 },
  headerGreeting: { fontFamily: F.bold, fontSize: 20, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 13, color: 'rgba(255,255,255,0.92)', marginTop: 2 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  card: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
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
  inputDisabled: { opacity: 0.5 },
  textArea: { height: 100, paddingTop: 12 },

  row: { flexDirection: 'row', gap: 10 },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: { fontFamily: F.medium, fontSize: 14.5, color: C.text },

  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn: { height: 52, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: F.semiBold, fontSize: 16, color: '#fff' },
});