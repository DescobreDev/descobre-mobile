import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { formatCpf, cleanCpf } from '../../utils/formatCpf';
import { redirectAfterAuth } from '../../utils/postAuthNavigation';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthTextInput } from '../../components/auth/AuthTextInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthFooterLink } from '../../components/auth/AuthFooterLink';

const LOGO_SOURCE = require('../../../assets/images/LOGO-DESCOBRE.png');

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');

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
      redirectAfterAuth(router);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <AuthLayout
      logoSource={LOGO_SOURCE}
      badgeLabel="Bem-vindo de volta"
      title="Entrar na conta"
      subtitle="Digite seu CPF e senha para acessar sua conta."
      footer={
        <AuthFooterLink
          text="Não tem conta? "
          linkLabel="Cadastre-se"
          onPress={() => router.push('/auth/register')}
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
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
      />

      <AuthButton label="Entrar" onPress={handleSubmit} isLoading={isLoading} />
    </AuthLayout>
  );
}