import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    Animated,
    ActivityIndicator,
    Alert,
    Dimensions,
    Easing,
    Linking,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../../services/api';
import { ENDPOINTS } from '../../../constants/endpoints';
import { useAuthStore } from '../../../store/authStore';

const { width: SW } = Dimensions.get('window');

const C = {
    orange: '#f97316',
    orangeDark: '#ea580c',
    orangeLight: '#fff7ed',
    orangeGlow: 'rgba(249,115,22,0.28)',
    orangeBorder: 'rgba(249,115,22,0.35)',
    hero: '#f26d25',
    heroCard: '#fff7ed',
    heroMuted: 'rgba(255,255,255,0.45)',
    heroSubtle: 'rgba(255,255,255,0.08)',
    bg: '#f4f6fb',
    surface: '#ffffff',
    surface2: '#f8fafc',
    border: '#e9ecf2',
    text: '#0d1829',
    text2: '#4b5a72',
    muted: '#8fa0b5',
    green: '#10b981',
    greenBg: '#ecfdf5',
    greenBorder: '#a7f3d0',
    indigo: '#6366f1',
    indigoBg: '#eef2ff',
    red: '#ef4444',
    redBg: '#fef2f2',
    amber: '#f59e0b',
    amberBg: '#fffbeb',
};

const F = {
    regular: 'Poppins_400Regular',
    medium: 'Poppins_500Medium',
    semiBold: 'Poppins_600SemiBold',
    bold: 'Poppins_700Bold',
};

const FORMAT_CFG = {
    REMOTE: { label: 'Remoto', icon: 'home-outline' as const, color: C.green, bg: C.greenBg, border: C.greenBorder },
    HYBRID: { label: 'Híbrido', icon: 'shuffle-outline' as const, color: C.indigo, bg: C.indigoBg, border: '#c7d2fe' },
    ONSITE: { label: 'Presencial', icon: 'business-outline' as const, color: C.orange, bg: C.orangeLight, border: C.orangeBorder },
};

const CONTRACT_CFG = {
    CLT: { label: 'CLT', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    PJ: { label: 'PJ', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
    FREELANCER: { label: 'Freelancer', color: '#7c3aed', bg: '#faf5ff', border: '#ddd6fe' },
};

const JOBTYPE_CFG = {
    STANDARD: 'Efetivo',
    INTERNSHIP: 'Estágio',
    TRAINEE: 'Trainee',
};

const AFFIRMATIVE_CFG: Record<string, { label: string; color: string; bg: string; border: string } | null> = {
    NOT_INFORMED: null,
    PCD: { label: '♿ Vaga PCD', color: '#0369a1', bg: '#e0f2fe', border: '#7dd3fc' },
    WOMEN: { label: '♀ Vaga para mulheres', color: '#be185d', bg: '#fdf2f8', border: '#f9a8d4' },
    FIFTY_PLUS: { label: '50+ anos', color: '#92400e', bg: '#fffbeb', border: '#fcd34d' },
    LGBTQIAPN: { label: '🏳‍🌈 LGBTQIA+', color: '#6d28d9', bg: '#f5f3ff', border: '#c4b5fd' },
};

interface JobDetail {
    id: number;
    title: string;
    description: string;
    salary: number | null;
    workFormat: 'REMOTE' | 'HYBRID' | 'ONSITE';
    contractType: 'CLT' | 'PJ' | 'FREELANCER';
    jobType: 'STANDARD' | 'INTERNSHIP' | 'TRAINEE';
    workload: number;
    city: string | null;
    state: string | null;
    deadline: string | null;
    createdAt: string;
    affirmative: string;
    benefits: string[];
    customBenefits: string[];
    alreadyApplied: boolean;
    applicationStatus: string | null;
    company: {
        id: number;
        name: string;
        city: string;
        state: string;
        about: string;
        employees: number;
        site: string | null;
    };
}

const fmt = {
    salary: (v: number | null) =>
        v ? `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` : 'A combinar',

    date: (s: string) =>
        new Date(s).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),

    daysLeft: (s: string) =>
        Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000),

    employees: (n: number) => {
        if (n < 10) return '< 10 funcionários';
        if (n < 50) return '10 – 49 funcionários';
        if (n < 200) return '50 – 199 funcionários';
        if (n < 1000) return '200 – 999 funcionários';
        return '1 000+ funcionários';
    },

    initials: (name: string) =>
        name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase(),
};

const AVATAR_COLORS = ['#f97316', '#6366f1', '#10b981', '#ec4899', '#f59e0b', '#3b82f6', '#8b5cf6'];
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
function SkeletonPulse() {
    const opacity = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.5, duration: 750, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const B = ({ w, h, r = 8, mt = 0 }: { w: number | `${number}%`; h: number; r?: number; mt?: number }) => (
        <Animated.View style={{ width: w, height: h, borderRadius: r, backgroundColor: '#d1d9e6', marginTop: mt, opacity }} />
    );

    return (
        <View>
            <View style={{ backgroundColor: C.hero, padding: 24, paddingTop: 16, gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Animated.View style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.1)', opacity }} />
                    <View style={{ gap: 7, flex: 1 }}>
                        <B w="50%" h={12} />
                        <B w="35%" h={10} />
                    </View>
                </View>
                <B w="85%" h={22} />
                <B w="60%" h={22} />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    <B w={80} h={28} r={99} />
                    <B w={60} h={28} r={99} />
                    <B w={72} h={28} r={99} />
                </View>
            </View>
            <View style={{ padding: 24, gap: 24 }}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                    {[90, 100, 80].map((w, i) => <B key={i} w={w} h={36} r={12} />)}
                </View>
                <View style={{ gap: 10 }}>
                    <B w={110} h={14} />
                    {[1, 2, 3, 4, 5].map((i) => <B key={i} w={i % 3 === 0 ? '65%' : '100%'} h={11} mt={2} />)}
                </View>
                <View style={{ gap: 8 }}>
                    <B w={110} h={14} />
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {[80, 110, 90, 70, 100].map((w, i) => <B key={i} w={w} h={32} r={99} />)}
                    </View>
                </View>
            </View>
        </View>
    );
}

function Pill({
    icon, label, color, bg, border,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    color: string;
    bg: string;
    border: string;
}) {
    return (
        <View style={[sk.pill, { backgroundColor: bg, borderColor: border }]}>
            <Ionicons name={icon} size={13} color={color} />
            <Text style={[sk.pillText, { color }]}>{label}</Text>
        </View>
    );
}

function Divider() {
    return <View style={sk.divider} />;
}

function SectionHead({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <View style={sk.sectionHead}>
            <Text style={sk.sectionTitle}>{title}</Text>
            {subtitle && <Text style={sk.sectionSub}>{subtitle}</Text>}
        </View>
    );
}

export default function JobDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { candidate } = useAuthStore();

    const [job, setJob] = useState<JobDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [descExpanded, setDescExpanded] = useState(false);
    const [descOverflow, setDescOverflow] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const contentY = useRef(new Animated.Value(18)).current;
    const contentO = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();

    const animateIn = () => {
        Animated.parallel([
            Animated.spring(contentY, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
            Animated.timing(contentO, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]).start();
    };

    const fetchJob = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            setError(null);
            contentY.setValue(18);
            contentO.setValue(0);
            const { data } = await api.get(ENDPOINTS.jobs.detail(+id));
            setJob(data);
            setTimeout(animateIn, 60);
        } catch (e: any) {
            console.log('e', e);
            setError(e?.response?.data?.message ?? 'Não foi possível carregar a vaga.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchJob(); }, [fetchJob]);

    const handleApply = useCallback(() => {
        if (!candidate) { router.push('/auth/login'); return; }

        Alert.alert(
            'Confirmar candidatura',
            `Candidatar-se à vaga "${job?.title}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Candidatar', onPress: async () => {
                        setApplying(true);
                        try {
                            await api.post(ENDPOINTS.jobs.apply(+id!), {});
                            setJob((p) => p ? { ...p, alreadyApplied: true, applicationStatus: 'RECEBIDA' } : p);
                            Alert.alert('🎉 Pronto!', 'Sua candidatura foi enviada com sucesso.');
                        } catch (e: any) {
                            Alert.alert('Erro', e?.response?.data?.message ?? 'Tente novamente.');
                        } finally {
                            setApplying(false);
                        }
                    },
                },
            ]
        );
    }, [candidate, job, id]);

    const handleShare = useCallback(async () => {
        if (!job) return;
        await Share.share({ message: `${job.title} — ${job.company.name}` });
    }, [job]);

    const TopBar = (
        <View
            style={[
                sk.topBar,
                {
                    paddingTop: insets.top + 8,
                },
            ]}
        >
            <TouchableOpacity
                onPress={() => router.back()}
                style={sk.topBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
            >
                <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
                onPress={handleShare}
                style={sk.topBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel="Compartilhar"
            >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={{ flex: 1, backgroundColor: C.hero }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
                    {TopBar}
                    <View style={{ flex: 1, backgroundColor: C.bg }}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <SkeletonPulse />
                        </ScrollView>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    if (error || !job) {
        return (
            <View style={{ flex: 1, backgroundColor: C.hero }}>
                <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
                    {TopBar}
                    <View style={sk.errorWrap}>
                        <View style={sk.errorIcon}>
                            <Ionicons name="alert-circle-outline" size={36} color={C.orange} />
                        </View>
                        <Text style={sk.errorTitle}>Vaga indisponível</Text>
                        <Text style={sk.errorSub}>{error ?? 'Esta vaga pode ter sido encerrada.'}</Text>
                        <TouchableOpacity onPress={fetchJob} style={sk.retryBtn}>
                            <Text style={sk.retryText}>Tentar novamente</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    const fmtCfg = FORMAT_CFG[job.workFormat];
    const ctrCfg = CONTRACT_CFG[job.contractType];
    const affCfg = AFFIRMATIVE_CFG[job.affirmative];
    const daysLeft = job.deadline ? fmt.daysLeft(job.deadline) : null;
    const deadlineRed = daysLeft !== null && daysLeft <= 3;
    const location = (job.city && job.state) ? `${job.city}, ${job.state}` : `${job.company.city}, ${job.company.state}`;
    const allBenefits = [...job.benefits, ...job.customBenefits];
    const ac = avatarColor(job.company.name);

    return (
        <View style={{ flex: 1, backgroundColor: C.hero }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>

                {TopBar}

                <View style={{ flex: 1, backgroundColor: C.bg }}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 24 }}
                        scrollEventThrottle={16}
                    >

                        <LinearGradient
                            colors={['#ea580c', '#f97316', '#fb923c']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={sk.hero}
                        >
                            <View style={sk.heroGlow} pointerEvents="none" />

                            <View style={sk.heroCompanyRow}>
                                <View style={[sk.heroAvatar, { backgroundColor: ac + '25', borderColor: ac + '60' }]}>
                                    <Text style={[sk.heroAvatarText, { color: ac }]}>{fmt.initials(job.company.name)}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={sk.heroCompanyName} numberOfLines={1}>{job.company.name}</Text>
                                    <View style={sk.heroLocationRow}>
                                        <Ionicons name="location-outline" size={12} color={C.heroMuted} />
                                        <Text style={sk.heroLocation} numberOfLines={1}>{location}</Text>
                                    </View>
                                </View>
                                {job.alreadyApplied && (
                                    <View style={sk.appliedBadge}>
                                        <Ionicons name="checkmark-circle" size={13} color={C.green} />
                                        <Text style={sk.appliedBadgeText}>Candidatado</Text>
                                    </View>
                                )}
                            </View>

                            <Text style={sk.heroTitle}>{job.title}</Text>

                            <View style={sk.heroPills}>
                                <Pill icon={fmtCfg.icon} label={fmtCfg.label} color={fmtCfg.color} bg={fmtCfg.bg} border={fmtCfg.border} />
                                <Pill icon="document-text-outline" label={ctrCfg.label} color={ctrCfg.color} bg={ctrCfg.bg} border={ctrCfg.border} />
                                <Pill icon="briefcase-outline" label={JOBTYPE_CFG[job.jobType]} color={C.muted} bg="rgba(255,255,255,0.08)" border="rgba(255,255,255,0.12)" />
                                {affCfg && (
                                    <Pill icon="ribbon-outline" label={affCfg.label} color={affCfg.color} bg={affCfg.bg} border={affCfg.border} />
                                )}
                            </View>

                            <View style={sk.heroMeta}>
                                <Text style={sk.heroMetaText}>
                                    Publicado {fmt.date(job.createdAt)}
                                </Text>
                                {job.deadline && (
                                    <>
                                        <View style={sk.heroDot} />
                                        <Text style={[sk.heroMetaText, deadlineRed && { color: '#fca5a5' }]}>
                                            {daysLeft! <= 0
                                                ? 'Prazo encerrado'
                                                : daysLeft === 1
                                                    ? '⚠️ Encerra amanhã'
                                                    : daysLeft! <= 3
                                                        ? `⚠️ ${daysLeft} dias restantes`
                                                        : `Prazo: ${fmt.date(job.deadline)}`}
                                        </Text>
                                    </>
                                )}
                            </View>
                        </LinearGradient>
                        <Animated.View style={{ opacity: contentO, transform: [{ translateY: contentY }] }}>
                            <View style={sk.infoGrid}>
                                <InfoCard
                                    icon="time-outline"
                                    label="Carga horária"
                                    value={`${job.workload}h / semana`}
                                />
                                <InfoCard
                                    icon="wallet-outline"
                                    label="Salário"
                                    value={fmt.salary(job.salary)}
                                    highlight
                                />
                                <InfoCard
                                    icon={fmtCfg.icon}
                                    label="Modalidade"
                                    value={fmtCfg.label}
                                />
                                <InfoCard
                                    icon="location-outline"
                                    label="Localização"
                                    value={location}
                                />
                            </View>

                            <View style={sk.section}>
                                <SectionHead title="Sobre a vaga" />
                                <Text
                                    style={sk.body}
                                    numberOfLines={descExpanded ? undefined : 7}
                                    onTextLayout={(e) => {
                                        if (!descExpanded && e.nativeEvent.lines.length >= 7) setDescOverflow(true);
                                    }}
                                >
                                    {job.description}
                                </Text>
                                {descOverflow && (
                                    <TouchableOpacity
                                        onPress={() => { setDescExpanded((v) => !v); }}
                                        style={sk.expandBtn}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={sk.expandText}>
                                            {descExpanded ? 'Mostrar menos' : 'Ler descrição completa'}
                                        </Text>
                                        <Ionicons name={descExpanded ? 'chevron-up' : 'chevron-down'} size={14} color={C.orange} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {allBenefits.length > 0 && (
                                <>
                                    <Divider />
                                    <View style={sk.section}>
                                        <SectionHead
                                            title="Benefícios"
                                            subtitle={`${allBenefits.length} benefício${allBenefits.length > 1 ? 's' : ''}`}
                                        />
                                        <View style={sk.benefitsGrid}>
                                            {allBenefits.map((b, i) => (
                                                <View key={i} style={sk.benefitItem}>
                                                    <View style={sk.benefitDot}>
                                                        <Ionicons name="checkmark" size={11} color={C.green} />
                                                    </View>
                                                    <Text style={sk.benefitText}>{b}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </>
                            )}

                            <Divider />
                            <View style={sk.section}>
                                <SectionHead title="Sobre a empresa" />
                                <View style={sk.companyCard}>
                                    <View style={[sk.companyCardAvatar, { backgroundColor: ac + '20', borderColor: ac + '40' }]}>
                                        <Text style={[sk.companyCardAvatarText, { color: ac }]}>{fmt.initials(job.company.name)}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={sk.companyCardName}>{job.company.name}</Text>
                                        <Text style={sk.companyCardSub}>{job.company.city}, {job.company.state}</Text>
                                    </View>
                                </View>

                                {!!job.company.about && (
                                    <Text style={[sk.body, { marginTop: 4 }]}>{job.company.about}</Text>
                                )}

                                <View style={sk.companyStats}>
                                    <View style={sk.companyStat}>
                                        <Ionicons name="people-outline" size={16} color={C.orange} />
                                        <Text style={sk.companyStatText}>{fmt.employees(job.company.employees)}</Text>
                                    </View>
                                    <View style={sk.companyStat}>
                                        <Ionicons name="location-outline" size={16} color={C.orange} />
                                        <Text style={sk.companyStatText}>{job.company.city}, {job.company.state}</Text>
                                    </View>
                                    {job.company.site && (
                                        <TouchableOpacity
                                            style={sk.companyStat}
                                            onPress={() => {
                                                const url = job.company.site!.startsWith('http') ? job.company.site! : `https://${job.company.site}`;
                                                Linking.openURL(url);
                                            }}
                                        >
                                            <Ionicons name="globe-outline" size={16} color={C.indigo} />
                                            <Text style={[sk.companyStatText, { color: C.indigo }]}>{job.company.site}</Text>
                                            <Ionicons name="open-outline" size={12} color={C.indigo} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>

                        </Animated.View>
                    </ScrollView>

                    <View style={sk.footer}>
                        <View style={sk.footerLeft}>
                            <Text style={sk.footerSalaryLabel}>Salário</Text>
                            <Text style={sk.footerSalary}>{fmt.salary(job.salary)}</Text>
                        </View>

                        {job.alreadyApplied ? (
                            <View style={sk.doneBtn}>
                                <Ionicons name="checkmark-circle" size={18} color={C.green} />
                                <Text style={sk.doneBtnText}>Candidatura enviada</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                onPress={handleApply}
                                disabled={applying}
                                style={[sk.applyBtn, applying && sk.applyBtnDisabled]}
                                activeOpacity={0.85}
                                accessibilityRole="button"
                            >
                                {applying
                                    ? <ActivityIndicator color="#fff" size="small" />
                                    : (
                                        <>
                                            <Text style={sk.applyBtnText}>Candidatar-se</Text>
                                            <Ionicons name="arrow-forward" size={17} color="#fff" />
                                        </>
                                    )
                                }
                            </TouchableOpacity>
                        )}
                    </View>

                </View>
            </SafeAreaView>
        </View>
    );
}

function InfoCard({
    icon, label, value, highlight = false,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <View style={[sk.infoCard, highlight && sk.infoCardHighlight]}>
            <View style={[sk.infoCardIcon, highlight && sk.infoCardIconHighlight]}>
                <Ionicons name={icon} size={16} color={highlight ? C.orange : C.text2} />
            </View>
            <Text style={[sk.infoCardLabel, highlight && sk.infoCardLabelHighlight]}>{label}</Text>
            <Text style={[sk.infoCardValue, highlight && sk.infoCardValueHighlight]} numberOfLines={1}>{value}</Text>
        </View>
    );
}

const sk = StyleSheet.create({

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    topBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: 'rgba(249,115,22,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(249,115,22,0.45)',
    },

    hero: {
        backgroundColor: C.hero,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 28,
        gap: 14,
        overflow: 'hidden',
        position: 'relative',
    },
    heroGlow: {
        position: 'absolute',
        right: -40,
        top: -40,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: C.orangeGlow,
    },
    heroCompanyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    heroAvatar: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroAvatarText: {
        fontFamily: F.bold,
        fontSize: 18,
    },
    heroCompanyName: {
        fontFamily: F.semiBold,
        fontSize: 14,
        color: '#fff',
    },
    heroLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginTop: 2,
    },
    heroLocation: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.heroMuted,
    },
    appliedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: C.greenBg,
        borderRadius: 99,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: C.greenBorder,
    },
    appliedBadgeText: {
        fontFamily: F.semiBold,
        fontSize: 11,
        color: C.green,
    },
    heroTitle: {
        fontFamily: F.bold,
        fontSize: 26,
        color: '#fff',
        lineHeight: 34,
        letterSpacing: -0.4,
    },
    heroPills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 7,
    },
    heroMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 2,
    },
    heroMetaText: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.heroMuted,
    },
    heroDot: {
        width: 3,
        height: 3,
        borderRadius: 99,
        backgroundColor: C.heroMuted,
    },

    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 11,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
    },
    pillText: {
        fontFamily: F.semiBold,
        fontSize: 12,
    },

    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        padding: 16,
        paddingTop: 20,
    },
    infoCard: {
        width: (SW - 42) / 2,
        backgroundColor: C.surface,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
        gap: 6,
    },
    infoCardHighlight: {
        backgroundColor: C.orangeLight,
        borderColor: C.orangeBorder,
    },
    infoCardIcon: {
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: C.surface2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoCardIconHighlight: {
        backgroundColor: 'rgba(249,115,22,0.12)',
    },
    infoCardLabel: {
        fontFamily: F.regular,
        fontSize: 11,
        color: C.muted,
        marginTop: 2,
    },
    infoCardLabelHighlight: {
        color: C.orangeDark,
        opacity: 0.75,
    },
    infoCardValue: {
        fontFamily: F.semiBold,
        fontSize: 14,
        color: C.text,
    },
    infoCardValueHighlight: {
        color: C.orangeDark,
        fontSize: 15,
    },

    // ── SEÇÕES ────────────────────────────────────────────────────────────────
    section: {
        paddingHorizontal: 20,
        paddingVertical: 4,
        gap: 12,
    },
    sectionHead: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitle: {
        fontFamily: F.bold,
        fontSize: 16,
        color: C.text,
    },
    sectionSub: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.muted,
    },
    divider: {
        height: 1,
        backgroundColor: C.border,
        marginHorizontal: 20,
        marginVertical: 20,
    },
    body: {
        fontFamily: F.regular,
        fontSize: 14,
        color: C.text2,
        lineHeight: 24,
    },
    expandBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        alignSelf: 'flex-start',
        marginTop: 2,
    },
    expandText: {
        fontFamily: F.semiBold,
        fontSize: 13,
        color: C.orange,
    },

    // ── BENEFÍCIOS ────────────────────────────────────────────────────────────
    benefitsGrid: {
        gap: 10,
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    benefitDot: {
        width: 22,
        height: 22,
        borderRadius: 7,
        backgroundColor: C.greenBg,
        borderWidth: 1,
        borderColor: C.greenBorder,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    benefitText: {
        fontFamily: F.medium,
        fontSize: 13,
        color: C.text,
        flex: 1,
    },

    // ── EMPRESA ───────────────────────────────────────────────────────────────
    companyCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: C.surface2,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.border,
        padding: 14,
    },
    companyCardAvatar: {
        width: 52,
        height: 52,
        borderRadius: 14,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    companyCardAvatarText: {
        fontFamily: F.bold,
        fontSize: 18,
    },
    companyCardName: {
        fontFamily: F.bold,
        fontSize: 15,
        color: C.text,
    },
    companyCardSub: {
        fontFamily: F.regular,
        fontSize: 12,
        color: C.muted,
        marginTop: 2,
    },
    companyStats: {
        gap: 10,
        marginTop: 4,
    },
    companyStat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    companyStatText: {
        fontFamily: F.medium,
        fontSize: 13,
        color: C.text2,
        flex: 1,
    },

    // ── RODAPÉ ────────────────────────────────────────────────────────────────
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: Platform.OS === 'ios' ? 30 : 18,
        backgroundColor: C.surface,
        borderTopWidth: 1,
        borderTopColor: C.border,
        shadowColor: '#0d1829',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 12,
    },
    footerLeft: {
        flex: 1,
        gap: 1,
    },
    footerSalaryLabel: {
        fontFamily: F.regular,
        fontSize: 11,
        color: C.muted,
    },
    footerSalary: {
        fontFamily: F.bold,
        fontSize: 20,
        color: C.orange,
        letterSpacing: -0.3,
    },
    applyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: C.orange,
        borderRadius: 14,
        paddingHorizontal: 22,
        height: 52,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 5,
    },
    applyBtnDisabled: {
        opacity: 0.6,
        shadowOpacity: 0,
        elevation: 0,
    },
    applyBtnText: {
        fontFamily: F.semiBold,
        fontSize: 15,
        color: '#fff',
        letterSpacing: 0.1,
    },
    doneBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: C.greenBg,
        borderRadius: 14,
        paddingHorizontal: 18,
        height: 52,
        borderWidth: 1.5,
        borderColor: C.greenBorder,
    },
    doneBtnText: {
        fontFamily: F.semiBold,
        fontSize: 14,
        color: C.green,
    },

    // ── ERRO ──────────────────────────────────────────────────────────────────
    errorWrap: {
        flex: 1,
        backgroundColor: C.bg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 32,
    },
    errorIcon: {
        width: 72,
        height: 72,
        borderRadius: 20,
        backgroundColor: C.orangeLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 4,
    },
    errorTitle: {
        fontFamily: F.bold,
        fontSize: 18,
        color: C.text,
    },
    errorSub: {
        fontFamily: F.regular,
        fontSize: 14,
        color: C.text2,
        textAlign: 'center',
        lineHeight: 22,
    },
    retryBtn: {
        marginTop: 8,
        paddingHorizontal: 28,
        paddingVertical: 13,
        borderRadius: 14,
        backgroundColor: C.orange,
        shadowColor: C.orange,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
        elevation: 4,
    },
    retryText: {
        fontFamily: F.semiBold,
        fontSize: 14,
        color: '#fff',
    },
});