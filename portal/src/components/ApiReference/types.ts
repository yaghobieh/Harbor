export interface ApiReferenceProps {
  className?: string;
}

export interface ApiItem {
  name: string;
  description: string;
  type: 'function' | 'class' | 'type' | 'constant';
}

