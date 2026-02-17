import { FC, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar as BearSidebar,
  Input,
  Typography,
  Flex,
  Divider,
  Link as BearLink,
  BearIcons,
} from '@forgedevstack/bear';
import type { SidebarItem } from '@forgedevstack/bear';
import { DOC_NAVIGATION } from '@/constants/docs.const';
import { Logo } from '../Logo/Logo';
import { VersionDropdown } from '../VersionDropdown/VersionDropdown';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Convert DOC_NAVIGATION to Bear SidebarItem format
  const sidebarItems: SidebarItem[] = useMemo(() => {
    return DOC_NAVIGATION
      .map((group) => {
        const filteredSections = group.sections.filter((section) =>
          section.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredSections.length === 0) return null;

        return {
          id: group.title,
          label: group.title,
          children: filteredSections.map((section) => ({
            id: section.path,
            label: section.title,
            href: section.path,
          })),
        } as SidebarItem;
      })
      .filter(Boolean) as SidebarItem[];
  }, [searchTerm]);

  // Find active item by matching current path
  const activeItemId = useMemo(() => {
    for (const group of DOC_NAVIGATION) {
      for (const section of group.sections) {
        if (location.pathname === section.path) return section.path;
      }
    }
    return undefined;
  }, [location.pathname]);

  const handleItemClick = (item: SidebarItem) => {
    if (item.href) {
      navigate(item.href);
      onClose?.();
    }
  };

  return (
    <div
      className={`fixed left-0 top-0 h-screen w-72 z-50 transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <BearSidebar
        items={sidebarItems}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        activeVariant="fill"
        variant="bordered"
        fullHeight
        header={
          <div className="w-full">
            <Link to="/" className="flex items-center gap-3 mb-3">
              <Logo size="sm" />
              <Typography variant="h5" className="font-bold">Harbor</Typography>
              <VersionDropdown />
            </Link>
            <Input
              placeholder="Search docs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
          </div>
        }
        footer={
          <Flex direction="column" gap={3} className="w-full">
            <BearLink href="https://forgedevstack.com" external className="text-sm">
              <Flex align="center" gap={2}>
                <BearIcons.ZapIcon size="xs" />
                ForgeStack Ecosystem
              </Flex>
            </BearLink>
            <BearLink href="https://www.npmjs.com/search?q=%40forgedevstack" external className="text-sm opacity-60">
              <Flex align="center" gap={2}>
                <BearIcons.PackageIcon size="xs" />
                View on npm
              </Flex>
            </BearLink>

            <Divider className="opacity-10" />

            <Typography variant="caption" className="opacity-40">
              Scaffold: <code className="font-mono" style={{ color: 'var(--harbor-accent)' }}>npx create-forge my-app</code>
            </Typography>
          </Flex>
        }
        className="h-full"
        style={{ width: '100%' }}
      />
    </div>
  );
};
