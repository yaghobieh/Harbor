import { FC, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar as BearSidebar,
  Input,
  Typography,
} from '@forgedevstack/bear';
import type { SidebarProps as BearSidebarProps } from '@forgedevstack/bear';

type SidebarItem = BearSidebarProps['items'][number];
import { DOC_NAVIGATION } from '@/constants/docs.const';

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
      className={`harbor-docs-sidebar fixed top-14 h-[calc(100vh-3.5rem)] w-72 z-40 ${
        isOpen ? 'left-0' : '-left-72'
      } lg:left-0`}
    >
      <BearSidebar
        items={sidebarItems}
        activeItemId={activeItemId}
        onItemClick={handleItemClick}
        activeVariant="fill"
        variant="default"
        fullHeight
        header={
          <div className="w-full">
            <Input
              placeholder="Search docs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="sm"
            />
          </div>
        }
        footer={
          <Typography variant="caption" className="opacity-40">
            Scaffold: <code className="font-mono" style={{ color: 'var(--harbor-accent)' }}>npx create-forge my-app</code>
          </Typography>
        }
        className="h-full"
        style={{ width: '100%' }}
      />
    </div>
  );
};
