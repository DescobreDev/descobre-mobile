import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const COLORS = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  orangeBorder: 'rgba(249,115,22,0.3)',
  text: '#0d1829',
  textMuted: '#9aaabb',
  text2: '#5a6a82',
  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#e9ecf2',
  green: '#10b981',
  red: '#ef4444',
  indigo: '#6366f1',
};

export const FONT = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface OnboardingHeaderProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  title: string;
  subtitle?: string;
  optional?: boolean;
}

export function OnboardingHeader({
  currentStep,
  totalSteps,
  onBack,
  title,
  subtitle,
  optional = false,
}: OnboardingHeaderProps) {
  const progress = currentStep / totalSteps;

  return (
    <View style={styles.wrapper}>
      <View style={styles.topRow}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.backBtn}
            accessibilityLabel="Voltar"
            accessibilityRole="button"
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <Text style={styles.stepCount}>
          {currentStep}
          <Text style={styles.stepTotal}>/{totalSteps}</Text>
        </Text>
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.progressSegment,
              i < currentStep && styles.progressSegmentActive,
              i === currentStep - 1 && styles.progressSegmentCurrent,
            ]}
          />
        ))}
      </View>

      <View style={styles.titleBlock}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{title}</Text>
          {optional && (
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalText}>Opcional</Text>
            </View>
          )}
        </View>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 0,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm + 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    color: COLORS.orange,
  },
  stepTotal: {
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.lg,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 99,
    backgroundColor: COLORS.border,
  },
  progressSegmentActive: {
    backgroundColor: COLORS.orange,
  },
  progressSegmentCurrent: {
    backgroundColor: COLORS.orange,
  },
  titleBlock: {
    gap: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: COLORS.text,
    lineHeight: 30,
  },
  subtitle: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: COLORS.text2,
    lineHeight: 21,
  },
  optionalBadge: {
    backgroundColor: COLORS.surface2,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  optionalText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 16,
    color: COLORS.textMuted,
  },
});