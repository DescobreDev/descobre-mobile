import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, fontSize, radius, spacing } from '../../theme';

type AuthTextInputProps = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
} & TextInputProps;

export function AuthTextInput({
  label,
  icon,
  isPassword = false,
  onFocus,
  onBlur,
  ...inputProps
}: AuthTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, isFocused && styles.inputWrapFocused]}>
        <View style={[styles.iconCircle, isFocused && styles.iconCircleFocused]}>
          <Feather name={icon} size={16} color={isFocused ? '#fff' : colors.orange} />
        </View>

        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          secureTextEntry={isPassword && !isVisible}
          autoComplete="off"
          importantForAutofill="no"
          {...inputProps}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={() => setIsVisible((v) => !v)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name={isVisible ? 'eye-off' : 'eye'} size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.lg },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.fontSemiBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 10,
  },
  inputWrapFocused: {
    borderColor: colors.orange,
    backgroundColor: colors.surface,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconCircleFocused: { backgroundColor: colors.orange },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text, fontFamily: typography.fontRegular },
  eyeBtn: { padding: 4, marginLeft: 4 },
});