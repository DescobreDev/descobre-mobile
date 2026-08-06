import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

type Interest = { id: number; name: string; category: string };

export default function EditInterestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [interestsRes, profileRes] = await Promise.all([
          api.get(ENDPOINTS.onboarding.interests),
          api.get(ENDPOINTS.profile.get),
        ]);
        setInterests(interestsRes.data);
        setSelectedIds(
          (profileRes.data.interests ?? []).map((i: any) => i.interest.id),
        );
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar os interesses.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, Interest[]> = {};
    interests.forEach((i) => {
      if (!map[i.category]) map[i.category] = [];
      map[i.category].push(i);
    });
    return map;
  }, [interests]);

  const toggle = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    if (selectedIds.length < 1) {
      Alert.alert('Atenção', 'Selecione ao menos 1 interesse.');
      return;
    }

    setSaving(true);
    try {
      await api.patch(ENDPOINTS.profile.updateInterests, { interestIds: selectedIds });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar seus interesses. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
            <Text style={styles.headerGreeting}>Interesses</Text>
            <Text style={styles.headerSub}>{selectedIds.length} selecionado(s)</Text>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
        >
          {Object.entries(grouped).map(([category, items]) => (
            <View key={category} style={{ marginBottom: 22 }}>
              <Text style={styles.sectionTitle}>{category}</Text>
              <View style={styles.chipsWrap}>
                {items.map((item) => {
                  const active = selectedIds.includes(item.id);
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggle(item.id)}
                      activeOpacity={0.8}
                    >
                      {active && <Ionicons name="checkmark" size={14} color="#fff" style={{ marginRight: 4 }} />}
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving || loading}
          activeOpacity={0.85}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Salvar alterações</Text>}
        </TouchableOpacity>
      </View>
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

  scrollContent: { paddingHorizontal: 16, paddingTop: 18 },

  sectionTitle: {
    fontFamily: F.semiBold,
    fontSize: 15,
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
    marginLeft: 2,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  chipActive: { borderColor: C.orange, backgroundColor: C.orange },
  chipText: { fontFamily: F.medium, fontSize: 14, color: C.text2 },
  chipTextActive: { color: '#fff', fontFamily: F.semiBold },

  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border },
  saveBtn: { height: 52, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: F.semiBold, fontSize: 16, color: '#fff' },
});