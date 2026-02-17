import { FC } from 'react';
import {
  Typography,
  GradientText,
  CodeBlock,
  Badge,
  Flex,
} from '@forgedevstack/bear';
import { QUICK_START_CODE } from '@/constants';

const STEPS = [
  {
    number: 1,
    title: 'Install Harbor',
    code: '$ npm install harbor',
    lang: 'shell' as const,
  },
  {
    number: 2,
    title: 'Initialize Your Project',
    code: `$ npx harbor init

Created harbor.config.json
Created src/server.ts

Harbor project initialized!`,
    lang: 'shell' as const,
  },
];

export const QuickStart: FC = () => {
  return (
    <section id="quickstart" className="py-32 relative" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,102,204,0.05), transparent)' }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
              Quick Start
            </GradientText>
          </Typography>
          <Typography className="text-xl opacity-50">
            Get up and running in under 2 minutes
          </Typography>
        </div>

        {STEPS.map((step) => (
          <div key={step.number} className="mb-12">
            <Flex align="center" gap={4} className="mb-4">
              <Badge
                variant="primary"
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, var(--harbor-accent), var(--forge-accent))' }}
              >
                {step.number}
              </Badge>
              <Typography variant="h3" className="text-2xl font-bold">{step.title}</Typography>
            </Flex>
            <CodeBlock
              code={step.code}
              language={step.lang}
              copyable
            />
          </div>
        ))}

        <div className="mb-12">
          <Flex align="center" gap={4} className="mb-4">
            <Badge
              variant="primary"
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, var(--harbor-accent), var(--forge-accent))' }}
            >
              3
            </Badge>
            <Typography variant="h3" className="text-2xl font-bold">Create Your Server</Typography>
          </Flex>
          <CodeBlock
            code={QUICK_START_CODE}
            title="src/server.ts"
            language="typescript"
            copyable
            showLineNumbers
          />
        </div>

        <div>
          <Flex align="center" gap={4} className="mb-4">
            <Badge
              variant="primary"
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, var(--harbor-accent), var(--forge-accent))' }}
            >
              4
            </Badge>
            <Typography variant="h3" className="text-2xl font-bold">Run Your Server</Typography>
          </Flex>
          <CodeBlock
            code={`$ npx ts-node src/server.ts

Server running at http://localhost:3000`}
            language="shell"
            copyable
          />
        </div>
      </div>
    </section>
  );
};
