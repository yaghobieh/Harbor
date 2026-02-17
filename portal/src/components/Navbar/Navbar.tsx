import { FC } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  Typography,
  Flex,
  Badge,
  BearIcons,
} from '@forgedevstack/bear';
import { Logo } from '../Logo/Logo';
import { ThemeToggle } from '../ThemeToggle/ThemeToggle';
import { VersionDropdown } from '../VersionDropdown/VersionDropdown';
import { NAV_ITEMS } from '@/constants';

export const Navbar: FC = () => {
  const navigate = useNavigate();

  const handleNavClick = (item: typeof NAV_ITEMS[0], e: React.MouseEvent) => {
    if (item.isLink) {
      e.preventDefault();
      navigate(item.href);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-sm bg-opacity-80" style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <Flex align="center" justify="between">
          <Flex align="center" gap={4}>
            <Link to="/" className="flex items-center gap-3">
              <Logo size="sm" />
              <Typography variant="h4" className="font-bold">Harbor</Typography>
              <VersionDropdown />
            </Link>
            <Badge variant="secondary" className="hidden md:inline-flex">
              <Flex align="center" gap={1}>
                <BearIcons.ZapIcon size="xs" />
                ForgeStack
              </Flex>
            </Badge>
          </Flex>

          <Flex align="center" gap={6} className="hidden md:flex">
            {NAV_ITEMS.map((item) =>
              item.isLink ? (
                <Link
                  key={item.id}
                  to={item.href}
                  onClick={(e) => handleNavClick(item, e)}
                >
                  <Typography variant="body2" className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer">
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
                  <Typography variant="body2" className="hover:opacity-100 opacity-60 transition-opacity cursor-pointer">
                    {item.label}
                  </Typography>
                </a>
              )
            )}
          </Flex>

          <Flex align="center" gap={3}>
            <ThemeToggle />
            <Link to="/sandbox" className="hidden sm:inline-flex">
              <Button variant="forge" size="sm" leftIcon={<BearIcons.TerminalIcon size="xs" />}>
                Sandbox
              </Button>
            </Link>
            <Link to="/docs/quick-start" className="hidden sm:inline-flex">
              <Button variant="harbor" size="sm" leftIcon={<BearIcons.BookOpenIcon size="xs" />}>
                Get Started
              </Button>
            </Link>
          </Flex>
        </Flex>
      </div>
    </nav>
  );
};
