import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOnboardingStore } from '../../store/onBoardingStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  text: '#0d1829',
  text2: '#5a6a82',
  textMuted: '#9aaabb',
  surface: '#ffffff',
  green: '#10b981',
};

const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

const CONFETTI_COLORS = [
  '#f97316', '#10b981', '#6366f1', '#ec4899',
  '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
];

const PARTICLE_COUNT = 28;

interface Particle {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  rotate: Animated.Value;
  scale: Animated.Value;
  color: string;
  size: number;
  shape: 'circle' | 'rect';
  startX: number;
}

function createParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(0),
    rotate: new Animated.Value(0),
    scale: new Animated.Value(0),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: Math.random() * 8 + 6,
    shape: Math.random() > 0.5 ? 'circle' : 'rect',
    startX: (Math.random() - 0.5) * SCREEN_WIDTH * 1.2,
  }));
}

function Confetti() {
  const particles = useRef<Particle[]>(createParticles()).current;

  useEffect(() => {
    const animations = particles.map((p, i) => {
      const delay = i * 40;
      const duration = 900 + Math.random() * 600;
      const targetX = (Math.random() - 0.5) * SCREEN_WIDTH * 1.4;
      const targetY = SCREEN_HEIGHT * 0.55 + Math.random() * 200;

      return Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(p.opacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 1,
            duration: 200,
            easing: Easing.out(Easing.back(1.5)),
            useNativeDriver: true,
          }),
          Animated.timing(p.x, {
            toValue: targetX,
            duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(p.y, {
              toValue: targetY,
              duration,
              easing: Easing.in(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(p.rotate, {
            toValue: (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 5),
            duration,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(duration * 0.5),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: duration * 0.5,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]);
    });

    Animated.stagger(20, animations).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map((p, i) => {
        const rotate = p.rotate.interpolate({
          inputRange: [-10, 10],
          outputRange: ['-360deg', '360deg'],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: SCREEN_HEIGHT * 0.38,
              left: SCREEN_WIDTH / 2,
              width: p.size,
              height: p.shape === 'rect' ? p.size * 0.5 : p.size,
              borderRadius: p.shape === 'circle' ? p.size : 2,
              backgroundColor: p.color,
              opacity: p.opacity,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { rotate },
                { scale: p.scale },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

export default function OnboardingComplete() {
  const router = useRouter();
  const { reset } = useOnboardingStore();

  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const pillsY = useRef(new Animated.Value(20)).current;
  const pillsOpacity = useRef(new Animated.Value(0)).current;
  const btnY = useRef(new Animated.Value(24)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 80,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(checkOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(titleY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(subtitleY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(pillsY, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(pillsOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),

      Animated.parallel([
        Animated.spring(btnY, {
          toValue: 0,
          tension: 55,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(btnOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleGoHome = () => {
    reset();
    router.replace('_layout');
  };

  const HIGHLIGHTS = [
    { icon: 'briefcase-outline' as const, label: 'Vagas compatíveis' },
    { icon: 'notifications-outline' as const, label: 'Alertas de vagas' },
    { icon: 'chatbubble-outline' as const, label: 'Chat com empresas' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <Confetti />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.ringOuter,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        >
          <View style={styles.ringInner}>
            <Animated.View
              style={{
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              }}
            >
              <Ionicons name="checkmark" size={52} color={COLORS.orange} />
            </Animated.View>
          </View>
        </Animated.View>

        {/* ── TÍTULO ──────────────────────────────────────────────────────── */}
        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          Perfil criado!
        </Animated.Text>

        <Animated.Text
          style={[
            styles.subtitle,
            {
              opacity: subtitleOpacity,
              transform: [{ translateY: subtitleY }],
            },
          ]}
        >
          Seu perfil está pronto. Agora você pode descobrir vagas feitas para você e dar o próximo passo na sua carreira.
        </Animated.Text>

        <Animated.View
          style={[
            styles.pillsRow,
            {
              opacity: pillsOpacity,
              transform: [{ translateY: pillsY }],
            },
          ]}
        >
          {HIGHLIGHTS.map((item) => (
            <View key={item.label} style={styles.pill}>
              <Ionicons name={item.icon} size={16} color={COLORS.orange} />
              <Text style={styles.pillText}>{item.label}</Text>
            </View>
          ))}
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.footer,
          {
            opacity: btnOpacity,
            transform: [{ translateY: btnY }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleGoHome}
          style={styles.btn}
          activeOpacity={0.82}
          accessibilityRole="button"
          accessibilityLabel="Explorar vagas"
        >
          <Text style={styles.btnText}>Explorar vagas</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },

  // Anel do check
  ringOuter: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: COLORS.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    // Borda suave laranja
    borderWidth: 2,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  ringInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(249,115,22,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Textos
  title: {
    fontFamily: FONT.bold,
    fontSize: 32,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FONT.regular,
    fontSize: 15,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },

  // Pills
  pillsRow: {
    gap: 10,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.orangeLight,
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.2)',
  },
  pillText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.orangeDark,
  },

  // Botão
  footer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
  },
  btn: {
    backgroundColor: COLORS.orange,
    borderRadius: 14,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 5,
  },
  btnText: {
    fontFamily: FONT.semiBold,
    fontSize: 16,
    color: '#fff',
    letterSpacing: 0.2,
  },
});