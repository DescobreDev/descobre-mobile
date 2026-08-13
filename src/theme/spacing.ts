import { Dimensions } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const radius = {
  sm: 12,
  md: 14,
  lg: 24,
  pill: 20,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
} as const;

export const layout = {
  headerHeight: Math.min(Math.max(SCREEN_HEIGHT * 0.28, 220), 320),
  headerRadius: 32,
  logoCardOverlap: 55,
} as const;