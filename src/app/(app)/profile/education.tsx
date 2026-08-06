import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { ENDPOINTS } from '../../../constants/endpoints';

const C = {
  orange: '#f97316',
  orangeDark: '#c2410c',
  orangeLight: '#fff7ed',
  text: '#0d1829',
  text2: '#3d4a5c',
  textMuted: '#6b7684',
  surface: '#ffffff',
  surface2: '#f4f6f9',
  border: '#e4e9f0',
  red: '#dc2626',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const SKILL_LEVELS = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIARIO', label: 'Intermediário' },
  { value: 'AVANCADO', label: 'Avançado' },
];

type Skill = { id: number; name: string; level: string };

function levelLabel(level: string) {
  return SKILL_LEVELS.find((l) => l.value === level)?.label ?? level;
}

export default function SkillsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState('BASICO');
  const [saving, setSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.resume.get);
      setSkills(data.skills ?? []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar suas habilidades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchSkills();
    }, [fetchSkills]),
  );

  const openModal = () => {
    setNewName('');
    setNewLevel('BASICO');
    setModalVisible(true);
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      Alert.alert('Atenção', 'Informe o nome da habilidade.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.post(ENDPOINTS.resume.addSkill, { name: newName.trim(), level: newLevel });
      setSkills((prev) => [...prev, data]);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível adicionar essa habilidade.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert('Remover habilidade', `Deseja remover "${name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(ENDPOINTS.resume.removeSkill(id));
            setSkills((prev) => prev.filter((s) => s.id !== id));
          } catch (e) {
            Alert.alert('Erro', 'Não foi possível remover essa habilidade.');
          }
        },
      },
    ]);
  };

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
            <Text style={styles.headerGreeting}>Habilidades</Text>
            <Text style={styles.headerSub}>{skills.length} habilidade(s)</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name="ribbon" size={18} color={C.orange} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardLevel}>{levelLabel(item.level)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={C.red} />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="ribbon-outline" size={36} color={C.text2} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma habilidade cadastrada</Text>
              <Text style={styles.emptySub}>Adicione as habilidades que você domina.</Text>
              <TouchableOpacity style={styles.emptyAddBtn} onPress={openModal} activeOpacity={0.85}>
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyAddBtnText}>Adicionar habilidade</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalCard, { paddingBottom: 16 + insets.bottom }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nova habilidade</Text>

            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Ex: Excel, Word, Inglês técnico"
              placeholderTextColor={C.textMuted}
              autoFocus
            />

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Nível</Text>
            <View style={styles.chipsWrap}>
              {SKILL_LEVELS.map((lvl) => (
                <TouchableOpacity
                  key={lvl.value}
                  style={[styles.chip, newLevel === lvl.value && styles.chipActive]}
                  onPress={() => setNewLevel(lvl.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, newLevel === lvl.value && styles.chipTextActive]}>{lvl.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)} activeOpacity={0.8}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
                onPress={handleAdd}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.confirmBtnText}>Adicionar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface2 },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  addBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.4)',
  },

  listContent: { paddingHorizontal: 16, paddingTop: 16 },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10,
  },
  cardIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.orangeLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: F.semiBold, fontSize: 15.5, color: C.text },
  cardLevel: { fontFamily: F.regular, fontSize: 13, color: C.textMuted },
  deleteBtn: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: C.redLight,
    alignItems: 'center', justifyContent: 'center',
  },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 6 },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emptyTitle: { fontFamily: F.semiBold, fontSize: 18, color: C.text },
  emptySub: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, textAlign: 'center', lineHeight: 21 },
  emptyAddBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16,
    paddingHorizontal: 20, height: 48, borderRadius: 99, backgroundColor: C.orange,
  },
  emptyAddBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: '#fff' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(13,24,41,0.4)' },
  modalCard: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 99, backgroundColor: C.border,
    alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontFamily: F.bold, fontSize: 18, color: C.text, marginBottom: 16 },
  fieldLabel: { fontFamily: F.medium, fontSize: 13.5, color: C.text2, marginBottom: 6 },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.surface2, paddingHorizontal: 14, fontFamily: F.regular, fontSize: 15, color: C.text,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, height: 38, borderRadius: 99, borderWidth: 1.5,
    borderColor: C.border, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderColor: C.orange, backgroundColor: C.orange },
  chipText: { fontFamily: F.medium, fontSize: 13.5, color: C.text2 },
  chipTextActive: { color: '#fff', fontFamily: F.semiBold },

  modalActions: { flexDirection: 'row', gap: 10, marginTop: 22 },
  cancelBtn: {
    flex: 1, height: 50, borderRadius: 14, borderWidth: 1.5, borderColor: C.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: F.semiBold, fontSize: 15, color: C.text2 },
  confirmBtn: { flex: 1.5, height: 50, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontFamily: F.semiBold, fontSize: 15, color: '#fff' },
});