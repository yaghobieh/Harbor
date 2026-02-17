import type { BearThemeOverride, CustomVariantsMap } from '@forgedevstack/bear';

/**
 * Harbor color palette
 */
export const HARBOR_COLORS = {
  primary: {
    50: '#e6f0ff',
    100: '#b3d1ff',
    200: '#80b3ff',
    300: '#4d94ff',
    400: '#1a75ff',
    500: '#0066cc',
    600: '#0052a3',
    700: '#003d7a',
    800: '#002952',
    900: '#001429',
    950: '#000a14',
  },
  secondary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
} as const;

/**
 * Harbor theme override for BearProvider
 */
export const harborTheme: BearThemeOverride = {
  colors: {
    primary: HARBOR_COLORS.primary,
    secondary: HARBOR_COLORS.secondary,
    background: {
      primary: '#0a0a14',
      secondary: '#111122',
      tertiary: '#1a1a2e',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
      muted: '#64748b',
      inverted: '#0f172a',
    },
    border: {
      default: 'rgba(255, 255, 255, 0.06)',
      subtle: 'rgba(255, 255, 255, 0.03)',
      strong: 'rgba(255, 255, 255, 0.12)',
    },
  },
  typography: {
    fontFamily: {
      sans: "'Plus Jakarta Sans', system-ui, sans-serif",
      mono: "'JetBrains Mono', monospace",
    },
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.25rem',
  },
};

/**
 * Custom variants for Harbor UI
 */
export const harborVariants: CustomVariantsMap = {
  harbor: {
    bg: '#0066cc',
    bgHover: '#0052a3',
    text: '#ffffff',
    ring: '#1a75ff',
  },
  forge: {
    bg: '#6366f1',
    bgHover: '#4f46e5',
    text: '#ffffff',
    ring: '#818cf8',
  },
  harborGhost: {
    bg: 'rgba(0, 102, 204, 0.1)',
    bgHover: 'rgba(0, 102, 204, 0.2)',
    text: '#1a75ff',
    border: 'rgba(0, 102, 204, 0.3)',
  },
  forgeGhost: {
    bg: 'rgba(99, 102, 241, 0.1)',
    bgHover: 'rgba(99, 102, 241, 0.2)',
    text: '#818cf8',
    border: 'rgba(99, 102, 241, 0.3)',
  },
};
