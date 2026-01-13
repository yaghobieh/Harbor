export interface NavItem {
  id: string;
  label: string;
  href: string;
  isLink?: boolean;
  external?: boolean;
}

export interface NavbarProps {
  className?: string;
}

