import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { DemoSection } from './components/DemoSection';
import { Footer } from './components/Footer';
import { DocsView } from './components/DocsView';
import { BlogView } from './components/BlogView';
import { LegalView } from './components/LegalView';
import { LANDER_THEMES, type LanderThemeId, getPreferredLanderThemeId } from './theme';

const HomeView: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <>
    <Hero />
    <Features />
    <DemoSection isDark={isDark} />
    <section id="privacy" className="privacy-section">
      <div className="privacy-container">
         <h2 className="privacy-heading">Your Data Stays on <span className="privacy-heading-accent">Your Device</span></h2>
         <p className="privacy-copy">
            MdWork utilizes IndexedDB to store your workspaces directly in your browser.
            No AI servers scan your content, no trackers follow your keys.
         </p>
         <div className="privacy-badge">
            <div className="privacy-badge-dot"></div>
            Privacy Standard: Verified Local
         </div>
      </div>
    </section>
  </>
);

const App: React.FC = () => {
  const [themeId, setThemeId] = useState<LanderThemeId>(() => getPreferredLanderThemeId());
  const location = useLocation();
  const isDark = themeId === 'lander-dark';
  const theme = LANDER_THEMES[themeId];

  useEffect(() => {
    setThemeId(getPreferredLanderThemeId());
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-lander-theme', themeId);
  }, [isDark, themeId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <Navbar
        isDark={isDark}
        themeLabel={theme.label}
        toggleTheme={() => setThemeId(isDark ? 'lander-light' : 'lander-dark')}
      />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomeView isDark={isDark} />} />
          <Route path="/docs/*" element={<DocsView />} />
          <Route path="/blog/*" element={<BlogView />} />
          <Route path="/legal/privacy" element={<LegalView page="legal/privacy" />} />
          <Route path="/legal/terms" element={<LegalView page="legal/terms" />} />
          <Route path="*" element={<HomeView isDark={isDark} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
