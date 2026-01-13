import { FC } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const ICON_SIZES = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
};

export const Logo: FC<LogoProps> = ({ size = 'md', className = '' }) => {
  return (
    <div className={`${SIZES[size]} rounded-2xl bg-gradient-to-br from-harbor-400 via-harbor-600 to-purple-600 p-[3px] ${className}`}>
      <div className="w-full h-full bg-jet-900 rounded-[13px] flex items-center justify-center">
        <svg className={ICON_SIZES[size]} viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e879f9" />
              <stop offset="50%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="12" r="5" stroke="url(#logoGrad)" strokeWidth="3" fill="none" />
          <rect x="29" y="17" width="6" height="28" rx="3" fill="url(#logoGrad)" />
          <rect x="18" y="26" width="28" height="5" rx="2.5" fill="url(#logoGrad)" />
          <path
            d="M20 31v12c0 6 6 9 12 12c6-3 12-6 12-12v-12"
            stroke="url(#logoGrad)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

