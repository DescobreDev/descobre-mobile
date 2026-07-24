import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { formatCpf, cleanCpf } from '../../utils/formatCpf';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [cpfFocused, setCpfFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleCpfChange = (value: string) => setCpf(formatCpf(value));

  const handleSubmit = async () => {
    if (cleanCpf(cpf).length !== 11) {
      Alert.alert('Atenção', 'Digite um CPF válido.');
      return;
    }
    if (!password) {
      Alert.alert('Atenção', 'Digite sua senha.');
      return;
    }
    try {
      await login({ cpf: cleanCpf(cpf), password });

      const user = useAuthStore.getState().candidate;

      if (!user?.profileCompleted) {
        router.replace('/(onboarding)/step-disc');
        return;
      }
      router.replace('/(app)/home');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[ORANGE, ORANGE_DARK]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerBlobLarge} />
        <View style={styles.headerBlobSmall} />
      </LinearGradient>

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.logoCard}>
          <Image
            source={require('../../../assets/images/LOGO-DESCOBRE.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Bem-vindo de volta</Text>
        </View>

        <Text style={styles.title}>Entrar na conta</Text>
        <Text style={styles.subtitle}>
          Digite seu CPF e senha para acessar sua conta.
        </Text>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <View style={[styles.inputWrap, cpfFocused && styles.inputWrapFocused]}>
              <View style={[styles.iconCircle, cpfFocused && styles.iconCircleFocused]}>
                <Feather
                  name="credit-card"
                  size={16}
                  color={cpfFocused ? '#fff' : ORANGE}
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="000.000.000-00"
                placeholderTextColor="#aab4c4"
                value={cpf}
                onChangeText={handleCpfChange}
                onFocus={() => setCpfFocused(true)}
                onBlur={() => setCpfFocused(false)}
                keyboardType="number-pad"
                maxLength={14}
                returnKeyType="next"
                autoComplete="off"
                importantForAutofill="no"
              />
            </View>
          </View>

          <View style={[styles.field, { marginBottom: 8 }]}>
            <Text style={styles.label}>Senha</Text>
            <View style={[styles.inputWrap, passFocused && styles.inputWrapFocused]}>
              <View style={[styles.iconCircle, passFocused && styles.iconCircleFocused]}>
                <Feather
                  name="lock"
                  size={16}
                  color={passFocused ? '#fff' : ORANGE}
                />
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="••••••••"
                placeholderTextColor="#aab4c4"
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
                secureTextEntry={!showPass}
                autoComplete="off"
                autoCorrect={false}
                autoCapitalize="none"
                importantForAutofill="no"
                textContentType="none"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={styles.eyeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPass ? 'eye-off' : 'eye'}
                  size={18}
                  color={TEXT_MUTED}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.88}
            style={styles.btnShadowWrap}
          >
            <LinearGradient
              colors={[ORANGE, ORANGE_DARK]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.btnPrimaryText}>Entrar</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#f97316';
const ORANGE_DARK = '#ea580c';
const ORANGE_LIGHT = '#fff7ed';
const ORANGE_BORDER = 'rgba(249,115,22,0.25)';
const SURFACE = '#ffffff';
const SURFACE_2 = '#f8fafc';
const BORDER = '#eef1f6';
const TEXT = '#0d1829';
const TEXT_2 = '#5a6a82';
const TEXT_MUTED = '#aab4c4';
const R_MD = 14;
const HEADER_HEIGHT = 150;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: SURFACE },
  header: {
    height: HEADER_HEIGHT,
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
  // A ScrollView vive DEPOIS do header no fluxo normal (não sobrepõe nada).
  scrollArea: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  logoCard: {
    alignSelf: 'center',
    backgroundColor: SURFACE,
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 18,
    marginTop: -55, // sobe por cima do header, só efeito visual, sem sobreposição de camadas
    marginBottom: 18,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 190,
    height: 78,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: ORANGE_LIGHT,
    borderWidth: 1,
    borderColor: ORANGE_BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: ORANGE },
  badgeText: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', color: ORANGE_DARK },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: TEXT,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_2,
    lineHeight: 21,
    marginBottom: 26,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: SURFACE,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#0d1829',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
  },
  field: { marginBottom: 18 },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: TEXT_2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: SURFACE_2,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: R_MD,
    paddingHorizontal: 10,
  },
  inputWrapFocused: {
    borderColor: ORANGE,
    backgroundColor: SURFACE,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: ORANGE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconCircleFocused: {
    backgroundColor: ORANGE,
  },
  input: { flex: 1, fontSize: 15, color: TEXT, fontFamily: 'Poppins_400Regular' },
  eyeBtn: { padding: 4, marginLeft: 4 },
  btnShadowWrap: {
    borderRadius: R_MD,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginTop: 4,
  },
  btnPrimary: {
    height: 54,
    borderRadius: R_MD,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnPrimaryText: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: '#fff', letterSpacing: 0.2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerText: { fontSize: 14, color: TEXT_MUTED, fontFamily: 'Poppins_400Regular' },
  footerLink: { fontSize: 14, color: ORANGE, fontFamily: 'Poppins_700Bold' },
});