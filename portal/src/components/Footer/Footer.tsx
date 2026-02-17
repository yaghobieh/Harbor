import { FC } from 'react';
import {
  Typography,
  Flex,
  Divider,
  Link as BearLink,
  BearIcons,
} from '@forgedevstack/bear';
import { Logo } from '../Logo/Logo';
import { FOOTER_LINKS } from '@/constants';

export const Footer: FC = () => {
  return (
    <footer className="py-16" style={{ borderTop: '1px solid var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <Flex direction={{ base: 'column', md: 'row' }} align="center" justify="between" gap={8}>
          <Flex align="center" gap={3}>
            <Logo size="sm" />
            <div>
              <Typography variant="h5" className="font-bold">Harbor</Typography>
              <Typography variant="caption" className="opacity-50">Part of ForgeStack</Typography>
            </div>
          </Flex>

          <Flex align="center" gap={6}>
            {FOOTER_LINKS.map((link, index) => (
              <BearLink
                key={index}
                href={link.href}
                external
                className="text-sm opacity-60 hover:opacity-100 transition-opacity"
              >
                <Flex align="center" gap={1}>
                  <BearIcons.ExternalLinkIcon size="xs" />
                  {link.label}
                </Flex>
              </BearLink>
            ))}
          </Flex>

          <Flex align="center" gap={4}>
            <Typography variant="caption" className="opacity-50">MIT License</Typography>
            <Divider orientation="vertical" className="h-4" />
            <Typography variant="caption" className="opacity-50">
              Built with <span style={{ color: 'var(--forge-accent)' }}>Bear UI</span>
            </Typography>
          </Flex>
        </Flex>

        <Divider className="my-8 opacity-10" />

        <div className="text-center">
          <Typography variant="caption" className="opacity-40">
            Harbor, Bear UI, Synapse, Compass, Relay, Crucible, Anvil, and Forge CLI are part of the{' '}
            <BearLink href="https://forgedevstack.com" external>
              ForgeStack
            </BearLink>{' '}
            ecosystem.
          </Typography>
          <Typography variant="caption" className="opacity-40 mt-2 block">
            Scaffold a new project: <code className="font-mono" style={{ color: 'var(--harbor-accent)' }}>npx create-forge my-app</code>
          </Typography>
        </div>
      </div>
    </footer>
  );
};
