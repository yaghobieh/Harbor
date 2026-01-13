import { FC, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DOCS_CONTENT } from '@/constants/docs-content.const';
import { DOC_NAVIGATION } from '@/constants/docs.const';
import { CodeBlock } from '../CodeBlock/CodeBlock';
import { GradientText } from '../GradientText/GradientText';

export const DocPage: FC = () => {
  const { '*': path } = useParams();
  const docKey = path?.replace('docs/', '').replace(/\//g, '-') || 'quick-start';
  const content = DOCS_CONTENT[docKey];

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  // Find previous and next pages
  const allPages = DOC_NAVIGATION.flatMap(group => group.sections);
  const currentIndex = allPages.findIndex(page => page.path === `/docs/${docKey}`);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">404</h1>
          <p className="text-gray-400 mb-6">Documentation page not found</p>
          <Link
            to="/docs/quick-start"
            className="px-6 py-3 bg-harbor-600 hover:bg-harbor-700 text-white rounded-lg transition-colors"
          >
            Go to Quick Start
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link to="/docs/quick-start" className="hover:text-white transition-colors">
              Docs
            </Link>
          </li>
          <li>/</li>
          <li className="text-harbor-400">{content.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <GradientText>{content.title}</GradientText>
        </h1>
        <p className="text-xl text-gray-400">{content.description}</p>
      </header>

      {/* Table of Contents */}
      {content.sections.length > 1 && (
        <nav className="mb-12 p-6 bg-white/5 rounded-xl border border-white/10">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            On This Page
          </h2>
          <ul className="space-y-2">
            {content.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="text-gray-300 hover:text-harbor-400 transition-colors"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Content */}
      <div className="prose prose-invert prose-lg max-w-none">
        {content.sections.map((section, index) => (
          <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
              <a href={`#${section.id}`} className="text-harbor-500 hover:text-harbor-400">
                #
              </a>
              {section.title}
            </h2>

            {/* Content with markdown-like rendering */}
            <div className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
              {section.content.split('\n').map((line, i) => {
                // Handle bullet points
                if (line.trim().startsWith('-')) {
                  return (
                    <div key={i} className="flex gap-2 ml-4 my-1">
                      <span className="text-harbor-400">•</span>
                      <span dangerouslySetInnerHTML={{ __html: formatInlineCode(line.slice(line.indexOf('-') + 1).trim()) }} />
                    </div>
                  );
                }
                // Handle headings
                if (line.startsWith('###')) {
                  return (
                    <h4 key={i} className="text-lg font-semibold text-white mt-4 mb-2">
                      {line.replace(/^###\s*/, '')}
                    </h4>
                  );
                }
                // Handle tables
                if (line.includes('|')) {
                  return null; // Tables handled separately
                }
                // Regular text
                return (
                  <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: formatInlineCode(line) }} />
                );
              })}

              {/* Render tables */}
              {section.content.includes('|') && (
                <div className="my-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        {getTableHeaders(section.content).map((header, i) => (
                          <th key={i} className="text-left px-4 py-3 text-sm font-semibold text-gray-300">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getTableRows(section.content).map((row, i) => (
                        <tr key={i} className="border-b border-white/5">
                          {row.map((cell, j) => (
                            <td key={j} className="px-4 py-3 text-sm" dangerouslySetInnerHTML={{ __html: formatInlineCode(cell) }} />
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Code block */}
            {section.code && (
              <CodeBlock
                code={section.code}
                filename={section.filename}
                className="my-6"
              />
            )}
          </section>
        ))}
      </div>

      {/* Navigation */}
      <nav className="mt-16 pt-8 border-t border-white/10 flex justify-between">
        {prevPage ? (
          <Link
            to={prevPage.path}
            className="group flex flex-col items-start"
          >
            <span className="text-sm text-gray-500 mb-1">Previous</span>
            <span className="text-harbor-400 group-hover:text-harbor-300 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {prevPage.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextPage && (
          <Link
            to={nextPage.path}
            className="group flex flex-col items-end"
          >
            <span className="text-sm text-gray-500 mb-1">Next</span>
            <span className="text-harbor-400 group-hover:text-harbor-300 flex items-center gap-2">
              {nextPage.title}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </Link>
        )}
      </nav>
    </article>
  );
};

// Helper function to format inline code
function formatInlineCode(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-white/10 rounded text-harbor-400 text-sm font-mono">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Helper to extract table headers
function getTableHeaders(content: string): string[] {
  const lines = content.split('\n').filter(line => line.includes('|'));
  if (lines.length === 0) return [];
  return lines[0].split('|').map(cell => cell.trim()).filter(Boolean);
}

// Helper to extract table rows (skip header and separator)
function getTableRows(content: string): string[][] {
  const lines = content.split('\n').filter(line => line.includes('|'));
  if (lines.length < 3) return [];
  return lines.slice(2).map(line => 
    line.split('|').map(cell => cell.trim()).filter(Boolean)
  );
}

