export const COLORS = {
  harbor: {
    50: '#e6f0ff',
    100: '#cce0ff',
    200: '#99c2ff',
    300: '#66a3ff',
    400: '#3385ff',
    500: '#0066cc',
    600: '#0052a3',
    700: '#003d7a',
    800: '#002952',
    900: '#001429',
  },
  forge: {
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
  },
  jet: {
    900: '#111122',
    800: '#1a1a2e',
    700: '#1f2937',
    600: '#374151',
  },
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #3385ff 0%, #0066cc 50%, #6366f1 100%)',
  background: 'linear-gradient(180deg, #111122 0%, #0a0a14 100%)',
  text: 'linear-gradient(135deg, #3385ff 0%, #6366f1 100%)',
} as const;

export const FONTS = {
  sans: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const SYNTAX_COLORS = {
  keyword: '#818cf8',
  string: '#86efac',
  function: '#93c5fd',
  comment: '#64748b',
  number: '#fb923c',
  property: '#f87171',
  type: '#fbbf24',
} as const;
