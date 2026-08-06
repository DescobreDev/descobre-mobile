import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
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
  orangeLight: '#fff7ed',
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

const MIN_PRIORITIES = 3;

type Priority = { id: number; name: string };

export default function PrioritiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  // ordem em que o usuário tocou — index 0 = 1ª prioridade
  const [orderedIds, setOrderedIds] = useState<number[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [prioritiesRes, profileRes] = await Promise.all([
          api.get(ENDPOINTS.onboarding.priorities),
          api.get(ENDPOINTS.profile.get),
        ]);
        setPriorities(prioritiesRes.data);

        const current: { priority: { id: number }; order: number }[] = profileRes.data.priorities ?? [];
        const sorted = [...current].sort((a, b) => a.order - b.order).map((p) => p.priority.id);
        setOrderedIds(sorted);
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível carregar as prioridades.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggle = (id: number) => {
    setOrderedIds((prev) => {
      if (prev.includes(id)) {
        // remove e os que vinham depois "sobem" automaticamente (é só filtrar)
        return prev.filter((v) => v !== id);
      }
      return [...prev, id];
    });
  };

  const handleSave = async () => {
    if (orderedIds.length < MIN_PRIORITIES) {
      Alert.alert('Atenção', `Selecione ao menos ${MIN_PRIORITIES} prioridades, na ordem de importância.`);
      return;
    }

    setSaving(true);
    try {
      await api.patch(ENDPOINTS.profile.updatePriorities, {
        priorities: orderedIds.map((priorityId, idx) => ({ priorityId, order: idx + 1 })),
      });
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar suas prioridades. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const remaining = Math.max(0, MIN_PRIORITIES - orderedIds.length);

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
            <Text style={styles.headerGreeting}>Prioridades profissionais</Text>
            <Text style={styles.headerSub}>
              {orderedIds.length > 0
                ? `${orderedIds.length} selecionada(s)`
                : 'Toque na ordem de importância'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      ) : (
        <>
          <View style={styles.hintBanner}>
            <Ionicons name="information-circle-outline" size={18} color={C.orangeDark} />
            <Text style={styles.hintText}>
              Toque nas prioridades na ordem de importância para você. A primeira que tocar vira a nº 1.
              Toque novamente para remover.
            </Text>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: 32 + insets.bottom }]}
            showsVerticalScrollIndicator={false}
          >
            {priorities.map((item) => {
              const rank = orderedIds.indexOf(item.id);
              const selected = rank !== -1;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, selected && styles.cardSelected]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.rankBadge, selected && styles.rankBadgeActive]}>
                    {selected ? (
                      <Text style={styles.rankBadgeText}>{rank + 1}</Text>
                    ) : (
                      <Ionicons name="ellipse-outline" size={16} color={C.textMuted} />
                    )}
                  </View>
                  <Text style={[styles.cardText, selected && styles.cardTextSelected]}>{item.name}</Text>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={C.orange} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        {remaining > 0 && !loading && (
          <Text style={styles.footerHint}>
            Selecione mais {remaining} prioridade{remaining > 1 ? 's' : ''} para continuar.
          </Text>
        )}
        <TouchableOpacity
          style={[styles.saveBtn, (saving || orderedIds.length < MIN_PRIORITIES) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={saving || loading || orderedIds.length < MIN_PRIORITIES}
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

  hintBanner: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: C.orangeLight,
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.25)',
  },
  hintText: { flex: 1, fontFamily: F.regular, fontSize: 13, color: C.orangeDark, lineHeight: 18 },

  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,
  },
  cardSelected: { borderColor: C.orange, backgroundColor: C.orangeLight },

  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.surface2,
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeActive: { backgroundColor: C.orange, borderColor: C.orange },
  rankBadgeText: { fontFamily: F.bold, fontSize: 13, color: '#fff' },

  cardText: { flex: 1, fontFamily: F.medium, fontSize: 15, color: C.text },
  cardTextSelected: { fontFamily: F.semiBold, color: C.orangeDark },

  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.border,
    gap: 8,
  },
  footerHint: { fontFamily: F.regular, fontSize: 12.5, color: C.textMuted, textAlign: 'center' },
  saveBtn: { height: 52, borderRadius: 14, backgroundColor: C.orange, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: F.semiBold, fontSize: 16, color: '#fff' },
});