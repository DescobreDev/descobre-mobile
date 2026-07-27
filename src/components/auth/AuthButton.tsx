import { Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { colors, typography, fontSize, radius } from '../../theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
};

export function AuthButton({ label, onPress, isLoading = false, icon = 'arrow-right' }: AuthButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      activeOpacity={0.88}
      style={styles.shadowWrap}
    >
      <LinearGradient
        colors={[colors.orange, colors.orangeDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.text}>{label}</Text>
            <Feather name={icon} size={18} color="#fff" />
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.md,
    shadowColor: colors.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
    marginTop: 4,
  },
  button: {
    height: 54,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  text: { fontSize: fontSize.lg, fontFamily: typography.fontBold, color: '#fff', letterSpacing: 0.2 },
});