import { FC } from 'react';
import { GradientText } from '../GradientText/GradientText';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { API_ITEMS } from '@/constants';

const TYPE_COLORS: Record<string, string> = {
  function: 'bg-harbor-600/20 text-harbor-400',
  class: 'bg-purple-600/20 text-purple-400',
  object: 'bg-blue-600/20 text-blue-400',
  type: 'bg-green-600/20 text-green-400',
};

export const ApiReference: FC = () => {
  return (
    <section id="api" className="py-32 relative bg-gradient-to-b from-transparent via-harbor-900/10 to-transparent">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText>API Reference</GradientText>
          </h2>
          <p className="text-xl text-gray-400">
            Complete documentation for all exports
          </p>
        </div>

        <div className="grid gap-6">
          {API_ITEMS.map((item, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 rounded-lg font-mono text-sm ${TYPE_COLORS[item.type]}`}>
                  {item.type}
                </span>
                <h3 className="text-xl font-bold font-mono">{item.name}</h3>
              </div>
              <p className="text-gray-400 mb-4">{item.description}</p>
              <div className="bg-gradient-to-b from-jet-900 to-[#0f0f1a] rounded-xl p-4 text-sm font-mono border border-white/5">
                <pre className="overflow-x-auto">
                  <code>{item.signature}</code>
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

