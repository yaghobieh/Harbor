import { FC } from 'react';
import { Button, BearIcons, useBear } from '@forgedevstack/bear';

export const ThemeToggle: FC = () => {
  const { mode, toggleMode } = useBear();

  const iconColor = mode === 'dark' ? '#f8fafc' : '#0f172a';

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={mode === 'dark'
        ? <BearIcons.SunIcon size="sm" color={iconColor} />
        : <BearIcons.MoonIcon size="sm" color={iconColor} />}
      onClick={toggleMode}
      aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{ color: iconColor }}
    />
  );
};
