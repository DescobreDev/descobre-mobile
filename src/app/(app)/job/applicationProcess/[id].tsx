import { api } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppAlert } from './AppAlert';
import { colors as C, fonts as F, radii as R } from './theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type ApplicationStatus = 'RECEBIDA' | 'ANALISE' | 'ENTREVISTA' | 'APROVADO' | 'REPROVADO' | 'DESISTIU';
type InterviewEventType = 'INVITE_SENT' | 'CONFIRMED' | 'DECLINED' | 'RESCHEDULED';

type InterviewEvent = {
  id: number;
  type: InterviewEventType;
  message?: string | null;
  note?: string | null;
  meetingLink?: string | null;
  address?: string | null;
  scheduledAt?: string | null;
  interviewType?: 'ONLINE' | 'PRESENCIAL' | null;
  proposedAt?: string | null;
  createdAt: string;
};

type HistoryEntry = {
  id: number;
  status: ApplicationStatus;
  actor: 'COMPANY' | 'CANDIDATE' | 'SYSTEM';
  note?: string | null;
  changedAt: string;
};

type ApplicationDetail = {
  id: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  compatibility: number;
  job: {
    id: number;
    title: string;
    description: string;
    workFormat: string;
    contractType: string;
    jobType: string;
    salary: number | null;
    city?: string | null;
    state?: string | null;
    benefits: string[];
    customBenefits: string[];
    company: { id: number; name: string; city?: string; state?: string; about?: string; site?: string };
  };
  history: HistoryEntry[];
  interviewEvents: InterviewEvent[];
};

const STEPS: { key: ApplicationStatus; label: string; icon: IconName }[] = [
  { key: 'RECEBIDA', label: 'Recebida', icon: 'checkmark-circle-outline' },
  { key: 'ANALISE', label: 'Em análise', icon: 'hourglass-outline' },
  { key: 'ENTREVISTA', label: 'Entrevista', icon: 'videocam-outline' },
  { key: 'APROVADO', label: 'Aprovado', icon: 'trophy-outline' },
];

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  RECEBIDA: 'Recebida',
  ANALISE: 'Em análise',
  ENTREVISTA: 'Entrevista',
  APROVADO: 'Aprovado',
  REPROVADO: 'Não aprovado',
  DESISTIU: 'Cancelada',
};

const STAGE_COPY: Partial<Record<ApplicationStatus, { title: string; body: string; icon: IconName }>> = {
  RECEBIDA: {
    title: 'Candidatura recebida',
    body: 'A empresa recebeu seu perfil e ele está na fila de avaliação.',
    icon: 'checkmark-done-outline',
  },
  ANALISE: {
    title: 'Em análise',
    body: 'Seu perfil está sendo avaliado pela empresa para essa vaga.',
    icon: 'hourglass-outline',
  },
  ENTREVISTA: {
    title: 'Fase de entrevista',
    body: 'A empresa quer conversar com você. Veja os detalhes abaixo.',
    icon: 'videocam-outline',
  },
};

function getReachedIndex(status: ApplicationStatus, history: HistoryEntry[]) {
  const order = STEPS.map((s) => s.key);
  const indices = history.map((h) => order.indexOf(h.status)).filter((i) => i >= 0);
  if (order.includes(status)) indices.push(order.indexOf(status));
  return indices.length ? Math.max(...indices) : 0;
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(dateStr?: string | null) {
  if (!dateStr) return '';
  const diffMin = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return 'há 1 dia';
  if (diffD < 30) return `há ${diffD} dias`;
  const diffM = Math.floor(diffD / 30);
  return `há ${diffM} ${diffM === 1 ? 'mês' : 'meses'}`;
}

function formatSalary(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

export default function ApplicationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { alert, AlertComponent } = useAppAlert();
  const insets = useSafeAreaInsets();

  const [data, setData] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [proposedDate, setProposedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<'date' | 'time' | null>(null);
  const [rescheduleNote, setRescheduleNote] = useState('');
  const [noteFocused, setNoteFocused] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setError(null);
      const { data: res } = await api.get(`/candidate/applications/${id}`);
      setData(res);
    } catch (e) {
      setError('Não foi possível carregar essa candidatura.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDetail();
  };

  const respond = async (status: 'CONFIRMED' | 'DECLINED' | 'RESCHEDULED', note?: string, proposedAt?: Date) => {
    try {
      setActionLoading(true);
      await api.patch(`/candidate/applications/${id}/interview-response`, {
        status,
        note,
        proposedAt: proposedAt?.toISOString(),
      });
      await fetchDetail();
    } catch (e) {
      alert('Ops', 'Não foi possível registrar sua resposta. Tente novamente.', undefined, {
        variant: 'danger',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = () => {
    alert(
      'Recusar entrevista',
      'Ao recusar, sua candidatura para esta vaga será encerrada. Deseja continuar?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Recusar', style: 'destructive', onPress: () => respond('DECLINED') },
      ],
      { variant: 'danger', icon: 'close-circle' },
    );
  };

  const handleConfirm = () => {
    alert(
      'Confirmar presença',
      'Deseja confirmar sua presença nessa entrevista?',
      [
        { text: 'Voltar', style: 'cancel' },
        { text: 'Confirmar', onPress: () => respond('CONFIRMED') },
      ],
      { variant: 'success', icon: 'checkmark-circle' },
    );
  };

  const handleSubmitReschedule = async () => {
    if (proposedDate.getTime() < Date.now()) {
      alert('Data inválida', 'Escolha uma data e horário no futuro.', undefined, { variant: 'warning' });
      return;
    }
    await respond('RESCHEDULED', rescheduleNote || undefined, proposedDate);
    setRescheduleVisible(false);
    setRescheduleNote('');
  };

  const handleCancelApplication = () => {
    alert(
      'Cancelar candidatura',
      'Tem certeza que deseja desistir dessa candidatura? Essa ação não pode ser desfeita.',
      [
        { text: 'Voltar', style: 'cancel' },
        {
          text: 'Desistir',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await api.patch(`/candidate/applications/${id}/cancel`);
              await fetchDetail();
            } catch (e) {
              alert('Ops', 'Não foi possível cancelar a candidatura.', undefined, { variant: 'danger' });
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
      { variant: 'danger', icon: 'trash' },
    );
  };

  if (loading) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.orange} />
          <Text style={styles.loadingText}>Carregando candidatura...</Text>
        </View>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={[styles.safe, { paddingTop: insets.top }]}>
        <Header title="Candidatura" onBack={() => router.back()} topInset={0} />
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="alert-circle" size={30} color={C.red} />
          </View>
          <Text style={styles.emptyTitle}>{error ?? 'Candidatura não encontrada'}</Text>
          <Text style={styles.emptyBody}>Verifique sua conexão e tente novamente.</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              setLoading(true);
              fetchDetail();
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="refresh" size={16} color={C.orange} />
            <Text style={styles.retryBtnText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const reachedIndex = getReachedIndex(data.status, data.history);
  const isTerminalNegative = data.status === 'REPROVADO' || data.status === 'DESISTIU';
  const isApproved = data.status === 'APROVADO';
  const canCancel = !isApproved && data.status !== 'DESISTIU' && data.status !== 'REPROVADO';

  const lastInterviewEvent = data.interviewEvents[data.interviewEvents.length - 1] as InterviewEvent | undefined;
  const inviteEvent = data.interviewEvents.find((e) => e.type === 'INVITE_SENT') as InterviewEvent | undefined;
  const awaitingCandidateResponse =
    data.status === 'ENTREVISTA' && lastInterviewEvent?.type === 'INVITE_SENT';
  const awaitingCompanyConfirmation =
    data.status === 'ENTREVISTA' && lastInterviewEvent?.type === 'RESCHEDULED';
  const candidateConfirmed = data.status === 'ENTREVISTA' && lastInterviewEvent?.type === 'CONFIRMED';

  return (
    <View style={styles.safe}>
      <Header
        title={data.job.title}
        subtitle={data.job.company.name}
        statusLabel={STATUS_LABELS[data.status]}
        updatedLabel={timeAgo(data.updatedAt)}
        onBack={() => router.back()}
        topInset={insets.top}
        variant={isApproved ? 'success' : isTerminalNegative ? 'muted' : 'default'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.orange} colors={[C.orange]} />}
        showsVerticalScrollIndicator={false}
      >
        {isApproved ? (
          <ApprovedCard companyName={data.job.company.name} />
        ) : (
          <>
            {isTerminalNegative && (
              <View
                style={[
                  styles.terminalBanner,
                  { backgroundColor: data.status === 'REPROVADO' ? C.redLight : C.surface2 },
                ]}
              >
                <View
                  style={[
                    styles.terminalIconCircle,
                    { backgroundColor: data.status === 'REPROVADO' ? '#fde0e0' : C.border },
                  ]}
                >
                  <Ionicons
                    name={data.status === 'REPROVADO' ? 'close-circle' : 'exit-outline'}
                    size={16}
                    color={data.status === 'REPROVADO' ? C.red : C.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.terminalBannerText,
                    { color: data.status === 'REPROVADO' ? C.red : C.textMuted },
                  ]}
                >
                  {data.status === 'REPROVADO'
                    ? 'Você não foi selecionado para esta vaga desta vez.'
                    : 'Você cancelou esta candidatura.'}
                </Text>
              </View>
            )}

            <Timeline reachedIndex={reachedIndex} interrupted={isTerminalNegative} />

            <StageInfo status={data.status} compatibility={data.compatibility} interrupted={isTerminalNegative} />

            {data.status === 'ENTREVISTA' && inviteEvent && (
              <InterviewCard
                event={inviteEvent}
                awaitingCandidateResponse={awaitingCandidateResponse}
                awaitingCompanyConfirmation={awaitingCompanyConfirmation}
                candidateConfirmed={candidateConfirmed}
                actionLoading={actionLoading}
                onConfirm={handleConfirm}
                onDecline={handleDecline}
                onReschedule={() => {
                  setProposedDate(new Date());
                  setRescheduleVisible(true);
                }}
              />
            )}
          </>
        )}

        <JobSummary job={data.job} />

        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelApplication} disabled={actionLoading} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={17} color={C.red} />
            <Text style={styles.cancelBtnText}>Desistir da candidatura</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <RescheduleSheet
        visible={rescheduleVisible}
        proposedDate={proposedDate}
        setProposedDate={setProposedDate}
        showPicker={showPicker}
        setShowPicker={setShowPicker}
        note={rescheduleNote}
        setNote={setRescheduleNote}
        noteFocused={noteFocused}
        setNoteFocused={setNoteFocused}
        loading={actionLoading}
        onClose={() => setRescheduleVisible(false)}
        onSubmit={handleSubmitReschedule}
      />

      {AlertComponent}
    </View>
  );
}

/* ----------------------------- Header ----------------------------- */

type HeaderVariant = 'default' | 'success' | 'muted';

const HEADER_GRADIENTS: Record<HeaderVariant, [string, string]> = {
  default: [C.orange, C.orangeDark],
  success: [C.green, C.greenDark],
  muted: ['#8b93a3', '#5a6a82'],
};

function Header({
  title,
  subtitle,
  statusLabel,
  updatedLabel,
  onBack,
  topInset,
  variant = 'default',
}: {
  title: string;
  subtitle?: string;
  statusLabel?: string;
  updatedLabel?: string;
  onBack: () => void;
  topInset: number;
  variant?: HeaderVariant;
}) {
  return (
    <View style={styles.headerShadowWrap}>
      <LinearGradient
        colors={HEADER_GRADIENTS[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 10 }]}
      >
        <View style={styles.headerBlob} />
        <View style={styles.headerBlobSmall} />

        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {title}
            </Text>
            {!!subtitle && (
              <Text style={styles.headerSub} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {!!statusLabel && (
          <View style={styles.headerStatusPill}>
            <View style={styles.headerStatusDot} />
            <Text style={styles.headerStatusText}>
              {statusLabel}
              {updatedLabel ? ` · atualizado ${updatedLabel}` : ''}
            </Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ---------------------------- Timeline ---------------------------- */

function Timeline({ reachedIndex, interrupted }: { reachedIndex: number; interrupted: boolean }) {
  return (
    <View style={styles.timelineCard}>
      <View style={styles.timelineRow}>
        {STEPS.map((step, i) => {
          const isInterruptedCurrent = interrupted && i === reachedIndex;
          const active = i <= reachedIndex;
          const dotColor = isInterruptedCurrent ? C.red : active ? C.orange : C.border;

          return (
            <React.Fragment key={step.key}>
              <View style={styles.timelineStep}>
                <View
                  style={[
                    styles.timelineDot,
                    { borderColor: dotColor, backgroundColor: active ? dotColor : C.surface },
                    i === reachedIndex && !interrupted && styles.timelineDotCurrent,
                  ]}
                >
                  <Ionicons
                    name={isInterruptedCurrent ? 'close' : step.icon}
                    size={16}
                    color={active ? '#fff' : C.textMuted}
                  />
                </View>
                <Text
                  style={[
                    styles.timelineLabel,
                    active && styles.timelineLabelActive,
                    isInterruptedCurrent && { color: C.red },
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.timelineConnector, { backgroundColor: i < reachedIndex ? C.orange : C.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

function StageInfo({
  status,
  compatibility,
  interrupted,
}: {
  status: ApplicationStatus;
  compatibility: number;
  interrupted: boolean;
}) {
  if (interrupted) return null;
  const info = STAGE_COPY[status];
  if (!info) return null;

  return (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <View style={styles.infoIconCircle}>
          <Ionicons name={info.icon} size={19} color={C.orangeDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>{info.title}</Text>
          <Text style={styles.infoBody}>{info.body}</Text>
        </View>
      </View>
    </View>
  );
}

function InterviewCard({
  event,
  awaitingCandidateResponse,
  awaitingCompanyConfirmation,
  candidateConfirmed,
  actionLoading,
  onConfirm,
  onDecline,
  onReschedule,
}: {
  event: InterviewEvent;
  awaitingCandidateResponse: boolean;
  awaitingCompanyConfirmation: boolean;
  candidateConfirmed: boolean;
  actionLoading: boolean;
  onConfirm: () => void;
  onDecline: () => void;
  onReschedule: () => void;
}) {
  return (
    <View style={styles.interviewCard}>
      <View style={styles.interviewHeader}>
        <View style={styles.interviewIconCircle}>
          <Ionicons name="videocam" size={17} color="#fff" />
        </View>
        <Text style={styles.interviewHeaderText}>Convite para entrevista</Text>
      </View>

      {!!event.message && <Text style={styles.interviewMessage}>{event.message}</Text>}

      <View style={styles.interviewDetailRow}>
        <Ionicons name="calendar-outline" size={16} color={C.text2} />
        <Text style={styles.interviewDetailText}>{formatDateTime(event.scheduledAt)}</Text>
      </View>
      <View style={styles.interviewDetailRow}>
        <Ionicons name={event.interviewType === 'ONLINE' ? 'laptop-outline' : 'location-outline'} size={16} color={C.text2} />
        <Text style={styles.interviewDetailText}>
          {event.interviewType === 'ONLINE' ? 'Entrevista online' : 'Entrevista presencial'}
        </Text>
      </View>

      {event.interviewType === 'ONLINE' && !!event.meetingLink && (
        <TouchableOpacity
          onPress={() => Linking.openURL(event.meetingLink as string)}
          style={styles.interviewDetailRow}
          activeOpacity={0.7}
        >
          <Ionicons name="link-outline" size={16} color={C.indigo} />
          <Text style={styles.interviewLink} numberOfLines={1}>
            {event.meetingLink}
          </Text>
        </TouchableOpacity>
      )}
      {event.interviewType === 'PRESENCIAL' && !!event.address && (
        <View style={styles.interviewDetailRow}>
          <Ionicons name="navigate-outline" size={16} color={C.text2} />
          <Text style={styles.interviewDetailText}>{event.address}</Text>
        </View>
      )}

      {awaitingCandidateResponse && (
        <View style={styles.interviewActions}>
          <TouchableOpacity style={[styles.interviewBtn, styles.interviewBtnPrimary]} onPress={onConfirm} disabled={actionLoading} activeOpacity={0.85}>
            <Ionicons name="checkmark" size={16} color="#fff" />
            <Text style={styles.interviewBtnPrimaryText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.interviewBtn, styles.interviewBtnGhost]} onPress={onReschedule} disabled={actionLoading} activeOpacity={0.85}>
            <Ionicons name="calendar-outline" size={16} color={C.text} />
            <Text style={styles.interviewBtnGhostText}>Remarcar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.interviewBtn, styles.interviewBtnDanger]} onPress={onDecline} disabled={actionLoading} activeOpacity={0.85}>
            <Ionicons name="close" size={16} color={C.red} />
            <Text style={styles.interviewBtnDangerText}>Recusar</Text>
          </TouchableOpacity>
        </View>
      )}

      {candidateConfirmed && (
        <View style={styles.statusPill}>
          <Ionicons name="checkmark-circle" size={17} color={C.green} />
          <Text style={[styles.statusPillText, { color: C.green }]}>Presença confirmada</Text>
        </View>
      )}

      {awaitingCompanyConfirmation && (
        <View style={styles.statusPill}>
          <Ionicons name="time" size={17} color={C.yellow} />
          <Text style={[styles.statusPillText, { color: C.yellowDark }]}>Nova data proposta — aguardando a empresa</Text>
        </View>
      )}
    </View>
  );
}

/* --------------------------- Approved card --------------------------- */
/* Explosão de celebração feita só com Animated (sem libs novas):
   - anéis pulsantes atrás do troféu
   - troféu entra com bounce elástico
   - 14 confetes disparados em leque, caindo com rotação          */

const CONFETTI_COLORS = [C.orange, C.green, C.indigo, C.yellow, C.red, C.orangeDark];
const CONFETTI_COUNT = 14;

type Particle = {
  angle: Animated.Value;
  progress: Animated.Value;
  spin: Animated.Value;
  color: string;
  distance: number;
  size: number;
  isSquare: boolean;
  startAngleDeg: number;
};

function useConfetti() {
  const particles = useRef<Particle[]>(
    Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
      const spread = 220; // arco de disparo, tipo um leque virado pra cima
      const base = -90 - spread / 2;
      const startAngleDeg = base + (spread / (CONFETTI_COUNT - 1)) * i + (Math.random() * 14 - 7);
      return {
        angle: new Animated.Value(0),
        progress: new Animated.Value(0),
        spin: new Animated.Value(0),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        distance: 90 + Math.random() * 70,
        size: 6 + Math.random() * 5,
        isSquare: Math.random() > 0.5,
        startAngleDeg,
      };
    }),
  ).current;

  const fire = useCallback(() => {
    particles.forEach((p, i) => {
      p.progress.setValue(0);
      p.spin.setValue(0);
      Animated.parallel([
        Animated.timing(p.progress, {
          toValue: 1,
          duration: 950 + Math.random() * 350,
          delay: i * 14,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(p.spin, {
          toValue: 1,
          duration: 1100 + Math.random() * 400,
          delay: i * 14,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [particles]);

  return { particles, fire };
}

function ConfettiBurst({ particles }: { particles: Particle[] }) {
  return (
    <View style={styles.confettiLayer} pointerEvents="none">
      {particles.map((p, i) => {
        const rad = (p.startAngleDeg * Math.PI) / 180;
        const dx = Math.cos(rad) * p.distance;
        const dy = Math.sin(rad) * p.distance;

        const translateX = p.progress.interpolate({ inputRange: [0, 1], outputRange: [0, dx] });
        const translateY = p.progress.interpolate({
          inputRange: [0, 0.55, 1],
          outputRange: [0, dy, dy + 70],
        });
        const opacity = p.progress.interpolate({ inputRange: [0, 0.1, 0.75, 1], outputRange: [0, 1, 1, 0] });
        const scale = p.progress.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 1, 0.8] });
        const rotate = p.spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${360 + Math.random() * 360}deg`] });

        return (
          <Animated.View
            key={i}
            style={[
              styles.confettiPiece,
              {
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                borderRadius: p.isSquare ? 2 : p.size / 2,
                opacity,
                transform: [{ translateX }, { translateY }, { rotate }, { scale }],
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function ApprovedCard({ companyName }: { companyName: string }) {
  const { particles, fire } = useConfetti();

  const trophyScale = useRef(new Animated.Value(0)).current;
  const trophyRotate = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(14)).current;
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fire();

    Animated.sequence([
      Animated.delay(80),
      Animated.parallel([
        Animated.spring(trophyScale, {
          toValue: 1,
          friction: 4.5,
          tension: 140,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(trophyRotate, { toValue: 1, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(trophyRotate, { toValue: -1, duration: 180, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(trophyRotate, { toValue: 0, duration: 140, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]),
    ]).start();

    Animated.timing(contentFade, { toValue: 1, duration: 500, delay: 260, useNativeDriver: true }).start();
    Animated.timing(contentSlide, { toValue: 0, duration: 500, delay: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();

    const pulse = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(val, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          ]),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      );
    const loop1 = pulse(ring1, 300);
    const loop2 = pulse(ring2, 1100);
    loop1.start();
    loop2.start();

    return () => {
      loop1.stop();
      loop2.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ringStyle = (val: Animated.Value) => ({
    opacity: val.interpolate({ inputRange: [0, 0.2, 1], outputRange: [0, 0.5, 0] }),
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
  });

  const rotateStr = trophyRotate.interpolate({ inputRange: [-1, 0, 1], outputRange: ['-14deg', '0deg', '14deg'] });

  return (
    <View style={styles.approvedWrap}>
      <View style={styles.approvedStage}>
        <ConfettiBurst particles={particles} />

        <Animated.View style={[styles.approvedRing, ringStyle(ring1)]} />
        <Animated.View style={[styles.approvedRing, ringStyle(ring2)]} />

        <Animated.View style={{ transform: [{ scale: trophyScale }, { rotate: rotateStr }] }}>
          <LinearGradient colors={[C.green, C.greenDark]} style={styles.approvedIconCircle}>
            <Ionicons name="trophy" size={38} color="#fff" />
          </LinearGradient>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }], alignItems: 'center', gap: 8 }}>
        <Text style={styles.approvedTitle}>Parabéns, você foi aprovado! 🎉</Text>
        <Text style={styles.approvedBody}>
          A {companyName} decidiu seguir com você e vai entrar em contato para os próximos passos.
        </Text>
        <View style={styles.approvedTip}>
          <Ionicons name="information-circle" size={17} color={C.indigo} />
          <Text style={styles.approvedTipText}>Fique de olho no telefone e no e-mail nos próximos dias.</Text>
        </View>
      </Animated.View>
    </View>
  );
}

/* ---------------------------- Job summary ---------------------------- */

function Tag({ icon, label }: { icon: IconName; label: string }) {
  return (
    <View style={styles.jobTag}>
      <Ionicons name={icon} size={12.5} color={C.text2} />
      <Text style={styles.jobTagText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function JobSummary({ job }: { job: ApplicationDetail['job'] }) {
  return (
    <View style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <View style={styles.jobIconCircle}>
          <Ionicons name="briefcase" size={17} color={C.indigo} />
        </View>
        <Text style={styles.jobCardTitle}>Sobre a vaga</Text>
      </View>
      <Text style={styles.jobCardDesc} numberOfLines={4}>
        {job.description}
      </Text>
      <View style={styles.jobCardTags}>
        <Tag icon="laptop-outline" label={job.workFormat} />
        <Tag icon="document-text-outline" label={job.contractType} />
        {!!job.city && <Tag icon="location-outline" label={`${job.city}${job.state ? `/${job.state}` : ''}`} />}
        {job.salary != null && <Tag icon="cash-outline" label={formatSalary(job.salary)} />}
      </View>
    </View>
  );
}

/* -------------------------- Reschedule sheet -------------------------- */

function RescheduleSheet({
  visible,
  proposedDate,
  setProposedDate,
  showPicker,
  setShowPicker,
  note,
  setNote,
  noteFocused,
  setNoteFocused,
  loading,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  proposedDate: Date;
  setProposedDate: React.Dispatch<React.SetStateAction<Date>>;
  showPicker: 'date' | 'time' | null;
  setShowPicker: (v: 'date' | 'time' | null) => void;
  note: string;
  setNote: (v: string) => void;
  noteFocused: boolean;
  setNoteFocused: (v: boolean) => void;
  loading: boolean;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetIconCircle}>
                <Ionicons name="calendar" size={19} color={C.orangeDark} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Propor nova data</Text>
                <Text style={styles.sheetSub}>A empresa confirma ou entra em contato com você</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close" size={22} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow2}>
              <TouchableOpacity style={styles.pickerPill} onPress={() => setShowPicker('date')} activeOpacity={0.85}>
                <View style={styles.pickerIconCircle}>
                  <Ionicons name="calendar-outline" size={16} color={C.orange} />
                </View>
                <Text style={styles.pickerPillText}>{proposedDate.toLocaleDateString('pt-BR')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerPill} onPress={() => setShowPicker('time')} activeOpacity={0.85}>
                <View style={styles.pickerIconCircle}>
                  <Ionicons name="time-outline" size={16} color={C.orange} />
                </View>
                <Text style={styles.pickerPillText}>
                  {proposedDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>

            {showPicker && (
              <DateTimePicker
                value={proposedDate}
                mode={showPicker}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, selected) => {
                  setShowPicker(null);
                  if (!selected) return;
                  setProposedDate((prev) => {
                    const next = new Date(prev);
                    if (showPicker === 'date') {
                      next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
                    } else {
                      next.setHours(selected.getHours(), selected.getMinutes());
                    }
                    return next;
                  });
                }}
              />
            )}

            <Text style={styles.fieldLabel}>Mensagem (opcional)</Text>
            <View style={[styles.noteWrap, noteFocused && styles.noteWrapFocused]}>
              <TextInput
                style={styles.noteInput}
                placeholder="Escreva algo pra empresa, se quiser"
                placeholderTextColor={C.textMuted}
                value={note}
                onChangeText={setNote}
                onFocus={() => setNoteFocused(true)}
                onBlur={() => setNoteFocused(false)}
                multiline
              />
            </View>

            <View style={styles.sheetActions}>
              <TouchableOpacity style={[styles.sheetBtn, styles.sheetBtnGhost]} onPress={onClose} activeOpacity={0.85}>
                <Text style={styles.sheetBtnGhostText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.sheetBtnPrimaryWrap} onPress={onSubmit} disabled={loading} activeOpacity={0.88}>
                <LinearGradient colors={[C.orange, C.orangeDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sheetBtnPrimary}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={styles.sheetBtnPrimaryText}>Enviar proposta</Text>
                      <Ionicons name="arrow-forward" size={16} color="#fff" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ------------------------------- Styles ------------------------------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.surface2 },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10 },
  loadingText: { fontFamily: F.regular, fontSize: 14.5, color: C.textMuted },

  // Header — shadow por fora do overflow:hidden, igual ao padrão de referência
  headerShadowWrap: {
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 6,
  },
  header: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerBlob: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.09)',
    top: -80,
    right: -50,
  },
  headerBlobSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -40,
    left: -20,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontFamily: F.bold, fontSize: 20, color: '#fff' },
  headerSub: { fontFamily: F.regular, fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  headerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: R.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginTop: 14,
    marginLeft: 48,
  },
  headerStatusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff' },
  headerStatusText: { fontFamily: F.medium, fontSize: 12.5, color: '#fff' },

  // Scroll — flex:1 explícito corrige o comportamento de "altura infinita"
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 12, paddingBottom: 40, flexGrow: 1 },

  // Terminal banner
  terminalBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: R.md },
  terminalIconCircle: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  terminalBannerText: { fontFamily: F.medium, fontSize: 14.5, flex: 1, lineHeight: 19 },

  // Timeline
  timelineCard: {
    backgroundColor: C.surface,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.border,
    padding: 18,
  },
  timelineRow: { flexDirection: 'row', alignItems: 'flex-start' },
  timelineStep: { alignItems: 'center', width: 62 },
  timelineDot: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCurrent: {
    shadowColor: C.orange,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  timelineConnector: { flex: 1, height: 2, marginTop: 16, borderRadius: 1 },
  timelineLabel: { fontFamily: F.medium, fontSize: 12, color: C.textMuted, marginTop: 6, textAlign: 'center' },
  timelineLabelActive: { fontFamily: F.semiBold, color: C.text },

  // Stage info
  infoCard: { backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 16, gap: 12 },
  infoHeader: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: C.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: { fontFamily: F.semiBold, fontSize: 16.5, color: C.text, marginBottom: 2 },
  infoBody: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, lineHeight: 20 },

  // Interview card
  interviewCard: {
    backgroundColor: C.orangeLight,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    padding: 16,
    gap: 6,
  },
  interviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  interviewIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: C.orangeDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interviewHeaderText: { fontFamily: F.semiBold, fontSize: 16.5, color: C.orangeDark },
  interviewMessage: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, lineHeight: 20, marginBottom: 4 },
  interviewDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 3 },
  interviewDetailText: { fontFamily: F.medium, fontSize: 14, color: C.text },
  interviewLink: { fontFamily: F.semiBold, fontSize: 14, color: C.indigo },
  interviewActions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  interviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: R.sm,
  },
  interviewBtnPrimary: { backgroundColor: C.orangeDark },
  interviewBtnPrimaryText: { fontFamily: F.semiBold, fontSize: 14, color: '#fff' },
  interviewBtnGhost: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  interviewBtnGhostText: { fontFamily: F.semiBold, fontSize: 14, color: C.text },
  interviewBtnDanger: { backgroundColor: '#fde3e3' },
  interviewBtnDangerText: { fontFamily: F.semiBold, fontSize: 14, color: C.red },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  statusPillText: { fontFamily: F.medium, fontSize: 14 },

  // Approved card + celebração
  approvedWrap: {
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 28,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 4,
    overflow: 'hidden',
  },
  approvedStage: {
    width: 200,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confettiPiece: {
    position: 'absolute',
  },
  approvedRing: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: C.green,
  },
  approvedIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.greenDark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  approvedTitle: { fontFamily: F.bold, fontSize: 22, color: C.text, textAlign: 'center' },
  approvedBody: { fontFamily: F.regular, fontSize: 15, color: C.text2, textAlign: 'center', lineHeight: 21 },
  approvedTip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.indigoLight,
    padding: 11,
    borderRadius: R.sm,
    marginTop: 10,
  },
  approvedTipText: { fontFamily: F.medium, fontSize: 13, color: C.indigoDark, flex: 1 },

  // Job summary
  jobCard: { backgroundColor: C.surface, borderRadius: R.md, borderWidth: 1, borderColor: C.border, padding: 16, gap: 10 },
  jobCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  jobIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: C.indigoLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobCardTitle: { fontFamily: F.semiBold, fontSize: 16.5, color: C.text },
  jobCardDesc: { fontFamily: F.regular, fontSize: 14.5, color: C.text2, lineHeight: 20 },
  jobCardTags: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  jobTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.surface2,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  jobTagText: { fontFamily: F.medium, fontSize: 13, color: C.text2 },

  // Cancel
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 4,
  },
  cancelBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: C.red },

  // Empty / error state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 36, gap: 8 },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: C.redLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontFamily: F.semiBold, fontSize: 17.5, color: C.text, textAlign: 'center' },
  emptyBody: { fontFamily: F.regular, fontSize: 14.5, color: C.textMuted, textAlign: 'center', marginBottom: 10 },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.orangeBorder,
    backgroundColor: C.orangeLight,
    borderRadius: R.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryBtnText: { fontFamily: F.semiBold, fontSize: 14.5, color: C.orangeDark },

  // Reschedule sheet
  modalOverlay: { flex: 1, backgroundColor: 'rgba(13,24,41,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: R.lg,
    borderTopRightRadius: R.lg,
    padding: 20,
    paddingBottom: 28,
    gap: 12,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sheetIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: C.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: { fontFamily: F.bold, fontSize: 18, color: C.text },
  sheetSub: { fontFamily: F.regular, fontSize: 13, color: C.textMuted, marginTop: 1 },
  pickerRow2: { flexDirection: 'row', gap: 10 },
  pickerPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    borderRadius: R.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pickerIconCircle: {
    width: 27,
    height: 27,
    borderRadius: 9,
    backgroundColor: C.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerPillText: { fontFamily: F.medium, fontSize: 14, color: C.text },
  fieldLabel: {
    fontFamily: F.semiBold,
    fontSize: 12,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  noteWrap: {
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface2,
    borderRadius: R.sm,
    padding: 4,
  },
  noteWrapFocused: { borderColor: C.orange, backgroundColor: C.surface },
  noteInput: {
    minHeight: 72,
    fontFamily: F.regular,
    fontSize: 15,
    color: C.text,
    textAlignVertical: 'top',
    padding: 10,
  },
  sheetActions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  sheetBtn: { flex: 1, borderRadius: R.sm, height: 50, alignItems: 'center', justifyContent: 'center' },
  sheetBtnGhost: { backgroundColor: C.surface2 },
  sheetBtnGhostText: { fontFamily: F.semiBold, fontSize: 15, color: C.text2 },
  sheetBtnPrimaryWrap: { flex: 1.4, borderRadius: R.sm, overflow: 'hidden' },
  sheetBtnPrimary: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sheetBtnPrimaryText: { fontFamily: F.semiBold, fontSize: 15, color: '#fff' },
});