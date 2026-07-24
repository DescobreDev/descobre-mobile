import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '@/services/api';

const C = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff2e3',
  orangeBorder: 'rgba(249,115,22,0.25)',
  text: '#798eaf',
  text2: '#5a6a82',
  textMuted: '#9aaabb',
  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#e9ecf2',
  green: '#10b981',
  greenLight: '#ecfdf5',
  indigo: '#6366f1',
  indigoLight: '#eef2ff',
  yellow: '#f59e0b',
  yellowLight: '#fffbeb',
  red: '#ef4444',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

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
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
  }
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
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function CompanyAvatar({ name, size = 46 }: { name: string; size?: number }) {
  const colors = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6'];
  const colorIndex = name.charCodeAt(0) % colors.length;
  return (
    <View
      style={[
        styles.companyAvatar,
        {
          width: size,
          height: size,
          borderRadius: size / 4,
          backgroundColor: colors[colorIndex] + '22',
          borderColor: colors[colorIndex] + '44',
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
      <Ionicons name={cfg.icon} size={12} color={cfg.text} />
      <Text style={[styles.statusBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

function FilterChip({
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
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.75}
    >
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
        {label}
      </Text>
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
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ApplicationCard({ item }: { item: Application }) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={() => router.push(`/(app)/job/applicationProcess/${item.id}`)}
    >
      <CompanyAvatar name={item.companyName} size={46} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.jobTitle}
        </Text>
        <Text style={styles.cardCompany} numberOfLines={1}>
          {item.companyName}
        </Text>
        <View style={styles.cardMeta}>
          <StatusBadge status={item.status} />
          <Text style={styles.cardTime}>{timeAgo(item.appliedAt)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </TouchableOpacity>
  );
}


export default function ApplicationsScreen() {
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const filtered = applications;

  const inReview = applications.filter((a) => a.status === 'ANALISE').length;
  const interviews = applications.filter((a) => a.status === 'ENTREVISTA').length;
  const approved = applications.filter((a) => a.status === 'APROVADO').length;

  const ListHeader = (
    <View>
      <View style={styles.summaryRow}>
        <SummaryCard count={applications.length} label="Total" color={C.text2} icon="layers-outline" />
        <SummaryCard count={inReview} label="Em análise" color={C.yellow} icon="hourglass-outline" />
        <SummaryCard count={interviews} label="Entrevistas" color={C.orangeDark} icon="videocam-outline" />
        <SummaryCard count={approved} label="Aprovado" color={C.green} icon="checkmark-circle-outline" />
      </View>

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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {activeFilter ? STATUS_CONFIG[activeFilter].label : 'Todas as candidaturas'}
        </Text>
        <Text style={styles.jobCount}>{filtered.length} vagas</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Candidaturas</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={C.orange} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Candidaturas</Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ApplicationCard item={item} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[C.orange]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name={error ? 'alert-circle-outline' : 'document-text-outline'}
              size={44}
              color={C.textMuted}
            />
            <Text style={styles.emptyTitle}>
              {error ? 'Erro ao carregar' : 'Nenhuma candidatura aqui'}
            </Text>
            <Text style={styles.emptySub}>
              {error ??
                (activeFilter
                  ? 'Não há candidaturas com esse status. Tente outro filtro.'
                  : 'Você ainda não se candidatou a nenhuma vaga.')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.surface2,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 14,
    backgroundColor: C.orange,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontFamily: F.bold,
    fontSize: 26,
    color: '#fff',
  },

  listContent: {
    paddingBottom: 24,
  },

  // Summary
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    borderTopWidth: 3,
    padding: 10,
    alignItems: 'center',
    gap: 2,
  },
  summaryCount: {
    fontFamily: F.bold,
    fontSize: 22,
    marginTop: 2,
  },
  summaryLabel: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
  },

  // Filters
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  filterChipActive: {
    borderColor: C.orange,
    backgroundColor: C.orangeLight,
  },
  filterChipText: {
    fontFamily: F.medium,
    fontSize: 16,
    color: C.text2,
  },
  filterChipTextActive: {
    color: C.orangeDark,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: F.semiBold,
    fontSize: 18,
    color: C.text,
  },
  jobCount: {
    fontFamily: F.regular,
    fontSize: 16,
    color: C.textMuted,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
  },
  cardContent: {
    flex: 1,
    gap: 3,
  },
  cardTitle: {
    fontFamily: F.semiBold,
    fontSize: 18,
    color: C.text,
  },
  cardCompany: {
    fontFamily: F.regular,
    fontSize: 16,
    color: C.text2,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardTime: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textMuted,
  },

  // Status badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  statusBadgeText: {
    fontFamily: F.medium,
    fontSize: 14,
  },

  // Company avatar
  companyAvatar: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  companyAvatarText: {
    fontFamily: F.bold,
  },

  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: F.semiBold,
    fontSize: 18,
    color: C.text,
    marginTop: 8,
  },
  emptySub: {
    fontFamily: F.regular,
    fontSize: 16,
    color: C.text2,
    textAlign: 'center',
    lineHeight: 21,
  },
  clearFiltersBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.orangeBorder,
    backgroundColor: C.orangeLight,
  },
  clearFiltersBtnText: {
    fontFamily: F.semiBold,
    fontSize: 16,
    color: C.orangeDark,
  },
});