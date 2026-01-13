import { FC } from 'react';
import { Logo } from '../Logo/Logo';
import { FOOTER_LINKS } from '@/constants';

export const Footer: FC = () => {
  return (
    <footer className="py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <span className="text-xl font-bold">Harbor</span>
          </div>

          <div className="flex items-center gap-8 text-gray-400">
            {FOOTER_LINKS.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-gray-500 text-sm">MIT License</p>
        </div>
      </div>
    </footer>
  );
};

