import { Theme } from '@/contexts';

export interface ThemeToggleProps {
  className?: string;
}

export interface ThemeOption {
  value: Theme;
  label: string;
  icon: JSX.Element;
}

