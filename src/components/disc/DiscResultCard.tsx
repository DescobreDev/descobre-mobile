import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DiscProfile, PROFILE_META } from '../../types/disc';
import { COLORS, FONT, SPACING } from '../onboarding/OnboardingHeader';

interface Props {
  profile: DiscProfile;
}

export function DiscResultCard({ profile }: Props) {
  const meta = PROFILE_META[profile];

  return (
    <View style={[styles.card, { borderColor: meta.color }]}>
      <View style={[styles.iconWrap, { backgroundColor: meta.colorLight }]}>
        <Ionicons name={`${meta.icon}-outline` as any} size={32} color={meta.color} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.trait, { color: meta.color }]}>{meta.trait}</Text>
        <Text style={styles.name}>{meta.label}</Text>
        <Text style={styles.description}>{meta.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 2,
    padding: SPACING.lg,
    gap: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    gap: 4,
  },
  trait: {
    fontFamily: FONT.semiBold,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  name: {
    fontFamily: FONT.semiBold,
    fontSize: 26,
    color: COLORS.text,
  },
  description: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: COLORS.text2,
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 4,
  },
});