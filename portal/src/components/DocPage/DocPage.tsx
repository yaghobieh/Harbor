import { FC, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Typography,
  GradientText,
  CodeBlock,
  Breadcrumbs,
  Card,
  CardBody,
  Divider,
  Button,
  Flex,
  BearIcons,
} from '@forgedevstack/bear';
import { DOCS_CONTENT } from '@/constants/docs-content.const';
import { DOC_NAVIGATION } from '@/constants/docs.const';

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
      <Flex justify="center" align="center" className="min-h-screen">
        <div className="text-center">
          <Typography variant="h1" className="text-4xl font-bold mb-4">404</Typography>
          <Typography className="opacity-50 mb-6">Documentation page not found</Typography>
          <Link to="/docs/quick-start">
            <Button variant="harbor">Go to Quick Start</Button>
          </Link>
        </div>
      </Flex>
    );
  }

  return (
    <article className="max-w-4xl mx-auto py-12 px-6">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Docs', href: '/docs/quick-start' },
          { label: content.title },
        ]}
        className="mb-8"
      />

      <header className="mb-12">
        <Typography variant="h1" className="text-4xl md:text-5xl font-bold mb-4">
          <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
            {content.title}
          </GradientText>
        </Typography>
        <Typography className="text-xl opacity-50">{content.description}</Typography>
      </header>

      {content.sections.length > 1 && (
        <Card variant="ghost" padding="md" radius="xl" className="mb-12">
          <CardBody>
            <Typography variant="overline" className="opacity-50 mb-4">
              On This Page
            </Typography>
            <ul className="space-y-2">
              {content.sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="hover:opacity-100 opacity-60 transition-opacity"
                    style={{ color: 'var(--harbor-accent)' }}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      <div className="prose prose-invert prose-lg max-w-none">
        {content.sections.map((section) => (
          <section key={section.id} id={section.id} className="mb-16 scroll-mt-24">
            <Typography variant="h2" className="text-2xl md:text-3xl font-bold mb-4">
              <a href={`#${section.id}`} style={{ color: 'var(--harbor-accent)' }} className="mr-2">
                #
              </a>
              {section.title}
            </Typography>

            <div className="opacity-70 mb-6 leading-relaxed whitespace-pre-wrap">
              {section.content.split('\n').map((line, i) => {
                if (line.trim().startsWith('-')) {
                  return (
                    <div key={i} className="flex gap-2 ml-4 my-1">
                      <span style={{ color: 'var(--harbor-accent)' }}>•</span>
                      <span dangerouslySetInnerHTML={{ __html: formatInlineCode(line.slice(line.indexOf('-') + 1).trim()) }} />
                    </div>
                  );
                }
                if (line.startsWith('###')) {
                  return (
                    <Typography key={i} variant="h4" className="font-semibold mt-4 mb-2">
                      {line.replace(/^###\s*/, '')}
                    </Typography>
                  );
                }
                if (line.includes('|')) {
                  return null;
                }
                return (
                  <p key={i} className="my-2" dangerouslySetInnerHTML={{ __html: formatInlineCode(line) }} />
                );
              })}

              {section.content.includes('|') && (
                <div className="my-6 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        {getTableHeaders(section.content).map((header, i) => (
                          <th key={i} className="text-left px-4 py-3 text-sm font-semibold opacity-70">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getTableRows(section.content).map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
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

            {section.code && (
              <CodeBlock
                code={section.code}
                title={section.filename}
                language="typescript"
                copyable
                showLineNumbers
                className="my-6"
              />
            )}
          </section>
        ))}
      </div>

      <Divider className="opacity-10 mt-16 mb-8" />

      <Flex justify="between">
        {prevPage ? (
          <Link to={prevPage.path} className="group">
            <Typography variant="caption" className="opacity-50 mb-1">Previous</Typography>
            <Flex align="center" gap={2}>
              <BearIcons.ChevronLeftIcon size="xs" color="var(--harbor-accent)" />
              <Typography style={{ color: 'var(--harbor-accent)' }}>{prevPage.title}</Typography>
            </Flex>
          </Link>
        ) : (
          <div />
        )}

        {nextPage && (
          <Link to={nextPage.path} className="group text-right">
            <Typography variant="caption" className="opacity-50 mb-1">Next</Typography>
            <Flex align="center" gap={2}>
              <Typography style={{ color: 'var(--harbor-accent)' }}>{nextPage.title}</Typography>
              <BearIcons.ChevronRightIcon size="xs" color="var(--harbor-accent)" />
            </Flex>
          </Link>
        )}
      </Flex>
    </article>
  );
};

// Helper function to format inline code
function formatInlineCode(text: string): string {
  return text
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded text-sm font-mono" style="background:rgba(255,255,255,0.08);color:var(--harbor-accent)">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold" style="color:var(--text-primary)">$1</strong>')
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
