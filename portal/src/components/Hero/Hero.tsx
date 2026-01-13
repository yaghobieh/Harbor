import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { GradientText } from '../GradientText/GradientText';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { TITLE, TAGLINE, DESCRIPTION, STATS } from '@/constants';

const HERO_CODE = `import { createServer, GET } from 'harbor';

const server = createServer({ port: 3000 });

server.addRoute(
  GET('/api/users', async (req) => {
    return { users: [], page: req.query.page };
  })
);

// Server is running at http://localhost:3000`;

export const Hero: FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-harbor-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Logo size="lg" className="shadow-[0_0_60px_rgba(192,38,211,0.3)]" />
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
          <GradientText>{TITLE}</GradientText>
        </h1>

        <p className="text-2xl md:text-3xl text-gray-300 font-medium mb-4">
          {TAGLINE}
        </p>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          {DESCRIPTION}
        </p>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 mb-12">
          {STATS.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold">
                <GradientText>{stat.value}</GradientText>
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <Link
            to="/docs/quick-start"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-harbor-400 via-harbor-600 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-[0_0_30px_rgba(192,38,211,0.2)]"
          >
            Read the Docs
          </Link>
          <a
            href="#quickstart"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            Quick Start
          </a>
        </div>

        {/* Code Preview */}
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <CodeBlock
              code={HERO_CODE}
              filename="server.ts"
              className="shadow-[0_0_30px_rgba(192,38,211,0.2)] text-left"
            />
          </div>
        </div>
        
        {/* Template Link */}
        <div className="mt-8">
          <Link
            to="/docs/templates"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-harbor-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            View project template structure
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

