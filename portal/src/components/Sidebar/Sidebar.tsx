import { FC, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { DOC_NAVIGATION } from '@/constants/docs.const';
import { Logo } from '../Logo/Logo';
import { VersionDropdown } from '../VersionDropdown/VersionDropdown';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNavigation = DOC_NAVIGATION.map(group => ({
    ...group,
    sections: group.sections.filter(section =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter(group => group.sections.length > 0);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-72 bg-jet-950 border-r border-white/5 overflow-y-auto z-50 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-jet-950 z-10 p-4 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 mb-4">
          <Logo size={32} />
          <span className="text-xl font-bold text-white">Harbor</span>
          <VersionDropdown />
        </Link>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search docs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-harbor-500 focus:ring-1 focus:ring-harbor-500"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        {filteredNavigation.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.sections.map((section) => {
                const isActive = location.pathname === section.path;
                return (
                  <li key={section.path}>
                    <Link
                      to={section.path}
                      onClick={onClose}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-harbor-600/20 text-harbor-400'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {section.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <a
          href="https://github.com/yaghobieh/Harbor"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          View on GitHub
        </a>
      </div>
    </aside>
  );
};

