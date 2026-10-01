import { FC } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import {
  Navbar,
  Hero,
  Features,
  QuickStart,
  Footer,
  DocLayout,
  DocPage,
  Sandbox,
} from '@/components';
import { SwaggerPage } from '@/components/Swagger/SwaggerPage';
import { VideoPrompt } from '@/components/VideoPrompt/VideoPrompt';
import { ChangelogPage } from '@/components/Changelog/ChangelogPage';

const HomePage: FC = () => {
  return (
    <div className="font-sans antialiased min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <VideoPrompt />
        <QuickStart />
      </main>
      <Footer />
    </div>
  );
};

export const App: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sandbox" element={<Sandbox />} />
        <Route path="/changelog" element={<ChangelogPage />} />

        <Route path="/docs" element={<DocLayout />}>
          <Route index element={<Navigate to="quick-start" replace />} />
          <Route path="swagger" element={<SwaggerPage />} />
          <Route path="*" element={<DocPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
