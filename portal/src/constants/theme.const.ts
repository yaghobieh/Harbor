export const COLORS = {
  primary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  jet: {
    900: '#1a1a2e',
    800: '#16213e',
    700: '#1f2937',
    600: '#374151',
  },
} as const;

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #e879f9 0%, #c026d3 50%, #7c3aed 100%)',
  background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
  text: 'linear-gradient(135deg, #e879f9 0%, #c026d3 100%)',
} as const;

export const FONTS = {
  sans: "'Plus Jakarta Sans', system-ui, sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

export const SYNTAX_COLORS = {
  keyword: '#c792ea',
  string: '#c3e88d',
  function: '#82aaff',
  comment: '#676e95',
  number: '#f78c6c',
  property: '#f07178',
  type: '#ffcb6b',
} as const;

