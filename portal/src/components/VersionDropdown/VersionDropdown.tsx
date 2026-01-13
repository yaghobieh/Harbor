import { FC, useState, useRef, useEffect } from 'react';
import { VersionDropdownProps, VersionInfo } from './types';

const VERSIONS: VersionInfo[] = [
  {
    version: '1.3.1',
    date: '2026-01-13',
    highlights: [
      'Version dropdown with changelog history',
      'Template documentation page',
      'harbor init --template flag',
      'Improved navigation (no page reloads)',
    ],
  },
  {
    version: '1.3.0',
    date: '2026-01-13',
    highlights: [
      'Project scaffolding CLI (harbor create)',
      'Subpath exports (harbor/database, harbor/validations)',
      'Copy button for code blocks',
      'Light/Dark mode toggle',
    ],
  },
  {
    version: '1.2.0',
    date: '2026-01-12',
    highlights: [
      'MongoDB ODM (Mongoose replacement)',
      'Schema, Model, Query methods',
      'Hooks and Middleware support',
      'Index management & Transactions',
    ],
  },
  {
    version: '1.1.0',
    date: '2026-01-12',
    highlights: [
      'Simplified Route API (GET, POST, etc.)',
      'i18n Translation system',
      'Morgan-like HTTP Logger',
      'React documentation portal',
    ],
  },
  {
    version: '1.0.0',
    date: '2026-01-12',
    highlights: [
      'Initial release',
      'Server creation with createServer()',
      'Route management with RouteBuilder',
      'Docker container management',
    ],
  },
];

export const VersionDropdown: FC<VersionDropdownProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentVersion = VERSIONS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs px-2 py-0.5 rounded-full bg-harbor-500/20 text-harbor-400 font-medium hover:bg-harbor-500/30 transition-colors flex items-center gap-1"
      >
        v{currentVersion.version}
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-jet-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-white/10">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Version History</div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {VERSIONS.map((version, index) => (
              <div
                key={version.version}
                className={`p-3 border-b border-white/5 hover:bg-white/5 transition-colors ${
                  index === 0 ? 'bg-harbor-500/10' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-white">v{version.version}</span>
                    {index === 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                        Latest
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{version.date}</span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  {version.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-harbor-400 mt-0.5">•</span>
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <a
            href="https://github.com/yaghobieh/Harbor/blob/main/CHANGELOG.md"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-3 text-center text-sm text-harbor-400 hover:text-harbor-300 hover:bg-white/5 transition-colors"
          >
            View full changelog →
          </a>
        </div>
      )}
    </div>
  );
};

