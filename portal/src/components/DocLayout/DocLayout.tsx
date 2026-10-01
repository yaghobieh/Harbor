import { FC, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button, BearIcons } from '@forgedevstack/bear';
import { Navbar } from '../Navbar/Navbar';
import { Sidebar } from '../Sidebar/Sidebar';

export const DocLayout: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />

      <div
        className="lg:hidden sticky top-14 z-30 px-4 py-2"
        style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}
      >
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<BearIcons.MenuIcon size="xs" color="var(--text-primary)" />}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open documentation menu"
        >
          Documentation
        </Button>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="lg:ml-72 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};
