import { FC, Fragment, ReactNode } from 'react';
import { Typography } from '@forgedevstack/bear';
import { Navbar } from '../Navbar/Navbar';
import { Footer } from '../Footer/Footer';
import changelog from '../../../../CHANGELOG.md?raw';

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1 py-0.5 rounded text-[0.9em]"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function blocks(markdown: string): ReactNode[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length === 0) return;
    nodes.push(
      <ul key={key} className="list-disc pl-5 mb-4 space-y-1">
        {list.map((item, index) => (
          <li key={index}>{inline(item)}</li>
        ))}
      </ul>,
    );
    key += 1;
    list = [];
  };

  lines.forEach((line) => {
    if (line.startsWith('# ')) return;
    if (line.startsWith('## ')) {
      flushList();
      nodes.push(
        <Typography key={key} variant="h2" className="text-2xl font-bold mt-10 mb-3">
          {inline(line.slice(3))}
        </Typography>,
      );
      key += 1;
      return;
    }
    if (line.startsWith('### ')) {
      flushList();
      nodes.push(
        <Typography key={key} variant="h3" className="text-lg font-semibold mt-6 mb-2">
          {inline(line.slice(4))}
        </Typography>,
      );
      key += 1;
      return;
    }
    if (line.startsWith('#### ')) {
      flushList();
      nodes.push(
        <Typography key={key} className="font-semibold mt-4 mb-2">
          {inline(line.slice(5))}
        </Typography>,
      );
      key += 1;
      return;
    }
    if (line.startsWith('- ')) {
      list.push(line.slice(2));
      return;
    }
    if (line.trim() === '') {
      flushList();
      return;
    }
    flushList();
    nodes.push(
      <Typography key={key} className="mb-3 opacity-80">
        {inline(line)}
      </Typography>,
    );
    key += 1;
  });

  flushList();
  return nodes;
}

export const ChangelogPage: FC = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <Typography variant="h1" className="text-4xl font-bold mb-2">Changelog</Typography>
        <Typography className="opacity-60 mb-2">
          The release notes from the Harbor repository.
        </Typography>
        {blocks(changelog)}
      </main>
      <Footer />
    </div>
  );
};
