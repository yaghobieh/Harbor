import { FC, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Flex,
  BearIcons,
} from '@forgedevstack/bear';
import { Logo } from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { VersionDropdown } from '../VersionDropdown/VersionDropdown';
import { NAV_ITEMS, NPM_URL } from '@/constants';

export const Navbar: FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (item: typeof NAV_ITEMS[0], e: React.MouseEvent) => {
    if (item.isLink) {
      e.preventDefault();
      navigate(item.href);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <Flex align="center" justify="between" gap={3}>
          <Flex align="center" gap={3} className="min-w-0">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Logo size="sm" />
              <Typography variant="h4" className="font-bold truncate">Harbor</Typography>
              <VersionDropdown />
            </Link>
          </Flex>

          <Flex align="center" gap={5} className="hidden lg:flex">
            {NAV_ITEMS.map((item) =>
              item.isLink ? (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  <Typography variant="body2" className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer whitespace-nowrap">
                    {item.label}
                  </Typography>
                </Link>
              ) : (
                <a
                  key={item.id}
                  href={item.href}
                  target={item.external ? '_blank' : undefined}
                  rel={item.external ? 'noopener noreferrer' : undefined}
                >
                  <Typography variant="body2" className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer whitespace-nowrap">
                    {item.label}
                  </Typography>
                </a>
              )
            )}
          </Flex>

          <Flex align="center" gap={2}>
            <a
              href={NPM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg"
              style={{ color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              aria-label="Harbor on npm"
            >
              <BearIcons.PackageIcon size="xs" color="var(--harbor-accent)" />
            </a>
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              icon={<BearIcons.MenuIcon size="sm" color="var(--text-primary)" />}
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            />
          </Flex>
        </Flex>
      </div>

      {menuOpen && (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 top-14 bg-black/40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="harbor-nav-drop absolute left-0 right-0 top-full shadow-xl"
            style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {NAV_ITEMS.map((item) =>
                item.isLink ? (
                  <Link
                    key={item.id}
                    to={item.href}
                    onClick={(e) => handleNavClick(item, e)}
                    className="px-3 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <a
                    key={item.id}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                    className="px-3 py-3 rounded-lg text-sm"
                    style={{ color: 'var(--text-primary)' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
