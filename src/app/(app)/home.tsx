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
import { AdvancedFiltersModal } from '../../components/filters/AdvancedFiltersModal';
import { JobListItem, WorkFormat, ContractType } from '../../types/jobs';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = SCREEN_WIDTH * 0.8;

const MIN_TOUCH_TARGET = 48;

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
  red: '#dc2626',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

// Ícone + cor + texto juntos: nunca depender só da cor para transmitir informação.
// Ajuda quem tem dificuldade de leitura e também daltônicos.
const FORMAT_CONFIG: Record<WorkFormat, { label: string; icon: keyof typeof Ionicons.glyphMap; bg: string; text: string }> = {
  REMOTE: { label: 'Remoto', icon: 'home-outline', bg: C.greenLight, text: C.green },
  HYBRID: { label: 'Híbrido', icon: 'swap-horizontal-outline', bg: C.indigoLight, text: C.indigo },
  ONSITE: { label: 'Presencial', icon: 'business-outline', bg: C.orangeLight, text: C.orangeDark },
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
  const cfg = FORMAT_CONFIG[format];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon} size={13} color={cfg.text} />
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
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

function FeaturedCard({ job, onPress }: { job: JobListItem; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.featuredCard} activeOpacity={0.85}>
      <View style={styles.featuredTop}>
        <CompanyAvatar name={job.company.name} size={48} />
        <View style={{ flex: 1 }}>
          <Text style={styles.featuredCompany} numberOfLines={1}>{job.company.name}</Text>
          <View style={styles.featuredLocationRow}>
            <Ionicons name="location-outline" size={13} color={C.text2} />
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
          <View style={styles.appliedPill}>
            <Ionicons name="checkmark-circle" size={16} color={C.green} />
            <Text style={styles.appliedPillText}>Inscrito</Text>
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
    <TouchableOpacity onPress={onPress} style={styles.listItem} activeOpacity={0.8}>
      <CompanyAvatar name={job.company.name} size={48} />
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
          <View style={styles.appliedDotSmall}>
            <Ionicons name="checkmark-circle" size={22} color={C.green} />
          </View>
        ) : (
          <View style={styles.chevronCircle}>
            <Ionicons name="chevron-forward" size={16} color={C.text2} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
      activeOpacity={0.8}
      // hitSlop garante área de toque confortável mesmo com o chip visualmente compacto
      hitSlop={{ top: 6, bottom: 6, left: 2, right: 2 }}
    >
      {active && <Ionicons name="checkmark" size={15} color="#fff" style={{ marginRight: 4 }} />}
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <View style={featured ? styles.skeletonFeatured : styles.skeletonList}>
      <View style={[styles.skeletonBox, { width: 48, height: 48, borderRadius: 12 }]} />
      <View style={{ flex: 1, gap: 8 }}>
        <View style={[styles.skeletonBox, { height: 15, width: '70%' }]} />
        <View style={[styles.skeletonBox, { height: 13, width: '45%' }]} />
        {featured && <View style={[styles.skeletonBox, { height: 13, width: '55%' }]} />}
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
    filters, setFilters, activeFilterCount, resetFilters, loadMore, refresh,
  } = useJobs();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
          <Ionicons name="search-outline" size={20} color={C.text2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar vaga ou empresa"
            placeholderTextColor={C.textMuted}
            value={filters.search}
            onChangeText={(v) => setFilters({ search: v })}
            returnKeyType="search"
          />
          {filters.search.length > 0 && (
            <TouchableOpacity onPress={() => setFilters({ search: '' })} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close-circle" size={20} color={C.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={() => setShowAdvancedFilters(true)}
          style={[styles.advancedFilterBtn, activeFilterCount > 0 && styles.advancedFilterBtnActive]}
          activeOpacity={0.85}
        >
          <Ionicons name="options-outline" size={22} color={activeFilterCount > 0 ? '#fff' : C.text2} />
          {activeFilterCount > 0 && (
            <View style={styles.advancedFilterBadge}>
              <Text style={styles.advancedFilterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/*
        Antes isso era um ScrollView horizontal — em telas estreitas o último
        chip ficava cortado pela metade, parecendo bug. Um segmented control
        de largura fixa (4 partes iguais) sempre mostra tudo de uma vez.
      */}
      <View style={styles.segmentedControl}>
        {FORMAT_FILTERS.map((f) => {
          const active = filters.workFormat === f.value;
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilters({ workFormat: f.value })}
              style={[styles.segment, active && styles.segmentActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.segmentText, active && styles.segmentTextActive]} numberOfLines={1}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* flexWrap em vez de scroll: se não couber numa linha, quebra pra segunda — nunca corta. */}
      <View style={styles.contractFilterRow}>
        <Text style={styles.contractFilterLabel}>Contrato</Text>
        {CONTRACT_FILTERS.map((f) => (
          <FilterChip
            key={f.label}
            label={f.label}
            active={filters.contractType === f.value}
            onPress={() => setFilters({ contractType: filters.contractType === f.value ? null : f.value })}
          />
        ))}
      </View>

      {!isLoading && featured.length > 0 && (
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Em destaque</Text>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
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
          <View style={[styles.skeletonBox, { height: 18, width: 130, marginBottom: 14, marginLeft: 16 }]} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
            {[0, 1].map((i) => <SkeletonCard key={i} featured />)}
          </ScrollView>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {filters.search || filters.workFormat || filters.contractType || activeFilterCount > 0 ? 'Resultados' : 'Todas as vagas'}
        </Text>
        {!isLoading && (
          <View style={styles.jobCountPill}>
            <Text style={styles.jobCountText}>{jobs.length} vagas</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (error && !isLoading) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={36} color={C.red} />
          </View>
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity onPress={refresh} style={styles.retryBtn} activeOpacity={0.85}>
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
        <LinearGradient colors={[C.orange, C.orangeDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.headerGreeting} numberOfLines={1}>Olá, {firstName}</Text>
            <Text style={styles.headerSub}>Encontre sua próxima vaga</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(app)/profile')} style={styles.avatarBtn} activeOpacity={0.85}>
            <Text style={styles.avatarBtnText}>{firstName[0]}</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <FlatList
        style={styles.list}
        data={isLoading ? [] : jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <JobListItemCard job={item} onPress={() => goToJob(item.id)} />}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={[styles.listContent, { paddingBottom: 24 + insets.bottom }]}
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
                <Ionicons name="search-outline" size={36} color={C.text2} />
              </View>
              <Text style={styles.emptyTitle}>Nenhuma vaga encontrada</Text>
              <Text style={styles.emptySub}>Tente buscar outra palavra ou limpar os filtros.</Text>
              <TouchableOpacity
                onPress={() => {
                  setFilters({ search: '', workFormat: null, contractType: null });
                  resetFilters();
                }}
                style={styles.clearFiltersBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.clearFiltersBtnText}>Limpar filtros</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      <AdvancedFiltersModal
        visible={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onApply={setFilters}
        onReset={() =>
          setFilters({
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
          })
        }
        candidateLocation={{ city: candidate?.city, state: candidate?.state }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerGreeting: { fontFamily: F.bold, fontSize: 22, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  avatarBtn: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBtnText: { fontFamily: F.bold, fontSize: 18, color: '#fff' },

  // KEY FIX: flex:1 é o que faz a lista ocupar corretamente todo o espaço
  // restante abaixo do header, em vez de colapsar/sobrepor o conteúdo.
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },

  searchSection: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: MIN_TOUCH_TARGET + 4,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  searchInput: { flex: 1, fontFamily: F.regular, fontSize: 15, color: C.text },

  advancedFilterBtn: {
    width: MIN_TOUCH_TARGET + 4,
    height: MIN_TOUCH_TARGET + 4,
    borderRadius: 14,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },
  advancedFilterBtnActive: { backgroundColor: C.orange },
  advancedFilterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: C.text,
    borderWidth: 2,
    borderColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  advancedFilterBadgeText: { fontFamily: F.bold, fontSize: 11, color: '#fff' },

  // Segmented control: substitui o antigo ScrollView horizontal. Largura
  // fixa dividida em 4 partes iguais — nada fica escondido fora da tela.
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginTop: 18,
    gap: 4,
  },
  segment: {
    flex: 1,
    height: MIN_TOUCH_TARGET - 6,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: C.surface,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { fontFamily: F.medium, fontSize: 12.5, color: C.text2 },
  segmentTextActive: { fontFamily: F.semiBold, fontSize: 12.5, color: C.orangeDark },

  // flexWrap: se "Freelancer" não couber na linha, quebra pra próxima — nunca corta.
  contractFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 4,
  },
  contractFilterLabel: { fontFamily: F.medium, fontSize: 13, color: C.textMuted, marginRight: 2 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: MIN_TOUCH_TARGET - 6, // ~42px + hitSlop cobre o restante até 48
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  filterChipActive: { borderColor: C.orange, backgroundColor: C.orange },
  filterChipText: { fontFamily: F.medium, fontSize: 14, color: C.text2 },
  filterChipTextActive: { color: '#fff', fontFamily: F.semiBold },

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
  sectionLink: { fontFamily: F.semiBold, fontSize: 14, color: C.orangeDark },
  jobCountPill: {
    backgroundColor: C.surface,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: C.border,
  },
  jobCountText: { fontFamily: F.semiBold, fontSize: 12, color: C.text2 },

  featuredScroll: { paddingHorizontal: 16, paddingBottom: 6, gap: 12 },
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  featuredTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featuredCompany: { fontFamily: F.semiBold, fontSize: 15.5, color: C.text },
  featuredLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  featuredLocation: { fontFamily: F.regular, fontSize: 13, color: C.text2 },
  appliedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.greenLight, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 99,
  },
  appliedPillText: { fontFamily: F.semiBold, fontSize: 11.5, color: C.green },
  featuredTitle: { fontFamily: F.bold, fontSize: 17.5, color: C.text, lineHeight: 23 },
  featuredBadges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  featuredFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  featuredSalary: { fontFamily: F.bold, fontSize: 17, color: C.orangeDark },
  featuredTime: { fontFamily: F.regular, fontSize: 13, color: C.text2 },

  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 99 },
  badgeText: { fontFamily: F.medium, fontSize: 12.5 },

  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.surface,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    minHeight: MIN_TOUCH_TARGET + 24, // garante área de toque confortável no card inteiro
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  listItemContent: { flex: 1, gap: 4 },
  listItemTitle: { fontFamily: F.semiBold, fontSize: 15.5, color: C.text },
  listItemCompany: { fontFamily: F.regular, fontSize: 13.5, color: C.text2 },
  listItemMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  listItemSalary: { fontFamily: F.semiBold, fontSize: 13.5, color: C.orangeDark },
  listItemRight: { alignItems: 'flex-end', gap: 8 },
  listItemTime: { fontFamily: F.regular, fontSize: 12, color: C.text2 },
  appliedDotSmall: { padding: 2 },
  chevronCircle: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: C.surface2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  companyAvatar: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  companyAvatarText: { fontFamily: F.bold },

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

  loadMoreSpinner: { paddingVertical: 20, alignItems: 'center' },
  endText: { fontFamily: F.regular, fontSize: 13.5, color: C.text2, textAlign: 'center', paddingVertical: 20 },

  skeletonFeatured: {
    width: FEATURED_CARD_WIDTH, backgroundColor: C.surface, borderRadius: 20,
    padding: 18, flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  skeletonList: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.surface,
    marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14,
  },
  skeletonBox: { backgroundColor: C.border, borderRadius: 6 },
});