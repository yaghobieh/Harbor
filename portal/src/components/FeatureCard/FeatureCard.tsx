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
  bolt: <BearIcons.ZapIcon size="md" color="var(--harbor-accent)" />,
  routes: <BearIcons.MapIcon size="md" color="var(--harbor-accent)" />,
  shield: <BearIcons.ShieldCheckIcon size="md" color="var(--harbor-accent)" />,
  settings: <BearIcons.SettingsIcon size="md" color="var(--harbor-accent)" />,
  server: <BearIcons.ServerIcon size="md" color="var(--harbor-accent)" />,
  code: <BearIcons.CodeIcon size="md" color="var(--harbor-accent)" />,
};

export const FeatureCard: FC<FeatureCardProps> = ({ feature }) => {
  return (
    <Card variant="ghost" interactive padding="lg" radius="2xl" className="h-full">
      <CardBody>
        <div
          className="w-14 h-14 rounded-xl p-[2px] mb-6"
          style={{ background: 'linear-gradient(135deg, var(--harbor-accent), var(--forge-accent))' }}
        >
          <div
            className="w-full h-full rounded-[10px] flex items-center justify-center"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            {ICONS[feature.icon]}
          </div>
        </div>
        <Typography variant="h4" className="font-bold mb-3">{feature.title}</Typography>
        <Typography className="opacity-60 leading-relaxed">{feature.description}</Typography>
      </CardBody>
    </Card>
  );
};
