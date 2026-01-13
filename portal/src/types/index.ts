export interface NavItem {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: FeatureIcon;
}

export type FeatureIcon = 'bolt' | 'routes' | 'shield' | 'settings' | 'server' | 'code';

export interface CodeExample {
  id: string;
  label: string;
  filename: string;
  code: string;
  language: string;
}

export interface ApiItem {
  name: string;
  type: 'function' | 'class' | 'object' | 'type';
  description: string;
  signature: string;
}

export interface Stat {
  value: string;
  label: string;
}

