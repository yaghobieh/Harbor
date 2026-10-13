import { FC } from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Typography,
  Container,
  Flex,
  Badge,
  GradientText,
  CodeBlock,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  BearIcons,
} from '@forgedevstack/bear';
import { Logo } from '../Logo/Logo';
import { TITLE, TAGLINE, DESCRIPTION, STATS, SERVER_V1_CODE, SERVER_V2_CODE, SERVER_SQL_CODE } from '@/constants';

const heroButtonStyle = { height: 44, minHeight: 44, boxSizing: 'border-box' as const };

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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mb-12">
          <Link to="/docs/quick-start" className="block">
            <Button variant="harbor" size="lg" spotlight leftIcon={<BearIcons.BookOpenIcon size="xs" />} className="w-full" style={heroButtonStyle}>
              Read the Docs
            </Button>
          </Link>
          <a href="#quickstart" className="block">
            <Button variant="outline" size="lg" leftIcon={<BearIcons.RocketIcon size="xs" />} className="w-full" style={heroButtonStyle}>
              Quick Start
            </Button>
          </a>
          <Link to="/sandbox" className="block">
            <Button variant="forge" size="lg" spotlight leftIcon={<BearIcons.TerminalIcon size="xs" />} className="w-full" style={heroButtonStyle}>
              Sandbox
            </Button>
          </Link>
        </div>

        <Flex justify="center" className="mb-16">
          <div className="w-full max-w-2xl text-left">
            <Tabs defaultTab="v2" variant="pills">
              <TabList className="flex gap-2 mb-4">
                <Tab id="v1">V1</Tab>
                <Tab id="v2">V2</Tab>
                <Tab id="sql">Postgres</Tab>
              </TabList>
              <TabPanel tabId="v1">
                <CodeBlock code={SERVER_V1_CODE} title="server.ts" language="typescript" copyable showLineNumbers />
              </TabPanel>
              <TabPanel tabId="v2">
                <CodeBlock code={SERVER_V2_CODE} title="server.ts" language="typescript" copyable showLineNumbers />
              </TabPanel>
              <TabPanel tabId="sql">
                <CodeBlock code={SERVER_SQL_CODE} title="sql.ts" language="typescript" copyable showLineNumbers />
              </TabPanel>
            </Tabs>
          </div>
        </Flex>

      </Container>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <BearIcons.ArrowDownIcon size="sm" color="var(--text-muted)" />
      </div>
    </section>
  );
};
