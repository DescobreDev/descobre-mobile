import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { formatCpf, cleanCpf } from '../../utils/formatCpf';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthTextInput } from '../../components/auth/AuthTextInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthFooterLink } from '../../components/auth/AuthFooterLink';

const LOGO_SOURCE = require('../../../assets/images/LOGO-DESCOBRE-BRANCA.png');

export default function RegisterScreen() {
  const router = useRouter();
  const { checkCpf } = useAuthStore();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const handleCpfChange = (value: string) => setCpf(formatCpf(value));

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

    setIsChecking(true);
    try {
      const { name, birthDate } = await checkCpf(cleanCpf(cpf));

      router.push({
        pathname: '/auth/registerConfirm',
        params: {
          cpf: cleanCpf(cpf),
          password,
          name,
          birthDate: birthDate ?? '',
        },
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <AuthLayout
      logoSource={LOGO_SOURCE}
      badgeLabel="Crie sua conta"
      title="Cadastrar"
      subtitle="Seus dados serão preenchidos automaticamente pelo CPF."
      footer={
        <AuthFooterLink
          text="Já possui conta? "
          linkLabel="Entrar"
          onPress={() => router.push('/auth/login')}
        />
      }
    >
      <AuthTextInput
        label="CPF"
        icon="credit-card"
        placeholder="000.000.000-00"
        value={cpf}
        onChangeText={handleCpfChange}
        keyboardType="number-pad"
        maxLength={14}
        returnKeyType="next"
      />

      <AuthTextInput
        label="Senha"
        icon="lock"
        isPassword
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        autoCorrect={false}
        autoCapitalize="none"
        textContentType="none"
        returnKeyType="next"
      />

      <AuthTextInput
        label="Confirmar senha"
        icon="shield"
        isPassword
        placeholder="••••••••"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCorrect={false}
        autoCapitalize="none"
        textContentType="none"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <AuthButton label="Cadastrar" onPress={handleSubmit} isLoading={isChecking} />
    </AuthLayout>
  );
}