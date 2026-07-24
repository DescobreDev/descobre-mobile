import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useJobs } from '../../hooks/useJobs';
import { JobListItem, WorkFormat, ContractType } from '../../types/jobs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.78;

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
  indigo: '#6366f1',
  indigoLight: '#eef2ff',
  red: '#ef4444',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const FORMAT_LABELS: Record<WorkFormat, string> = {
  REMOTE: 'Remoto',
  HYBRID: 'Híbrido',
  ONSITE: 'Presencial',
};

const FORMAT_COLORS: Record<WorkFormat, { bg: string; text: string }> = {
  REMOTE: { bg: C.greenLight, text: C.green },
  HYBRID: { bg: C.indigoLight, text: C.indigo },
  ONSITE: { bg: C.orangeLight, text: C.orangeDark },
};

const CONTRACT_LABELS: Record<ContractType, string> = {
  CLT: 'CLT',
  PJ: 'PJ',
  FREELANCER: 'Freelancer',
};

function formatSalary(value: number | null): string {
  if (!value) return 'A combinar';
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`;
}

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

function FormatBadge({ format }: { format: WorkFormat }) {
  const color = FORMAT_COLORS[format];
  return (
    <View style={[styles.badge, { backgroundColor: color.bg }]}>
      <Text style={[styles.badgeText, { color: color.text }]}>{FORMAT_LABELS[format]}</Text>
    </View>
  );
}

function CompanyAvatar({ name, size = 44 }: { name: string; size?: number }) {
  const colors = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6'];
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

function FeaturedCard({ job, onPress }: { job: JobListItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.featuredCard} activeOpacity={0.9}>
      <View style={styles.featuredTop}>
        <CompanyAvatar name={job.company.name} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={styles.featuredCompany} numberOfLines={1}>{job.company.name}</Text>
          <View style={styles.featuredLocationRow}>
            <Ionicons name="location-outline" size={12} color={C.textMuted} />
            <Text style={styles.featuredLocation} numberOfLines={1}>
              {job.city && job.state
                ? `${job.city}, ${job.state}`
                : job.company.city
                ? `${job.company.city}, ${job.company.state}`
                : 'Brasil'}
            </Text>
          </View>
        </View>
        {job.alreadyApplied && (
          <View style={styles.appliedDot}>
            <Ionicons name="checkmark-circle" size={20} color={C.green} />
          </View>
        )}
      </View>

      <Text style={styles.featuredTitle} numberOfLines={2}>{job.title}</Text>

      <View style={styles.featuredBadges}>
        <FormatBadge format={job.workFormat} />
        <View style={[styles.badge, { backgroundColor: C.surface2 }]}>
          <Text style={[styles.badgeText, { color: C.text2 }]}>{CONTRACT_LABELS[job.contractType]}</Text>
        </View>
      </View>

      <View style={styles.featuredFooter}>
        <Text style={styles.featuredSalary}>{formatSalary(job.salary)}</Text>
        <Text style={styles.featuredTime}>{timeAgo(job.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

function JobListItemCard({ job, onPress }: { job: JobListItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.listItem} activeOpacity={0.85}>
      <CompanyAvatar name={job.company.name} size={46} />
      <View style={styles.listItemContent}>
        <Text style={styles.listItemTitle} numberOfLines={1}>{job.title}</Text>
        <Text style={styles.listItemCompany} numberOfLines={1}>{job.company.name}</Text>
        <View style={styles.listItemMeta}>
          <FormatBadge format={job.workFormat} />
          <Text style={styles.listItemSalary}>{formatSalary(job.salary)}</Text>
        </View>
      </View>
      <View style={styles.listItemRight}>
        <Text style={styles.listItemTime}>{timeAgo(job.createdAt)}</Text>
        {job.alreadyApplied ? (
          <Ionicons name="checkmark-circle" size={18} color={C.green} />
        ) : (
          <View style={styles.chevronCircle}>
            <Ionicons name="chevron-forward" size={14} color={C.textMuted} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.filterChip, active && styles.filterChipActive]} activeOpacity={0.8}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <View style={featured ? styles.skeletonFeatured : styles.skeletonList}>
      <View style={[styles.skeletonBox, { width: 46, height: 46, borderRadius: 12 }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonBox, { height: 14, width: '70%' }]} />
        <View style={[styles.skeletonBox, { height: 12, width: '45%' }]} />
        {featured && <View style={[styles.skeletonBox, { height: 12, width: '55%' }]} />}
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { candidate } = useAuthStore();
  const {
    jobs, featured, isLoading, isLoadingMore, hasMore, error,
    filters, setFilters, loadMore, refresh,
  } = useJobs();

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    refresh();
    setTimeout(() => setRefreshing(false), 800);
  }, [refresh]);

  const goToJob = (id: number) => router.push(`/(app)/job/${id}`);

  const FORMAT_FILTERS: { label: string; value: WorkFormat | null }[] = [
    { label: 'Todos', value: null },
    { label: 'Remoto', value: 'REMOTE' },
    { label: 'Híbrido', value: 'HYBRID' },
    { label: 'Presencial', value: 'ONSITE' },
  ];

  const CONTRACT_FILTERS: { label: string; value: ContractType | null }[] = [
    { label: 'CLT', value: 'CLT' },
    { label: 'PJ', value: 'PJ' },
    { label: 'Freelancer', value: 'FREELANCER' },
  ];

  const firstName = candidate?.name?.split(' ')[0] ?? 'Candidato';

  const ListHeader = (
    <View>
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={C.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vagas, empresas..."
            placeholderTextColor={C.textMuted}
            value={filters.search}
            onChangeText={(v) => setFilters({ search: v })}
            returnKeyType="search"
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setFilters({ search: '' })} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
        {FORMAT_FILTERS.map((f) => (
          <FilterChip key={f.label} label={f.label} active={filters.workFormat === f.value} onPress={() => setFilters({ workFormat: f.value })} />
        ))}
        <View style={styles.filterDivider} />
        {CONTRACT_FILTERS.map((f) => (
          <FilterChip
            key={f.label}
            label={f.label}
            active={filters.contractType === f.value}
            onPress={() => setFilters({ contractType: filters.contractType === f.value ? null : f.value })}
          />
        ))}
      </ScrollView>

      {!isLoading && featured.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Em destaque</Text>
            <TouchableOpacity>
              <Text style={styles.sectionLink}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
            decelerationRate="fast"
            snapToInterval={FEATURED_CARD_WIDTH + 12}
            snapToAlignment="start"
          >
            {featured.map((job) => (
              <FeaturedCard key={job.id} job={job} onPress={() => goToJob(job.id)} />
            ))}
          </ScrollView>
        </View>
      )}

      {isLoading && (
        <View style={styles.featuredSection}>
          <View style={[styles.skeletonBox, { height: 16, width: 120, marginBottom: 14, marginLeft: 16 }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
            {[0, 1].map((i) => <SkeletonCard key={i} featured />)}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filters.search || filters.workFormat || filters.contractType ? 'Resultados' : 'Todas as vagas'}
        </Text>
        {!isLoading && <Text style={styles.jobCount}>{jobs.length} vagas</Text>}
      </View>
    </View>
  );

  if (error && !isLoading) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={32} color={C.red} />
          </View>
          <Text style={styles.errorTitle}>Algo deu errado</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn} activeOpacity={0.85}>
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <LinearGradient colors={[C.orange, C.orangeDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerBlob} />
        <View>
          <Text style={styles.headerGreeting}>Olá, {firstName}</Text>
          <Text style={styles.headerSub}>Descubra sua próxima oportunidade</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.avatarBtn} activeOpacity={0.85}>
          <Text style={styles.avatarBtnText}>{firstName[0]}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={isLoading ? [] : jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <JobListItemCard job={item} onPress={() => goToJob(item.id)} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={C.orange} colors={[C.orange]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadMoreSpinner}><ActivityIndicator color={C.orange} /></View>
          ) : !hasMore && jobs.length > 0 ? (
            <Text style={styles.endText}>Você viu todas as vagas disponíveis</Text>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: 10, paddingHorizontal: 16, paddingTop: 4 }}>
              {[0, 1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={32} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptySub}>Tente ajustar os filtros ou buscar por outro termo.</Text>
              <TouchableOpacity
                onPress={() => setFilters({ search: '', workFormat: null, contractType: null })}
                style={styles.clearFiltersBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.clearFiltersBtnText}>Limpar filtros</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 0, backgroundColor: C.surface2 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -80,
    right: -40,
  },
  headerGreeting: { fontFamily: F.bold, fontSize: 22, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 13.5, color: 'rgba(255,255,255,0.88)', marginTop: 2 },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: { fontFamily: F.bold, fontSize: 17, color: '#fff' },

  listContent: { paddingBottom: 24 },

  searchSection: { paddingHorizontal: 16, marginTop: -18, marginBottom: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 14, color: C.text },

  filtersScroll: { paddingHorizontal: 16, paddingVertical: 14, gap: 8, alignItems: 'center' },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  filterChipActive: { borderColor: C.orange, backgroundColor: C.orangeLight },
  filterChipText: { fontFamily: F.medium, fontSize: 13.5, color: C.text2 },
  filterChipTextActive: { color: C.orangeDark, fontFamily: F.semiBold },
  filterDivider: { width: 1, height: 22, backgroundColor: C.border, alignSelf: 'center', marginHorizontal: 2 },

  featuredSection: { paddingTop: 6, paddingBottom: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 6,
  },
  sectionTitle: { fontFamily: F.bold, fontSize: 18, color: C.text },
  sectionLink: { fontFamily: F.semiBold, fontSize: 13.5, color: C.orange },
  jobCount: { fontFamily: F.medium, fontSize: 13, color: C.textMuted },

  featuredScroll: { paddingHorizontal: 16, paddingBottom: 6, gap: 12 },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 3,
  },
  featuredTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featuredCompany: { fontFamily: F.semiBold, fontSize: 15, color: C.text },
  featuredLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  featuredLocation: { fontFamily: F.regular, fontSize: 12.5, color: C.textMuted },
  appliedDot: { marginLeft: 'auto' },
  featuredTitle: { fontFamily: F.bold, fontSize: 17, color: C.text, lineHeight: 22 },
  featuredBadges: { flexDirection: 'row', gap: 6 },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  featuredSalary: { fontFamily: F.bold, fontSize: 16, color: C.orangeDark },
  featuredTime: { fontFamily: F.regular, fontSize: 12.5, color: C.textMuted },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  badgeText: { fontFamily: F.medium, fontSize: 12 },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  listItemContent: { flex: 1, gap: 3 },
  listItemTitle: { fontFamily: F.semiBold, fontSize: 15, color: C.text },
  listItemCompany: { fontFamily: F.regular, fontSize: 13, color: C.text2 },
  listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  listItemSalary: { fontFamily: F.semiBold, fontSize: 13, color: C.orangeDark },
  listItemRight: { alignItems: 'flex-end', gap: 8 },
  listItemTime: { fontFamily: F.regular, fontSize: 11.5, color: C.textMuted },
  chevronCircle: {
    width: 22,
    height: 22,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyAvatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  companyAvatarText: { fontFamily: F.bold },

  emptyState: { alignItems: 'center', paddingVertical: 48, paddingHorizontal: 32, gap: 6 },
  emptyIconCircle: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  emptyTitle: { fontFamily: F.semiBold, fontSize: 17, color: C.text },
  emptySub: { fontFamily: F.regular, fontSize: 14, color: C.text2, textAlign: 'center', lineHeight: 20 },
  clearFiltersBtn: {
    marginTop: 10, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 99,
    borderWidth: 1.5, borderColor: C.orangeBorder, backgroundColor: C.orangeLight,
  },
  clearFiltersBtnText: { fontFamily: F.semiBold, fontSize: 13.5, color: C.orangeDark },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 32 },
  errorIconCircle: {
    width: 64, height: 64, borderRadius: 22, backgroundColor: '#fef2f2',
    alignItems: 'center', justifyContent: 'center', marginBottom: 6,
  },
  errorTitle: { fontFamily: F.semiBold, fontSize: 17, color: C.text },
  errorSub: { fontFamily: F.regular, fontSize: 14, color: C.text2, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14,
    paddingHorizontal: 22, paddingVertical: 12, borderRadius: 99, backgroundColor: C.orange,
  },
  retryBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: '#fff' },

  loadMoreSpinner: { paddingVertical: 20, alignItems: 'center' },
  endText: { fontFamily: F.regular, fontSize: 13, color: C.textMuted, textAlign: 'center', paddingVertical: 20 },

  skeletonFeatured: {
    width: FEATURED_CARD_WIDTH, backgroundColor: C.surface, borderRadius: 20,
    padding: 18, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  skeletonList: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface,
    marginHorizontal: 16, marginBottom: 8, borderRadius: 16, padding: 14,
  },
  skeletonBox: { backgroundColor: C.border, borderRadius: 6 },
});