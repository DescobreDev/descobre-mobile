import { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function RegisterConfirmScreen() {
  const router = useRouter();
  const { register } = useAuthStore();
  const params = useLocalSearchParams<{
    cpf: string;
    password: string;
    name: string;
    birthDate: string;
  }>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const { name } = await register({
        cpf: params.cpf,
        password: params.password,
        name: params.name,
        birthDate: params.birthDate || undefined,
      });

      Alert.alert('Bem-vindo!', `Cadastro realizado com sucesso, ${name}!`, [
        { text: 'Continuar', onPress: () => router.replace('/(onboarding)/step-disc') },
      ]);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[ORANGE, ORANGE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerBlobLarge} />
        <View style={styles.headerBlobSmall} />
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Feather name="user-check" size={32} color={ORANGE} />
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

        <TouchableOpacity onPress={handleConfirm} disabled={isSubmitting} activeOpacity={0.88} style={styles.btnShadowWrap}>
          <LinearGradient colors={[ORANGE, ORANGE_DARK]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.btnPrimary, isSubmitting && styles.btnDisabled]}>
            {isSubmitting ? <ActivityIndicator color="#fff" /> : (
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
    </View>
  );
}

const ORANGE = '#f97316';
const ORANGE_DARK = '#ea580c';
const SURFACE = '#ffffff';
const SURFACE_2 = '#f8fafc';
const BORDER = '#eef1f6';
const TEXT = '#0d1829';
const TEXT_2 = '#5a6a82';

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  header: { height: 120, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  headerBlobLarge: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.08)', top: -90, right: -60 },
  headerBlobSmall: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.10)', bottom: -50, left: -30 },
  content: { flex: 1, paddingHorizontal: 24, marginTop: -50 },
  iconWrap: { alignSelf: 'center', width: 72, height: 72, borderRadius: 24, backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center', marginBottom: 18, shadowColor: '#0d1829', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  title: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: TEXT, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: TEXT_2, lineHeight: 20, textAlign: 'center', fontFamily: 'Poppins_400Regular', paddingHorizontal: 8, marginBottom: 26 },
  card: { backgroundColor: SURFACE_2, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: BORDER, marginBottom: 28 },
  row: { paddingVertical: 6 },
  label: { fontSize: 11, fontFamily: 'Poppins_600SemiBold', color: TEXT_2, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  value: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: TEXT },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 10 },
  btnShadowWrap: { borderRadius: 14, shadowColor: ORANGE, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 14, elevation: 6, marginBottom: 12 },
  btnPrimary: { height: 54, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 15, fontFamily: 'Poppins_700Bold', color: '#fff' },
  btnSecondary: { alignItems: 'center', paddingVertical: 10 },
  btnSecondaryText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: TEXT_2 },
});