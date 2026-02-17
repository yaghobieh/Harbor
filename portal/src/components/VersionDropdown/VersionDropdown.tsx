import { FC, ReactNode } from 'react';
import {
  Dropdown,
  Button,
  Typography,
  BearIcons,
} from '@forgedevstack/bear';
import type { DropdownItem } from '@forgedevstack/bear';
import { VersionDropdownProps, VersionInfo } from './types';

const VERSIONS: VersionInfo[] = [
  {
    version: '1.6.0',
    date: '2026-02-17',
    highlights: [
      'Job Queue with priorities, retries, dead letter queue',
      'Zero-dep Mail with SMTP, templates, provider presets',
      'Crucible testing integration',
      'ForgeStack ecosystem docs',
      'Bear UI theme support',
    ],
  },
  {
    version: '1.5.0',
    date: '2026-02-10',
    highlights: [
      'Cache module (Memory + Redis)',
      'Scheduler with cron expressions',
      'JWT & API Key auth',
      'Health checks & Prometheus metrics',
    ],
  },
  {
    version: '1.3.1',
    date: '2026-01-13',
    highlights: [
      'Version dropdown with changelog history',
      'Template documentation page',
      'harbor init --template flag',
      'Improved navigation (no page reloads)',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-01-13',
    highlights: [
      'Project scaffolding CLI (harbor create)',
      'Subpath exports (harbor/database, harbor/validations)',
      'Copy button for code blocks',
      'Light/Dark mode toggle',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-12',
    highlights: [
      'MongoDB ODM (Mongoose replacement)',
      'Schema, Model, Query methods',
      'Hooks and Middleware support',
      'Index management & Transactions',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-12',
    highlights: [
      'Simplified Route API (GET, POST, etc.)',
      'i18n Translation system',
      'Morgan-like HTTP Logger',
      'React documentation portal',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-12',
    highlights: [
      'Initial release',
      'Server creation with createServer()',
      'Route management with RouteBuilder',
      'Docker container management',
    ],
  },
];

const currentVersion = VERSIONS[0];

function buildDropdownItems(): DropdownItem[] {
  const items: DropdownItem[] = [
    { key: 'header', label: 'Version History', header: true },
  ];

  VERSIONS.forEach((version, index) => {
    const highlights = version.highlights.map(h => `• ${h}`).join('\n');
    const isLatest = index === 0;

    items.push({
      key: `v${version.version}`,
      label: `v${version.version}${isLatest ? ' (Latest)' : ''} — ${version.date}`,
      icon: isLatest
        ? <BearIcons.CheckCircleIcon size="xs" color="var(--harbor-accent)" />
        : <BearIcons.GitCommitIcon size="xs" />,
      trailing: (
        <Typography variant="caption" className="opacity-40 text-xs">
          {version.highlights.length} changes
        </Typography>
      ) as ReactNode,
    });

    if (index < VERSIONS.length - 1) {
      items.push({ key: `divider-${index}`, divider: true });
    }
  });

  items.push({ key: 'divider-bottom', divider: true });
  items.push({
    key: 'changelog',
    label: 'View full changelog →',
    icon: <BearIcons.ExternalLinkIcon size="xs" />,
    onClick: () => {
      window.open('https://www.npmjs.com/package/@forgedevstack/harbor', '_blank');
    },
  });

  return items;
}

export const VersionDropdown: FC<VersionDropdownProps> = ({ className = '' }) => {
  const dropdownItems = buildDropdownItems();

  return (
    <div className={className}>
      <Dropdown
        trigger={
          <Button variant="ghost" size="xs" rightIcon={<BearIcons.ChevronDownIcon size="xs" />} className="text-xs font-mono">
            v{currentVersion.version}
          </Button>
        }
        items={dropdownItems}
        placement="bottom-start"
        minWidth={320}
        maxHeight={400}
        size="sm"
      />
    </div>
  );
};
