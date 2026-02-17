import { FC, ReactNode, useEffect } from 'react';
import { useBear } from '@forgedevstack/bear';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useTheme = (): ThemeContextValue => {
  const bear = useBear();

  useEffect(() => {
    const root = document.documentElement;
    if (bear.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [bear.mode]);

  return {
    theme: bear.mode,
    resolvedTheme: bear.mode,
    setTheme: bear.setMode,
  };
};
