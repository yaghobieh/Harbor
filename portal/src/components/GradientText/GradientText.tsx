import { FC, ReactNode } from 'react';

interface GradientTextProps {
  children: ReactNode;
  className?: string;
}

export const GradientText: FC<GradientTextProps> = ({ children, className = '' }) => {
  return (
    <span
      className={`bg-gradient-to-r from-harbor-400 via-harbor-600 to-purple-600 bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

