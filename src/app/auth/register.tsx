import { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { formatCpf, cleanCpf } from '../../utils/formatCpf';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const handleCpfChange = (value: string) => {
    setCpf(formatCpf(value));
  };

  const handleSubmit = async () => {
    if (cleanCpf(cpf).length !== 11) {
      Alert.alert('Atenção', 'Digite um CPF válido.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    try {
      const { name } = await register({
        cpf: cleanCpf(cpf),
        password,
      });

      Alert.alert(
        'Bem-vindo!',
        `Cadastro realizado com sucesso, ${name}!`,
        [
          {
            text: 'Entrar agora',
            onPress: () => router.replace('/auth/login'),
          },
        ],
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.scroll}>

        <View>
          <Image
            source={require('../../../assets/images/LOGO-DESCOBRE.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>Crie sua conta</Text>
        </View>

        <Text style={styles.title}>Cadastrar</Text>

        <Text style={styles.subtitle}>
          Seus dados serão preenchidos automaticamente pelo CPF.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>CPF</Text>

          <View style={styles.inputWrap}>
            <View pointerEvents="none">
              <Text style={styles.inputIcon}>🪪</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#9aaabb"
              value={cpf}
              onChangeText={handleCpfChange}
              keyboardType="number-pad"
              maxLength={14}
              returnKeyType="done"
              autoComplete="off"
              importantForAutofill="no"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha</Text>

          <View style={styles.inputWrap}>
            <View pointerEvents="none">
              <Text style={styles.inputIcon}>🔒</Text>
            </View>

            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9aaabb"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              importantForAutofill="no"
              textContentType="none"
            />

            <TouchableOpacity
              onPress={() => setShowPass(!showPass)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>
                {showPass ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar senha</Text>

          <View style={styles.inputWrap}>
            <View pointerEvents="none">
              <Text style={styles.inputIcon}>🔐</Text>
            </View>

            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="••••••••"
              placeholderTextColor="#9aaabb"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPass}
              autoComplete="off"
              autoCorrect={false}
              autoCapitalize="none"
              importantForAutofill="no"
              textContentType="none"
            />

            <TouchableOpacity
              onPress={() => setShowConfirmPass(!showConfirmPass)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeIcon}>
                {showConfirmPass ? '🙈' : '👁️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btnPrimary, isLoading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Cadastrar</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já possui conta? </Text>

          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const ORANGE = '#f97316';
const ORANGE_DARK = '#ea580c';
const ORANGE_LIGHT = '#fff7ed';
const ORANGE_BORDER = 'rgba(249,115,22,0.3)';
const SURFACE = '#ffffff';
const SURFACE_2 = '#f8fafc';
const BORDER = '#e9ecf2';
const TEXT = '#0d1829';
const TEXT_2 = '#5a6a82';
const TEXT_MUTED = '#9aaabb';
const R_MD = 12;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: SURFACE,
  },

  scroll: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 56,
    paddingBottom: 32,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 14,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },

  badgeText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: ORANGE_DARK,
  },

  title: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: TEXT,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 13,
    color: TEXT_2,
    lineHeight: 20,
    marginBottom: 28,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },

  field: {
    marginBottom: 16,
  },

  label: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: TEXT_2,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 7,
  },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: SURFACE_2,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: R_MD,
    paddingHorizontal: 14,
  },

  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
    fontFamily: 'Poppins_400Regular',
  },

  eyeBtn: {
    padding: 2,
  },

  eyeIcon: {
    fontSize: 16,
  },

  btnPrimary: {
    height: 52,
    backgroundColor: ORANGE,
    borderRadius: R_MD,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 20,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.38,
    shadowRadius: 14,
    elevation: 6,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  btnPrimaryText: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#fff',
    letterSpacing: 0.2,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },

  footerText: {
    fontSize: 13,
    color: TEXT_MUTED,
    fontFamily: 'Poppins_400Regular',
  },

  footerLink: {
    fontSize: 13,
    color: ORANGE,
    fontFamily: 'Poppins_700Bold',
  },

  logo: {
    width: 400,
    height: 150,
    transform: [{ scale: 2.5 }],
  },
});