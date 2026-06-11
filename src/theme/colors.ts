export type ThemeMode = 'light' | 'dark';

export const colors = {
  light: {
    background: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceMuted: '#EEF3F6',
    text: '#17202A',
    textMuted: '#65717D',
    border: '#DCE4EA',
    primary: '#0C8CE9',
    primarySoft: '#DDF0FF',
    accent: '#FF5A7A',
    accentSoft: '#FFE5EA',
    success: '#18A058',
    warning: '#E6A700',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#111418',
    surface: '#1A2027',
    surfaceMuted: '#242C35',
    text: '#F5F7FA',
    textMuted: '#A7B0BA',
    border: '#303A45',
    primary: '#54B9FF',
    primarySoft: '#17364A',
    accent: '#FF7590',
    accentSoft: '#4A202B',
    success: '#5BD38D',
    warning: '#FFD166',
    tabBar: '#181D23',
  },
} as const;

export type AppPalette = (typeof colors)[ThemeMode];
