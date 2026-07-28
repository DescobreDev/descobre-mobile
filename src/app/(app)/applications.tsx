import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';

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
  green: '#059669',
  greenLight: '#ecfdf5',
  indigo: '#4f46e5',
  indigoLight: '#eef2ff',
  yellow: '#d97706',
  yellowLight: '#fffbeb',
  red: '#dc2626',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const MIN_TOUCH_TARGET = 48;

type ApplicationStatus =
  | 'RECEBIDA'
  | 'ANALISE'
  | 'ENTREVISTA'
  | 'APROVADO'
  | 'REPROVADO'
  | 'DESISTIU';

type Application = {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  city?: string;
  state?: string;
  appliedAt: string;
  status: ApplicationStatus;
};

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; icon: React.ComponentProps<typeof Ionicons>['name'] }
> = {
  RECEBIDA: { label: 'Enviada', bg: C.surface2, text: C.textMuted, icon: 'time-outline' },
  ANALISE: { label: 'Em análise', bg: C.yellowLight, text: C.yellow, icon: 'hourglass-outline' },
  ENTREVISTA: { label: 'Entrevista', bg: C.orangeLight, text: C.orangeDark, icon: 'videocam-outline' },
  APROVADO: { label: 'Aprovado', bg: C.greenLight, text: C.green, icon: 'checkmark-circle-outline' },
  REPROVADO: { label: 'Não selecionado', bg: C.redLight, text: C.red, icon: 'close-circle-outline' },
  DESISTIU: { label: 'Desistiu', bg: C.surface2, text: C.textMuted, icon: 'exit-outline' },
};

const STATUS_FILTERS: { label: string; value: ApplicationStatus | null }[] = [
  { label: 'Todas', value: null },
  { label: 'Em análise', value: 'ANALISE' },
  { label: 'Entrevista', value: 'ENTREVISTA' },
  { label: 'Aprovado', value: 'APROVADO' },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `${days} dias atrás`;
  if (days < 30) return `${Math.floor(days / 7)} sem. atrás`;
  return `${Math.floor(days / 30)} meses atrás`;
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function CompanyAvatar({ name, size = 46 }: { name: string; size?: number }) {
  const colors = ['#c2410c', '#4338ca', '#059669', '#be185d', '#b45309', '#1d4ed8'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <View
      style={[
        styles.companyAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 3.4,
          backgroundColor: colors[colorIndex] + '1c',
          borderColor: colors[colorIndex] + '40',
        },
      ]}
    >
      <Text style={[styles.companyAvatarText, { color: colors[colorIndex], fontSize: size * 0.34 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.text} />
      <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
    >
      {active && <Ionicons name="checkmark" size={15} color="#fff" style={{ marginRight: 4 }} />}
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SummaryCard({
  count,
  label,
  color,
  icon,
}: {
  count: number;
  label: string;
  color: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  return (
    <View style={[styles.summaryCard, { borderTopColor: color }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function ApplicationCard({ item, onPress }: { item: Application; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={onPress}>
      <CompanyAvatar name={item.companyName} size={48} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.jobTitle}</Text>
        <Text style={styles.cardCompany} numberOfLines={1}>{item.companyName}</Text>
        <View style={styles.cardMeta}>
          <StatusBadge status={item.status} />
          <Text style={styles.cardTime}>{timeAgo(item.appliedAt)}</Text>
        </View>
      </View>
      <View style={styles.chevronCircle}>
        <Ionicons name="chevron-forward" size={16} color={C.text2} />
      </View>
    </TouchableOpacity>
  );
}

// Skeletons: evita "tela em branco + spinner central" durante o carregamento
// inicial, igual ao padrão adotado na Home.
function SkeletonSummary() {
  return (
    <View style={styles.summaryRow}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={[styles.summaryCard, { borderTopColor: C.border, gap: 6 }]}>
          <View style={[styles.skeletonBox, { width: 18, height: 18, borderRadius: 5 }]} />
          <View style={[styles.skeletonBox, { width: 28, height: 18, borderRadius: 5 }]} />
          <View style={[styles.skeletonBox, { width: 46, height: 10, borderRadius: 4 }]} />
        </View>
      ))}
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonBox, { width: 48, height: 48, borderRadius: 14 }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonBox, { height: 15, width: '65%' }]} />
        <View style={[styles.skeletonBox, { height: 13, width: '40%' }]} />
        <View style={[styles.skeletonBox, { height: 20, width: '35%', borderRadius: 99 }]} />
      </View>
    </View>
  );
}

export default function ApplicationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setError(null);
      const { data } = await api.get('/candidate/applications', {
        params: activeFilter ? { status: activeFilter } : {},
      });
      setApplications(data.data);
    } catch (e) {
      setError('Não foi possível carregar suas candidaturas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    setLoading(true);
    fetchApplications();
  }, [fetchApplications]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, [fetchApplications]);

  const goToApplication = (id: number) => router.push(`/(app)/job/applicationProcess/${id}`);

  const inReview = applications.filter((a) => a.status === 'ANALISE').length;
  const interviews = applications.filter((a) => a.status === 'ENTREVISTA').length;
  const approved = applications.filter((a) => a.status === 'APROVADO').length;

  const ListHeader = (
    <View>
      {loading ? (
        <SkeletonSummary />
      ) : (
        <View style={styles.summaryRow}>
          <SummaryCard count={applications.length} label="Total" color={C.text2} icon="layers-outline" />
          <SummaryCard count={inReview} label="Em análise" color={C.yellow} icon="hourglass-outline" />
          <SummaryCard count={interviews} label="Entrevistas" color={C.orangeDark} icon="videocam-outline" />
          <SummaryCard count={approved} label="Aprovado" color={C.green} icon="checkmark-circle-outline" />
        </View>
      )}

      <View style={styles.filtersRow}>
        {STATUS_FILTERS.map((f) => (
          <FilterChip
            key={f.label}
            label={f.label}
            active={activeFilter === f.value}
            onPress={() => setActiveFilter(f.value)}
          />
        ))}
      </View>

      {!loading && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter ? STATUS_CONFIG[activeFilter].label : 'Todas as candidaturas'}
          </Text>
          <View style={styles.jobCountPill}>
            <Text style={styles.jobCountText}>{applications.length} vagas</Text>
          </View>
        </View>
      )}
    </View>
  );

  // Estado de erro dedicado (sem dado nenhum ainda) — separado do "lista vazia",
  // igual à Home: o usuário precisa saber se é "sem resultado" ou "algo quebrou".
  if (error && !loading && applications.length === 0) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.headerShadowWrap}>
          <LinearGradient
            colors={[C.orange, C.orangeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Candidaturas</Text>
          </LinearGradient>
        </View>
        <View style={styles.errorState}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={36} color={C.red} />
          </View>
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity onPress={fetchApplications} style={styles.retryBtn} activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.headerShadowWrap}>
        <LinearGradient
          colors={[C.orange, C.orangeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.headerTitle}>Candidaturas</Text>
            <Text style={styles.headerSub}>Acompanhe o status das suas vagas</Text>
          </View>
        </LinearGradient>
      </View>

      <FlatList
        style={styles.list}
        data={loading ? [] : applications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <ApplicationCard item={item} onPress={() => goToApplication(item.id)} />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} colors={[C.orange]} />
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ gap: 10, paddingHorizontal: 16, paddingTop: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="document-text-outline" size={36} color={C.text2} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma candidatura aqui</Text>
              <Text style={styles.emptySub}>
                {activeFilter
                  ? 'Não há candidaturas com esse status. Tente outro filtro.'
                  : 'Você ainda não se candidatou a nenhuma vaga.'}
              </Text>
              {activeFilter && (
                <TouchableOpacity
                  onPress={() => setActiveFilter(null)}
                  style={styles.clearFiltersBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.clearFiltersBtnText}>Limpar filtro</Text>
                </TouchableOpacity>
              )}
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface2 },

  headerShadowWrap: {
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerTitle: { fontFamily: F.bold, fontSize: 22, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 2 },

  list: { flex: 1 },
  listContent: { paddingBottom: 24 },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 14,
    borderTopWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 3,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCount: { fontFamily: F.bold, fontSize: 19, marginTop: 2 },
  summaryLabel: { fontFamily: F.medium, fontSize: 11, color: C.textMuted, textAlign: 'center' },

  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: MIN_TOUCH_TARGET - 6,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  filterChipActive: { borderColor: C.orange, backgroundColor: C.orange },
  filterChipText: { fontFamily: F.medium, fontSize: 14, color: C.text2 },
  filterChipTextActive: { color: '#fff', fontFamily: F.semiBold },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: { fontFamily: F.bold, fontSize: 18, color: C.text },
  jobCountPill: {
    backgroundColor: C.surface,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  jobCountText: { fontFamily: F.semiBold, fontSize: 12, color: C.text2 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    minHeight: MIN_TOUCH_TARGET + 24,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  cardContent: { flex: 1, gap: 4 },
  cardTitle: { fontFamily: F.semiBold, fontSize: 15.5, color: C.text },
  cardCompany: { fontFamily: F.regular, fontSize: 13.5, color: C.text2 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  cardTime: { fontFamily: F.regular, fontSize: 12, color: C.textMuted },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusBadgeText: { fontFamily: F.medium, fontSize: 12.5 },

  companyAvatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  companyAvatarText: { fontFamily: F.bold },

  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 6 },
  emptyIconCircle: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emptyTitle: { fontFamily: F.semiBold, fontSize: 18, color: C.text },
  emptySub: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, textAlign: 'center', lineHeight: 21 },
  clearFiltersBtn: {
    marginTop: 10, paddingHorizontal: 22, height: MIN_TOUCH_TARGET, justifyContent: 'center', borderRadius: 99,
    borderWidth: 1.5, borderColor: C.orangeBorder, backgroundColor: C.orangeLight,
  },
  clearFiltersBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: C.orangeDark },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 32 },
  errorIconCircle: {
    width: 72, height: 72, borderRadius: 24, backgroundColor: C.redLight,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  errorTitle: { fontFamily: F.semiBold, fontSize: 18, color: C.text },
  errorSub: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14,
    paddingHorizontal: 24, height: MIN_TOUCH_TARGET + 4, borderRadius: 99, backgroundColor: C.orange,
  },
  retryBtnText: { fontFamily: F.semiBold, fontSize: 15, color: '#fff' },

  skeletonCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface,
    marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14,
  },
  skeletonBox: { backgroundColor: C.border, borderRadius: 6 },
});