import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  Navbar,
  Hero,
  Features,
  QuickStart,
  CodeExamples,
  ApiReference,
  Footer,
  DocLayout,
  DocPage,
  Sandbox,
} from '@/components';

const HomePage: FC = () => {
  return (
    <div className="font-sans antialiased min-h-screen transition-colors duration-200" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <QuickStart />
        <CodeExamples />
        <ApiReference />
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

        <Route path="/docs" element={<DocLayout />}>
          <Route path="*" element={<DocPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
