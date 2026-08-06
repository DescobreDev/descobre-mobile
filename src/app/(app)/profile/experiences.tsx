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
  red: '#dc2626',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

type Experience = {
  id: number;
  company: string;
  position: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  current: boolean;
};

function formatPeriod(exp: Experience) {
  const fmt = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };
  const start = fmt(exp.startDate);
  const end = exp.current ? 'Atual' : exp.endDate ? fmt(exp.endDate) : '—';
  return `${start} - ${end}`;
}

export default function ExperiencesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const fetchExperiences = useCallback(async () => {
    try {
      const { data } = await api.get(ENDPOINTS.resume.get);
      setExperiences(data.experiences ?? []);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível carregar suas experiências.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchExperiences();
    }, [fetchExperiences]),
  );

  const handleDelete = (id: number, company: string) => {
    Alert.alert(
      'Remover experiência',
      `Deseja remover a experiência na empresa "${company}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(ENDPOINTS.resume.removeExperience(id));
              setExperiences((prev) => prev.filter((e) => e.id !== id));
            } catch (e) {
              Alert.alert('Erro', 'Não foi possível remover essa experiência.');
            }
          },
        },
      ],
    );
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
            <Text style={styles.headerGreeting}>Experiências</Text>
            <Text style={styles.headerSub}>{experiences.length} experiência(s)</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push('/(app)/profile/experience-form')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
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
          data={experiences}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: '/(app)/profile/experience-form',
                  params: { id: String(item.id) },
                })
              }
            >
              <View style={styles.cardIcon}>
                <Ionicons name="briefcase" size={18} color={C.orange} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.position}</Text>
                <Text style={styles.cardCompany} numberOfLines={1}>{item.company}</Text>
                <Text style={styles.cardPeriod}>{formatPeriod(item)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => handleDelete(item.id, item.company)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="trash-outline" size={18} color={C.red} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="briefcase-outline" size={36} color={C.text2} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma experiência cadastrada</Text>
              <Text style={styles.emptySub}>Adicione suas experiências profissionais para completar seu currículo.</Text>
              <TouchableOpacity
                style={styles.emptyAddBtn}
                onPress={() => router.push('/(app)/profile/experience-form')}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={18} color="#fff" />
                <Text style={styles.emptyAddBtnText}>Adicionar experiência</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 10,
  },
  cardIcon: {
    width: 42, height: 42, borderRadius: 12, backgroundColor: C.orangeLight,
    alignItems: 'center', justifyContent: 'center',
  },
  cardContent: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: F.semiBold, fontSize: 15.5, color: C.text },
  cardCompany: { fontFamily: F.regular, fontSize: 13.5, color: C.text2 },
  cardPeriod: { fontFamily: F.regular, fontSize: 12.5, color: C.textMuted, marginTop: 2 },
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
});