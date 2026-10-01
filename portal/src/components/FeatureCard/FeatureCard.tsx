import { FC, ReactNode } from 'react';
import {
  Card,
  CardBody,
  Typography,
  BearIcons,
} from '@forgedevstack/bear';
import type { Feature, FeatureIcon } from '@/types';

interface FeatureCardProps {
  feature: Feature;
}

const ICONS: Record<FeatureIcon, ReactNode> = {
  bolt: <BearIcons.ZapIcon size="sm" color="var(--harbor-accent)" />,
  routes: <BearIcons.MapIcon size="sm" color="var(--harbor-accent)" />,
  shield: <BearIcons.ShieldCheckIcon size="sm" color="var(--harbor-accent)" />,
  settings: <BearIcons.SettingsIcon size="sm" color="var(--harbor-accent)" />,
  server: <BearIcons.ServerIcon size="sm" color="var(--harbor-accent)" />,
  code: <BearIcons.CodeIcon size="sm" color="var(--harbor-accent)" />,
  database: <BearIcons.DatabaseIcon size="sm" color="var(--harbor-accent)" />,
  stack: <BearIcons.StackedBarIcon size="sm" color="var(--harbor-accent)" />,
  mail: <BearIcons.MailIcon size="sm" color="var(--harbor-accent)" />,
  realtime: <BearIcons.ZapIcon size="sm" color="var(--harbor-accent)" />,
  cache: <BearIcons.FolderIcon size="sm" color="var(--harbor-accent)" />,
  clock: <BearIcons.ClockIcon size="sm" color="var(--harbor-accent)" />,
  check: <BearIcons.CheckCircleIcon size="sm" color="var(--harbor-accent)" />,
  test: <BearIcons.SandboxIcon size="sm" color="var(--harbor-accent)" />,
};

export const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  return (
    <Card variant="ghost" interactive padding="sm" radius="xl">
      <CardBody>
        <div
          className="w-10 h-10 rounded-lg p-[2px] mb-3"
          style={{ background: 'linear-gradient(135deg, var(--harbor-accent), var(--forge-accent))' }}
        >
          <div
            className="w-full h-full rounded-[6px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            {ICONS[feature.icon]}
          </div>
        </div>
        <Typography variant="h5" className="font-bold mb-1">{feature.title}</Typography>
        <Typography variant="body2" className="opacity-60 leading-snug">{feature.description}</Typography>
      </CardBody>
    </Card>
  );
};
