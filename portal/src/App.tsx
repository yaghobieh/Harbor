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
} from '@/components';

// Home page component
const HomePage: FC = () => {
  return (
    <div className="bg-theme-primary text-theme-primary font-sans antialiased min-h-screen transition-colors duration-200">
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
        {/* Home page */}
        <Route path="/" element={<HomePage />} />
        
        {/* Documentation pages */}
        <Route path="/docs" element={<DocLayout />}>
          <Route path="*" element={<DocPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
