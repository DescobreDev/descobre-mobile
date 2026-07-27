export const colors = {
  orange: '#f97316',
  orangeDark: '#ea580c',
  orangeLight: '#fff7ed',
  orangeBorder: 'rgba(249,115,22,0.25)',

  surface: '#ffffff',
  surfaceAlt: '#f8fafc',
  border: '#eef1f6',

  text: '#0d1829',
  textSecondary: '#5a6a82',
  textMuted: '#aab4c4',

  shadow: '#0d1829',
} as const;

export type ColorToken = keyof typeof colors;