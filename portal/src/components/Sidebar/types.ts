export interface SidebarProps {
  className?: string;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  isNew?: boolean;
}

