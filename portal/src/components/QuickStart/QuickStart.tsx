import { FC } from 'react';
import { GradientText } from '../GradientText/GradientText';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { QUICK_START_CODE } from '@/constants';

const STEPS = [
  {
    number: 1,
    title: 'Install Harbor',
    code: '$ npm install harbor',
  },
  {
    number: 2,
    title: 'Initialize Your Project',
    code: `$ npx harbor init

Created harbor.config.json
Created src/server.ts

Harbor project initialized!`,
  },
];

export const QuickStart: FC = () => {
  return (
    <section id="quickstart" className="py-32 relative bg-gradient-to-b from-transparent via-harbor-900/10 to-transparent">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText>Quick Start</GradientText>
          </h2>
          <p className="text-xl text-gray-400">
            Get up and running in under 2 minutes
          </p>
        </div>

        {/* Steps */}
        {STEPS.map((step) => (
          <div key={step.number} className="mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-harbor-400 to-harbor-600 flex items-center justify-center text-white font-bold">
                {step.number}
              </div>
              <h3 className="text-2xl font-bold">{step.title}</h3>
            </div>
            <div className="bg-gradient-to-b from-jet-900 to-[#0f0f1a] rounded-xl p-4 border border-white/5">
              <pre className="font-mono text-sm">
                <code>{step.code}</code>
              </pre>
            </div>
          </div>
        ))}

        {/* Main Code Example */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-harbor-400 to-harbor-600 flex items-center justify-center text-white font-bold">
              3
            </div>
            <h3 className="text-2xl font-bold">Create Your Server</h3>
          </div>
          <CodeBlock code={QUICK_START_CODE} filename="src/server.ts" />
        </div>

        {/* Run Step */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-harbor-400 to-harbor-600 flex items-center justify-center text-white font-bold">
              4
            </div>
            <h3 className="text-2xl font-bold">Run Your Server</h3>
          </div>
          <div className="bg-gradient-to-b from-jet-900 to-[#0f0f1a] rounded-xl p-4 border border-white/5">
            <pre className="font-mono text-sm">
              <code>
                {`$ npx ts-node src/server.ts

Server running at http://localhost:3000`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
};

