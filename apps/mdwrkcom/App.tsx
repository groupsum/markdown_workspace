import React, { useState, useEffect } from 'react';
import { Navigate, Routes, Route, useLocation } from 'react-router-dom';
import { compileLanderSite, normalizeRouteSlug } from '@mdwrk/lander-core';
import { LanderPage } from '@mdwrk/lander-react';
import { buildPageMetadata as buildPortablePageMetadata } from '@mdwrk/lander-seo';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FeatureView } from './components/FeatureView';
import { DocsView } from './components/DocsView';
import { CompareView } from './components/CompareView';
import { BlogView } from './components/BlogView';
import { LegalView } from './components/LegalView';
import { usePageMetadata } from './hooks/usePageMetadata';
import { LANDER_THEMES, type LanderThemeId, getPreferredLanderThemeId } from './theme';
import { mdwrkSite } from './src/mdwrk-site';

const compiledMdwrkSite = compileLanderSite(mdwrkSite);

const GenericLanderView: React.FC = () => {
  const location = useLocation();
  const path = normalizeRouteSlug(location.pathname);
  const page = compiledMdwrkSite.pageByPath.get(path) || compiledMdwrkSite.pageByPath.get('/');
  const metadata = page ? buildPortablePageMetadata(compiledMdwrkSite, page) : null;

  usePageMetadata({
    title: metadata?.title,
    description: metadata?.description,
    path,
    keywords: page?.seo?.keywords,
  });

  return page ? <LanderPage site={compiledMdwrkSite} page={page} /> : null;
};

const LegacyBlogRedirect: React.FC = () => {
  const location = useLocation();
  return <Navigate to={location.pathname.replace(/^\/blog/, '/updates')} replace />;
};

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
          <Route path="/" element={<GenericLanderView />} />
          <Route path="/features/pwa-markdown-editor/" element={<GenericLanderView />} />
          <Route path="/features/indexeddb-markdown-storage/" element={<GenericLanderView />} />
          <Route path="/features/live-preview/" element={<GenericLanderView />} />
          <Route path="/features/extension-runtime/" element={<GenericLanderView />} />
          <Route path="/features/github-sync/" element={<GenericLanderView />} />
          <Route path="/features/*" element={<FeatureView />} />
          <Route path="/compare/mdwrk-vs-obsidian/" element={<GenericLanderView />} />
          <Route path="/compare/mdwrk-vs-typora/" element={<GenericLanderView />} />
          <Route path="/compare/mdwrk-vs-vscode-markdown/" element={<GenericLanderView />} />
          <Route path="/compare/local-first-markdown-editors/" element={<GenericLanderView />} />
          <Route path="/compare/*" element={<CompareView />} />
          <Route path="/answers/*" element={<GenericLanderView />} />
          <Route path="/packages/*" element={<GenericLanderView />} />
          <Route path="/trust/*" element={<GenericLanderView />} />
          <Route path="/proof/*" element={<GenericLanderView />} />
          <Route path="/docs/*" element={<DocsView />} />
          <Route path="/updates/*" element={<BlogView />} />
          <Route path="/blog/*" element={<LegacyBlogRedirect />} />
          <Route path="/legal/privacy" element={<LegalView page="legal/privacy" />} />
          <Route path="/legal/terms" element={<LegalView page="legal/terms" />} />
          <Route path="*" element={<GenericLanderView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
