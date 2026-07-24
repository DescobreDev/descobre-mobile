export const colors = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  orangeBorder: 'rgba(249,115,22,0.25)',

  surface: '#ffffff',
  surface2: '#f8fafc',
  border: '#eef1f6',

  text: '#0d1829',
  text2: '#5a6a82',
  textMuted: '#aab4c4',

  green: '#10b981',
  greenDark: '#059669',
  greenLight: '#ecfdf5',

  indigo: '#6366f1',
  indigoDark: '#4f46e5',
  indigoLight: '#eef2ff',

  yellow: '#f59e0b',
  yellowDark: '#d97706',
  yellowLight: '#fffbeb',

  red: '#ef4444',
  redDark: '#dc2626',
  redLight: '#fef2f2',
};

export const fonts = {
  regular: 'Poppins_400Regular',
  medium: 'Poppins_500Medium',
  semiBold: 'Poppins_600SemiBold',
  bold: 'Poppins_700Bold',
};

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const shadow = (color: string = colors.text, opacity = 0.08) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: opacity,
  shadowRadius: 20,
  elevation: 3,
});