import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, typography, radius, spacing } from '../../theme';

type WelcomeModalProps = {
  visible: boolean;
  name: string;
  onCreateProfile: () => void;
};

export function WelcomeModal({ visible, name, onCreateProfile }: WelcomeModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather name="check-circle" size={48} color="#fff" />
          </View>

          <Text style={styles.greeting}>Bem-vindo(a)!</Text>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          <Text style={styles.message}>Sua conta foi criada com sucesso.</Text>

          <TouchableOpacity
            onPress={onCreateProfile}
            activeOpacity={0.88}
            style={styles.btnShadowWrap}
          >
            <LinearGradient
              colors={[colors.orange, colors.orangeDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.btnPrimary}
            >
              <Text style={styles.btnText}>Criar meu perfil</Text>
              <Feather name="arrow-right" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(13,24,41,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 28,
    paddingVertical: 34,
    paddingHorizontal: 26,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 12,
  },
  iconWrap: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  greeting: {
    fontSize: 22,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  name: {
    fontSize: 30,
    fontFamily: typography.fontBold,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  message: {
    fontSize: 17,
    fontFamily: typography.fontRegular,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 30,
  },
  btnShadowWrap: {
    width: '100%',
    borderRadius: radius.md,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  btnPrimary: {
    height: 62,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  btnText: {
    fontSize: 18,
    fontFamily: typography.fontBold,
    color: '#fff',
  },
});