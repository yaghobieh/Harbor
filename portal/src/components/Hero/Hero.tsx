import { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Typography,
  Container,
  Flex,
  Grid,
  GridItem,
  Card,
  CardBody,
  Badge,
  GradientText,
  CodeBlock,
  BearIcons,
} from '@forgedevstack/bear';
import { Logo } from '../Logo/Logo';
import { TITLE, TAGLINE, DESCRIPTION, STATS, FORGESTACK_PACKAGES, QUICK_START_CODE } from '@/constants';

export const Hero: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-harbor-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-forge-500/20 rounded-full blur-3xl" />
      </div>

      <Container className="relative z-10 text-center" style={{ maxWidth: '72rem' }}>
        <Flex justify="center" className="mb-4">
          <Logo size="lg" className="shadow-[0_0_60px_rgba(0,102,204,0.3)]" />
        </Flex>

        <Flex justify="center" className="mb-6">
          <Badge variant="info" className="px-4 py-1.5 text-sm">
            <Flex align="center" gap={2}>
              <BearIcons.ZapIcon size="xs" />
              Part of the ForgeStack Ecosystem
            </Flex>
          </Badge>
        </Flex>

        <Typography variant="h1" className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <GradientText preset="ocean" className="text-5xl md:text-7xl font-extrabold">
            {TITLE}
          </GradientText>
        </Typography>

        <Typography variant="h2" className="text-2xl md:text-3xl font-medium mb-4 opacity-70">
          {TAGLINE}
        </Typography>

        <Typography className="text-lg max-w-2xl mx-auto mb-10 opacity-50">
          {DESCRIPTION}
        </Typography>

        <Flex justify="center" gap={8} wrap="wrap" className="mb-12">
          {STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <Typography variant="h3" className="text-3xl font-bold">
                <GradientText preset="ocean">{stat.value}</GradientText>
              </Typography>
              <Typography variant="body2" className="opacity-50">{stat.label}</Typography>
            </div>
          ))}
        </Flex>

        <Flex justify="center" gap={4} wrap="wrap" className="mb-12">
          <Link to="/docs/quick-start">
            <Button variant="harbor" size="lg" spotlight leftIcon={<BearIcons.BookOpenIcon size="xs" />}>
              Read the Docs
            </Button>
          </Link>
          <a href="#quickstart">
            <Button variant="outline" size="lg" leftIcon={<BearIcons.RocketIcon size="xs" />}>
              Quick Start
            </Button>
          </a>
          <a href="https://forgedevstack.com" target="_blank" rel="noopener noreferrer">
            <Button variant="forgeGhost" size="lg" leftIcon={<BearIcons.ExternalLinkIcon size="xs" />} className="border">
              ForgeStack
            </Button>
          </a>
          <Link to="/sandbox">
            <Button variant="forge" size="lg" spotlight leftIcon={<BearIcons.TerminalIcon size="xs" />}>
              Sandbox
            </Button>
          </Link>
        </Flex>

        <Flex justify="center" className="mb-16">
          <div className="w-full max-w-2xl text-left">
            <CodeBlock
              code={QUICK_START_CODE}
              title="server.ts"
              language="typescript"
              copyable
              showLineNumbers
            />
          </div>
        </Flex>

        <div className="max-w-4xl mx-auto">
          <Typography variant="overline" className="mb-6 opacity-50">
            Works with the ForgeStack Ecosystem
          </Typography>
          <Grid cols={{ base: 2, md: 3 }} gap={3}>
            {FORGESTACK_PACKAGES.map((pkg) => (
              <GridItem key={pkg.name}>
                <Card variant="ghost" interactive padding="sm" radius="xl">
                  <CardBody>
                    <Flex align="center" gap={2} className="mb-1">
                      <BearIcons.PackageIcon size="xs" color="var(--harbor-accent)" />
                      <Typography variant="body2" className="font-semibold">
                        {pkg.name}
                      </Typography>
                    </Flex>
                    <Typography variant="caption" className="opacity-50 mb-2 block">
                      {pkg.description}
                    </Typography>
                    <code className="text-xs opacity-40 font-mono">{pkg.command}</code>
                  </CardBody>
                </Card>
              </GridItem>
            ))}
          </Grid>
        </div>
      </Container>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <BearIcons.ArrowDownIcon size="sm" color="var(--text-muted)" />
      </div>
    </section>
  );
};
