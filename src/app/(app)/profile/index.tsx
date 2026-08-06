import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/services/api';
import { useAuthStore } from '../../../store/authStore';
import { ENDPOINTS } from '../../../constants/endpoints';

type CandidateProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  avatarIndex?: number | null;
  avatarUrl?: string | null;
  acceptsTravel: boolean;
  desiredSector?: { id: number; name: string } | null;
  desiredPosition?: { id: number; name: string } | null;
  desiredSalaryMin?: number | null;
  desiredSalaryMax?: number | null;
  salaryNegotiable: boolean;
  contractTypes: string[];
  experienceLevel?: string | null;
  interests: { interest: { id: number; name: string } }[];
  priorities: { priority: { id: number; name: string }; order: number }[];
  completionPercentage: number;
};

type CandidateResume = {
  education: { level: string; institution: string; course: string }[];
  experiences: { id: number; company: string; position: string }[];
  skills: { id: number; name: string; level: string }[];
  languages: { id: number; language: string; level: string }[];
};

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
  red: '#dc2626',
  redLight: '#fef2f2',
};

const F = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function SkeletonBlock({ style }: { style: any }) {
  return <View style={[styles.skeletonBox, style]} />;
}

function ProfileSection({
  title,
  items,
}: {
  title: string;
  items: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    sublabel?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {items.map((item, index) => (
          <React.Fragment key={item.label}>
            <TouchableOpacity
              style={styles.sectionItem}
              onPress={item.onPress}
              activeOpacity={item.onPress ? 0.7 : 1}
            >
              <View style={[styles.sectionItemIcon, item.danger && styles.sectionItemIconDanger]}>
                <Ionicons name={item.icon} size={18} color={item.danger ? C.red : C.orange} />
              </View>
              <View style={styles.sectionItemContent}>
                <Text style={[styles.sectionItemLabel, item.danger && styles.sectionItemLabelDanger]}>
                  {item.label}
                </Text>
                {item.sublabel && <Text style={styles.sectionItemSublabel}>{item.sublabel}</Text>}
              </View>
              {item.rightElement ?? (item.onPress && (
                <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
              ))}
            </TouchableOpacity>
            {index < items.length - 1 && <View style={styles.itemDivider} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = useAuthStore();

  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resume, setResume] = useState<CandidateResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [profileRes, resumeRes] = await Promise.all([
        api.get(ENDPOINTS.profile.get),
        api.get(ENDPOINTS.resume.get),
      ]);
      setProfile(profileRes.data);
      setResume(resumeRes.data);
      console.log('Perfil carregado com sucesso:', profileRes.data);
    } catch (e) {
      console.log('Erro ao carregar perfil:', e);
      setError('Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAll();
  }, [fetchAll]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAll();
  }, [fetchAll]);

  const handleLogout = () => {
    logout();
    // router.replace('/(auth)/login');
  };

  if (error && !loading && !profile) {
    return (
      <View style={[styles.safe, { flex: 1, paddingTop: insets.top }]}>
        <View style={styles.headerShadowWrap}>
          <LinearGradient
            colors={[C.orange, C.orangeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <Text style={styles.headerTitle}>Meu Perfil</Text>
            <Text style={styles.headerSub}>Visualize e edite suas informações</Text>
          </LinearGradient>
        </View>
        <View style={styles.errorState}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={36} color={C.red} />
          </View>
          <Text style={styles.errorTitle}>Não foi possível carregar</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <TouchableOpacity onPress={fetchAll} style={styles.retryBtn} activeOpacity={0.85}>
            <Ionicons name="refresh" size={18} color="#fff" />
            <Text style={styles.retryBtnText}>Tentar de novo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const firstName = profile?.name?.split(' ')[0] ?? 'Candidato';
  const completion = profile?.completionPercentage ?? 0;

  return (
    <View style={[styles.safe, { paddingTop: insets.top }]}>
      <View style={styles.headerShadowWrap}>
        <LinearGradient
          colors={[C.orange, C.orangeDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <Text style={styles.headerSub}>Visualize e edite suas informações</Text>
        </LinearGradient>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 32 + insets.bottom }
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.orange}
            colors={[C.orange]}
          />
        }
      >
        {/* Avatar card */}
        {loading ? (
          <View style={styles.avatarCard}>
            <SkeletonBlock style={{ width: 60, height: 60, borderRadius: 30 }} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonBlock style={{ width: '60%', height: 18 }} />
              <SkeletonBlock style={{ width: '40%', height: 13 }} />
            </View>
          </View>
        ) : (
          <View style={styles.avatarCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials(profile?.name ?? 'C')}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{profile?.name}</Text>
              {/* <Text style={styles.avatarEmail}>{profile?.email}</Text> */}
            </View>
            <TouchableOpacity
              style={styles.editAvatarBtn}
              activeOpacity={0.8}
            // onPress={() => router.push('/(app)/profile/edit-avatar')}
            >
              <Ionicons name="pencil" size={15} color={C.orangeDark} />
              <Text style={styles.editAvatarText}>Editar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Completion banner */}
        {!loading && completion < 100 && (
          <View style={styles.completionBanner}>
            <View style={styles.completionLeft}>
              <Text style={styles.completionTitle}>Complete seu perfil</Text>
              <Text style={styles.completionSub}>
                Perfis completos têm 3x mais chances de serem vistos por recrutadores.
              </Text>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${completion}%` }]} />
              </View>
              <Text style={styles.completionPercent}>{completion}% completo</Text>
            </View>
            <Ionicons name="ribbon-outline" size={36} color={C.orange} />
          </View>
        )}

        <ProfileSection
          title="Dados pessoais e preferências"
          items={[
            {
              icon: 'person-outline',
              label: 'Nome completo',
              sublabel: profile?.name,
              onPress: () => router.push('/(app)/profile/edit-personal'),
            },
            {
              icon: 'location-outline',
              label: 'Localização',
              sublabel: profile?.city ? `${profile.city} - ${profile.state}` : 'Não informada',
              onPress: () => router.push('/(app)/profile/edit-personal'),
            },
            {
              icon: 'briefcase-outline',
              label: 'Vaga desejada',
              sublabel: profile?.desiredPosition?.name ?? 'Não informado',
              // onPress: () => router.push('/(app)/profile/edit-preferences'),
            },
            {
              icon: 'cash-outline',
              label: 'Pretensão salarial',
              sublabel:
                profile?.desiredSalaryMin && profile?.desiredSalaryMax
                  ? `R$ ${profile.desiredSalaryMin} - R$ ${profile.desiredSalaryMax}`
                  : 'A combinar',
              // onPress: () => router.push('/(app)/profile/edit-preferences'),
            },
            {
              icon: 'heart-outline',
              label: 'Interesses',
              sublabel: `${profile?.interests?.length ?? 0} selecionados`,
              onPress: () => router.push('/(app)/profile/edit-interests'),
            },
          ]}
        />

        {/* Currículo */}
        {loading ? (
          <View style={{ paddingHorizontal: 16, marginTop: 20, gap: 10 }}>
            <SkeletonBlock style={{ height: 60, borderRadius: 14 }} />
            <SkeletonBlock style={{ height: 60, borderRadius: 14 }} />
          </View>
        ) : (
          <ProfileSection
            title="Currículo"
            items={[
              {
                icon: 'briefcase-outline',
                label: 'Experiências profissionais',
                sublabel: `${resume?.experiences?.length ?? 0} experiências`,
                onPress: () => router.push('/(app)/profile/experiences'),
              },
              {
                icon: 'school-outline',
                label: 'Formação acadêmica',
                sublabel: resume?.education?.[0]?.course ?? '0 formações',
                onPress: () => router.push('/(app)/profile/education'),
              },
              {
                icon: 'ribbon-outline',
                label: 'Habilidades',
                sublabel: `${resume?.skills?.length ?? 0} habilidades`,
                // onPress: () => router.push('/(app)/profile/skills'),
              },
              {
                icon: 'language-outline',
                label: 'Idiomas',
                sublabel: `${resume?.languages?.length ?? 0} idiomas`,
                // onPress: () => router.push('/(app)/profile/languages'),
              },
            ]}
          />
        )}

        {/* <ProfileSection
          title="Preferências"
          items={[
            {
              icon: 'notifications-outline',
              label: 'Notificações de vagas',
              rightElement: (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: C.border, true: C.orangeLight }}
                  thumbColor={notificationsEnabled ? C.orange : C.textMuted}
                  ios_backgroundColor={C.border}
                />
              ),
            },
            {
              icon: 'lock-closed-outline',
              label: 'Alterar senha',
              // onPress: () => router.push('/(app)/profile/change-password'),
            },
          ]}
        /> */}

        <ProfileSection
          title="Conta"
          items={[{ icon: 'log-out-outline', label: 'Sair da conta', danger: true, onPress: handleLogout }]}
        />

        <Text style={styles.versionText}>Versão 1.0.0</Text>
      </ScrollView>
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

  list: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerTitle: { fontFamily: F.bold, fontSize: 26, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 14, color: 'rgba(255,255,255,0.92)', marginTop: 2 },
  scrollContent: { paddingBottom: 32 },

  avatarCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.surface, marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16,
  },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: C.orangeLight,
    borderWidth: 2, borderColor: C.orangeBorder, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: F.bold, fontSize: 24, color: C.orange },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: { fontFamily: F.semiBold, fontSize: 20, color: C.text },
  avatarEmail: { fontFamily: F.regular, fontSize: 14, color: C.textMuted },
  editAvatarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12,
    paddingVertical: 7, borderRadius: 99, borderWidth: 1.5, borderColor: C.orangeBorder,
    backgroundColor: C.orangeLight,
  },
  editAvatarText: { fontFamily: F.semiBold, fontSize: 16, color: C.orangeDark },

  completionBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: C.orangeLight,
    marginHorizontal: 16, marginTop: 12, borderRadius: 14, borderWidth: 1,
    borderColor: C.orangeBorder, padding: 16,
  },
  completionLeft: { flex: 1, gap: 4 },
  completionTitle: { fontFamily: F.semiBold, fontSize: 16, color: C.orangeDark },
  completionSub: { fontFamily: F.regular, fontSize: 14, color: C.text2, lineHeight: 19 },
  progressBarBg: { height: 6, backgroundColor: C.orangeBorder, borderRadius: 99, marginTop: 8 },
  progressBarFill: { height: 6, backgroundColor: C.orange, borderRadius: 99 },
  completionPercent: { fontFamily: F.medium, fontSize: 14, color: C.orangeDark, marginTop: 2 },

  section: { marginTop: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontFamily: F.semiBold, fontSize: 16, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, marginLeft: 2,
  },
  sectionCard: { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  sectionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
  sectionItemIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: C.orangeLight, alignItems: 'center', justifyContent: 'center' },
  sectionItemIconDanger: { backgroundColor: C.redLight },
  sectionItemContent: { flex: 1, gap: 1 },
  sectionItemLabel: { fontFamily: F.medium, fontSize: 16, color: C.text },
  sectionItemLabelDanger: { color: C.red },
  sectionItemSublabel: { fontFamily: F.regular, fontSize: 14, color: C.textMuted },
  itemDivider: { height: 1, backgroundColor: C.border, marginLeft: 60 },

  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 32 },
  errorIconCircle: { width: 72, height: 72, borderRadius: 24, backgroundColor: C.redLight, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  errorTitle: { fontFamily: F.semiBold, fontSize: 18, color: C.text },
  errorSub: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, textAlign: 'center' },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingHorizontal: 24, height: 52, borderRadius: 99, backgroundColor: C.orange },
  retryBtnText: { fontFamily: F.semiBold, fontSize: 15, color: '#fff' },

  skeletonBox: { backgroundColor: C.border, borderRadius: 6 },
  versionText: { fontFamily: F.regular, fontSize: 14, color: C.textMuted, textAlign: 'center', marginTop: 28 },
});