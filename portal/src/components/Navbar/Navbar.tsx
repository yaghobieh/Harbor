import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { VersionDropdown } from '../VersionDropdown/VersionDropdown';

const NAV_ITEMS = [
  { id: 'docs', label: 'Docs', href: '/docs/quick-start', isLink: true },
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'examples', label: 'Examples', href: '#examples' },
  { id: 'api', label: 'API', href: '#api' },
  { id: 'github', label: 'GitHub', href: 'https://github.com/yaghobieh/Harbor', external: true },
];

export const Navbar: FC = () => {
  const navigate = useNavigate();

  const handleNavClick = (item: typeof NAV_ITEMS[0], e: React.MouseEvent) => {
    if (item.isLink) {
      e.preventDefault();
      navigate(item.href);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-jet-900 dark:bg-jet-900 border-b border-white/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xl font-bold text-white">Harbor</span>
            <VersionDropdown />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              item.isLink ? (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              )
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              to="/docs/quick-start"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg bg-harbor-600 hover:bg-harbor-500 transition-colors font-medium text-sm text-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
