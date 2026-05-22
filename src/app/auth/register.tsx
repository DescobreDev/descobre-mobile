import { useState } from 'react';
import {
  Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
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
      const { name } = await register({ cpf: cleanCpf(cpf), password });

      Alert.alert(
        'Bem-vindo!',
        `Cadastro realizado com sucesso, ${name}!`,
        [{ text: 'Entrar agora', onPress: () => router.replace('/auth/login') }],
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Criar conta</Text>
      <Text style={styles.subtitle}>
        Seus dados serão preenchidos automaticamente pelo CPF.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="CPF (000.000.000-00)"
        value={cpf}
        onChangeText={handleCpfChange}
        keyboardType="number-pad"
        maxLength={14}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirmar senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Cadastrar</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('auth/login')}>
        <Text style={styles.link}>Já tem conta? Entrar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666', fontSize: 13, marginBottom: 24 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginBottom: 12, fontSize: 15,
  },
  button: {
    backgroundColor: '#4F46E5', borderRadius: 8,
    padding: 14, alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  link: { textAlign: 'center', marginTop: 16, color: '#4F46E5' },
});