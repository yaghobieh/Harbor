import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button, BearIcons } from '@forgedevstack/bear';
import { Sidebar } from '../Sidebar/Sidebar';

export const DocLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="fixed top-4 left-4 z-40 lg:hidden">
        <Button
              variant="ghost"
              size="sm"
              icon={<BearIcons.MenuIcon size="sm" />}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            />
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-72">
        <Outlet />
      </main>
    </div>
  );
};
