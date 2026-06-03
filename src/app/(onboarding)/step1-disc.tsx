// app/(onboarding)/step1-disc.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { OnboardingHeader, COLORS, FONT, SPACING } from '../../components/onboarding/OnboardingHeader';
import { PrimaryButton } from '../../components/onboarding/PrimaryButton';
import { DiscOptionCard } from '../../components/disc/DiscOptionCard';
import { DiscResultCard } from '../../components/disc/DiscResultCard';
import { useOnboardingStore } from '../../store/onBoardingStore';
import { useDiscTest } from '../../hooks/useDiscTest';
import { DiscProfile } from '../../types/disc';

const PHASE_LABELS: Record<string, { title: string; subtitle: string }> = {
  q1: {
    title: 'Como você age?',
    subtitle: 'Escolha a resposta que mais combina com você de verdade.',
  },
  q2: {
    title: 'Mais uma situação',
    subtitle: 'Seja honesto — não existe resposta certa ou errada.',
  },
  q3_tiebreak: {
    title: 'Última pergunta',
    subtitle: 'Só mais uma para fechar seu perfil.',
  },
};

function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.welcomeScroll}
        showsVerticalScrollIndicator={false}
      >

        <Animated.View entering={FadeInDown.duration(400).delay(80)}>
          <Text style={styles.welcomeTitle}>Bem-vindo ao</Text>
          <Animated.View entering={FadeInDown.duration(400)} style={styles.logoWrap}>
            <View style={styles.logoPlaceholder}>
              <Image
                source={require('../../../assets/images/LOGO-DESCOBRE.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          </Animated.View>
          <Text style={styles.welcomeSub}>
            Em poucos passos, vamos montar o seu perfil completo para conectar você às melhores oportunidades.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.stepsCard}>
          <Text style={styles.stepsCardTitle}>O que vamos fazer agora</Text>

          {[
            { icon: 'person-circle-outline', color: '#6366f1', bg: '#eef2ff', text: 'Descobrir seu perfil comportamental' },
            { icon: 'heart-outline', color: '#f97316', bg: '#fff7ed', text: 'Mapear seus interesses profissionais' },
            { icon: 'star-outline', color: '#10b981', bg: '#ecfdf5', text: 'Entender suas prioridades de carreira' },
            { icon: 'document-text-outline', color: '#0ea5e9', bg: '#f0f9ff', text: 'Montar seu currículo guiado' },
          ].map((item, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(300).delay(200 + i * 60)}
              style={styles.stepRow}
            >
              <View style={[styles.stepIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={styles.stepText}>{item.text}</Text>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.border} />
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(500)} style={styles.timeBadge}>
          <Ionicons name="time-outline" size={15} color={COLORS.textMuted} />
          <Text style={styles.timeBadgeText}>Leva cerca de 3 a 5 minutos</Text>
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.duration(400).delay(300)} style={styles.footer}>
        <PrimaryButton label="Vamos começar !" onPress={onStart} />
      </Animated.View>
    </SafeAreaView>
  );
}

function DiscIntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.welcomeScroll}
        showsVerticalScrollIndicator={false}
      >

        <Animated.View entering={ZoomIn.duration(400)} style={styles.discIllustration}>
          <View style={styles.discCircleOuter}>
            <View style={styles.discCircleInner}>
              <Ionicons name="sparkles" size={40} color="#6366f1" />
            </View>
          </View>
          {[
            { icon: 'flash', color: '#ef4444', top: 0, left: '38%' },
            { icon: 'chatbubbles', color: '#f97316', top: '38%', right: 0 },
            { icon: 'analytics', color: '#6366f1', bottom: 0, left: '38%' },
            { icon: 'shield-checkmark', color: '#10b981', top: '38%', left: 0 },
          ].map((item, i) => (
            <Animated.View
              key={i}
              entering={ZoomIn.duration(300).delay(200 + i * 80)}
              style={[styles.discOrbit, item as any]}
            >
              <Ionicons name={item.icon as any} size={18} color={item.color} />
            </Animated.View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={styles.discIntroTitle}>Vamos te conhecer melhor</Text>
          <Text style={styles.discIntroSub}>
            Você vai responder <Text style={styles.discIntroBold}>2 situações do dia a dia.</Text>
            {'\n\n'}
            Não existe certo nem errado — apenas escolha o que você faria de verdade. Quanto mais honesto, melhor será a combinação com as vagas pra você.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(320)} style={styles.guarantees}>
          {[
            { icon: 'lock-closed-outline', text: 'Suas respostas são privadas' },
            { icon: 'flash-outline', text: 'Leva menos de 1 minuto' },
            { icon: 'shield-checkmark-outline', text: 'Perfil usado para recomendações mais precisas' }
          ].map((g, i) => (
            <View key={i} style={styles.guaranteeRow}>
              <Ionicons name={g.icon as any} size={16} color="#6366f1" />
              <Text style={styles.guaranteeText}>{g.text}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <Animated.View entering={FadeInUp.duration(400).delay(400)} style={styles.footer}>
        <PrimaryButton label="Descobrir meu perfil" onPress={onStart} />
      </Animated.View>
    </SafeAreaView>
  );
}

export default function Step1Disc() {
  const router = useRouter();
  const { currentStep, totalSteps, nextStep, setDiscCompleted } = useOnboardingStore();
  const { phase, q1, q2, q3, answerQ1, answerQ2, answerTiebreak, result } = useDiscTest();

  const [selectedOption, setSelectedOption] = useState<DiscProfile | null>(null);
  const [subPhase, setSubPhase] = useState<'welcome' | 'disc_intro' | 'test'>('welcome');

  const currentQuestion =
    phase === 'q1' ? q1 :
      phase === 'q2' ? q2 :
        phase === 'q3_tiebreak' ? q3 :
          null;

  const phaseLabel = PHASE_LABELS[phase];

  const handleConfirm = () => {
    if (!selectedOption) return;
    if (phase === 'q1' && q1) { answerQ1(q1.id, selectedOption); setSelectedOption(null); }
    else if (phase === 'q2' && q2) { answerQ2(q2.id, selectedOption); setSelectedOption(null); }
    else if (phase === 'q3_tiebreak' && q3) { answerTiebreak(selectedOption); setSelectedOption(null); }
  };

  const handleAdvance = () => {
    
    setDiscCompleted(true);
    nextStep();
    router.push('/(onboarding)/step2-interests');
  };

  if (subPhase === 'welcome') {
    return <WelcomeScreen onStart={() => setSubPhase('disc_intro')} />;
  }

  if (subPhase === 'disc_intro') {
    return <DiscIntroScreen onStart={() => setSubPhase('test')} />;
  }

  if (phase === 'loading') {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={COLORS.indigo} size="large" />
        <Text style={styles.loadingText}>Preparando suas perguntas...</Text>
      </SafeAreaView>
    );
  }

  console.log('PHASE:', phase);
  console.log('RESULT:', result);

  if (phase === 'result' && result) {
    return (
      <SafeAreaView style={styles.safe}>
        <OnboardingHeader
          currentStep={currentStep}
          totalSteps={totalSteps}
          title="Seu perfil comportamental"
          subtitle="Descubra como você age no dia a dia."
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInUp.duration(500)}>
            <View style={styles.resultHeader}>
              <Ionicons name="sparkles-outline" size={16} color="#92400e" />
              <Text style={styles.resultHeaderText}>Perfil identificado!</Text>
            </View>
            <Text style={styles.resultIntro}>
              Veja como seu jeito de agir se traduz em um perfil profissional único.
            </Text>
            <DiscResultCard profile={result.profileType} />

            <View style={styles.resultNote}>
              <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
              <Text style={styles.resultNoteText}>
                Esse perfil será usado para recomendar as vagas mais compatíveis com você.
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleAdvance} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingHeader
        currentStep={currentStep}
        totalSteps={totalSteps}
        title={phaseLabel?.title ?? 'Seu perfil'}
        subtitle={phaseLabel?.subtitle ?? ''}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(300)} style={styles.dots}>
          {['q1', 'q2'].map((p, i) => (
            <View
              key={p}
              style={[
                styles.dot,
                (phase === p || (phase === 'q3_tiebreak' && i === 1)) && styles.dotActive,
              ]}
            />
          ))}
        </Animated.View>

        {currentQuestion && (
          <Animated.View entering={FadeInDown.duration(350).delay(50)} key={phase}>
            <Text style={styles.questionText}>{currentQuestion.text}</Text>
            <View style={styles.options}>
              {currentQuestion.options.map((option, index) => (
                <DiscOptionCard
                  key={option.profile}
                  option={option}
                  selected={selectedOption === option.profile}
                  onPress={() => setSelectedOption(option.profile)}
                  index={index}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label="Confirmar"
          onPress={handleConfirm}
          disabled={!selectedOption}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface, },
  center: { alignItems: 'center', justifyContent: 'center' },

  welcomeScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  logoWrap: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  logoPlaceholder: {
    borderRadius: 22,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#c7d2fe',
  },

  welcomeTitle: {
    fontFamily: FONT.regular,
    fontSize: 26,
    color: COLORS.text2,
    textAlign: 'center',
  },

  welcomeBrand: {
    fontFamily: FONT.semiBold,
    fontSize: 34,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  welcomeSub: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },

  stepsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 4,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  stepsCardTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: SPACING.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 99,
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeBadgeText: {
    fontFamily: FONT.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },

  discIllustration: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: SPACING.xl,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discCircleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c7d2fe',
  },
  discCircleInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6366f1',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  discOrbit: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  discIntroTitle: {
    fontFamily: FONT.semiBold,
    fontSize: 26,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  discIntroSub: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  discIntroBold: {
    fontFamily: FONT.semiBold,
    color: COLORS.text,
  },
  guarantees: {
    gap: 12,
    backgroundColor: COLORS.surface2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
  },
  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guaranteeText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text2,
  },

  loadingText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },

  scroll: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#6366f1',
  },
  questionText: {
    fontFamily: FONT.semiBold,
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 26,
    marginBottom: SPACING.lg,
  },
  options: {
    gap: 2,
  },

  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fefce8',
    borderRadius: 99,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: SPACING.md,
  },
  resultHeaderText: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    color: '#92400e',
  },
  resultIntro: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text2,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  resultNote: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: COLORS.surface2,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  resultNoteText: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 13,
    color: COLORS.text2,
    lineHeight: 19,
  },
  footer: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  logo: {
    width: 250,
    height: 100,
    transform: [{
      scale: 2.7
    }],
  },
});