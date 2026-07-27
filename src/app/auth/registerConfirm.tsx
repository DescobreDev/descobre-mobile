import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { redirectAfterAuth } from '../../utils/postAuthNavigation';
import { colors, typography, fontSize, radius, spacing } from '../../theme';
import { WelcomeModal } from '../../components/auth/WelcomeModal';

export default function RegisterConfirmScreen() {
  const router = useRouter();
  const { register, login } = useAuthStore();
  const params = useLocalSearchParams<{
    cpf: string;
    password: string;
    name: string;
    birthDate: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { name } = await register({
        cpf: params.cpf,
        password: params.password,
        name: params.name,
        birthDate: params.birthDate || undefined,
      });
      
      useAuthStore.getState().setPendingWelcome(true);
      await login({ cpf: params.cpf, password: params.password });

      setWelcomeName(name);
      setWelcomeVisible(true);
    } catch (error: any) {
      useAuthStore.getState().setPendingWelcome(false);
      Alert.alert('Erro', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProfile = () => {
    setWelcomeVisible(false);
    useAuthStore.getState().setPendingWelcome(false);
    redirectAfterAuth(router);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.orange, colors.orangeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBlobLarge} />
        <View style={styles.headerBlobSmall} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Feather name="user-check" size={32} color={colors.orange} />
        </View>

        <Text style={styles.title}>Confirme seus dados</Text>
        <Text style={styles.subtitle}>
          Encontramos essas informações vinculadas ao seu CPF. Confira se está tudo certo.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Nome completo</Text>
            <Text style={styles.value}>{params.name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Data de nascimento</Text>
            <Text style={styles.value}>{params.birthDate || 'Não informado'}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isSubmitting}
          activeOpacity={0.88}
          style={styles.btnShadowWrap}
        >
          <LinearGradient
            colors={[colors.orange, colors.orangeDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.btnPrimary, isSubmitting && styles.btnDisabled]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.btnPrimaryText}>Sim, esses são meus dados</Text>
                <Feather name="check" size={18} color="#fff" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting} style={styles.btnSecondary}>
          <Text style={styles.btnSecondaryText}>Não sou eu, corrigir CPF</Text>
        </TouchableOpacity>
      </View>

      <WelcomeModal visible={welcomeVisible} name={welcomeName} onCreateProfile={handleCreateProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    height: 120,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBlobLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -90,
    right: -60,
  },
  headerBlobSmall: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.10)',
    bottom: -50,
    left: -30,
  },
  content: { flex: 1, paddingHorizontal: spacing.xl, marginTop: -50 },
  iconWrap: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.fontBold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
    fontFamily: typography.fontRegular,
    paddingHorizontal: 8,
    marginBottom: 26,
  },
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 28,
  },
  row: { paddingVertical: 6 },
  label: {
    fontSize: 11,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  value: { fontSize: fontSize.lg, fontFamily: typography.fontSemiBold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  btnShadowWrap: {
    borderRadius: radius.md,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginBottom: 12,
  },
  btnPrimary: {
    height: 54,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: fontSize.md, fontFamily: typography.fontBold, color: '#fff' },
  btnSecondary: { alignItems: 'center', paddingVertical: 10 },
  btnSecondaryText: { fontSize: fontSize.sm, fontFamily: typography.fontSemiBold, color: colors.textSecondary },
});