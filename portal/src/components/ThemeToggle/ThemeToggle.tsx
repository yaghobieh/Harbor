import { FC } from 'react';
import { Button, BearIcons, useBear } from '@forgedevstack/bear';

export const ThemeToggle: FC = () => {
  const { mode, toggleMode } = useBear();

  return (
    <Button
      variant="ghost"
      size="sm"
      icon={mode === 'dark' ? <BearIcons.SunIcon size="xs" /> : <BearIcons.MoonIcon size="xs" />}
      onClick={toggleMode}
      aria-label="Toggle theme"
    />
  );
};
