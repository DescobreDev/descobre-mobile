import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Animated } from 'react-native';
import { DiscOption } from '../../types/disc';
import { COLORS, FONT, SPACING } from '../onboarding/OnboardingHeader';

interface Props {
  option: DiscOption;
  selected: boolean;
  onPress: () => void;
  index: number;
}

export function DiscOptionCard({ option, selected, onPress, index }: Props) {
  const letters = ['A', 'B', 'C', 'D'];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        selected && styles.cardSelected,
      ]}
    >
      <View style={[styles.letter, selected && styles.letterSelected]}>
        <Text style={[styles.letterText, selected && styles.letterTextSelected]}>
          {letters[index]}
        </Text>
      </View>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {option.label}
      </Text>
      {selected && (
        <View style={styles.checkDot} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: COLORS.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  letterSelected: {
    backgroundColor: '#6366f1',
  },
  letterText: {
    fontFamily: FONT.semiBold,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  letterTextSelected: {
    color: '#fff',
  },
  label: {
    flex: 1,
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  labelSelected: {
    fontFamily: FONT.semiBold,
    color: '#4338ca',
  },
  checkDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366f1',
    flexShrink: 0,
  },
});