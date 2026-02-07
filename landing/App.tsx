import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Features } from './components/Features';
import { DemoSection } from './components/DemoSection';
import { Footer } from './components/Footer';
import { DocsView } from './components/DocsView';
import { BlogView } from './components/BlogView';
import { LegalView } from './components/LegalView';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const renderView = () => {
    switch (currentView) {
      case 'docs': return <DocsView />;
      case 'blog': return <BlogView />;
      case 'privacy': return <LegalView page="legal/privacy" />;
      case 'terms': return <LegalView page="legal/terms" />;
      default: return (
        <>
          <Hero />
          <Features />
          <DemoSection isDark={isDark} />
          <section id="privacy" className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <div className="max-w-screen-xl mx-auto px-4 text-center">
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Your Data Stays on <span className="text-indigo-600 dark:text-indigo-400">Your Device</span></h2>
               <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 text-lg">
                  MarkSpace utilizes IndexedDB to store your workspaces directly in your browser. 
                  No AI servers scan your content, no trackers follow your keys.
               </p>
               <div className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 text-sm shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mr-2 animate-pulse"></div>
                  Privacy Standard: Verified Local
               </div>
            </div>
          </section>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 selection:bg-indigo-500/30 selection:text-indigo-800 dark:selection:text-indigo-200 transition-colors duration-300">
      <Navbar 
        isDark={isDark} 
        toggleTheme={() => setIsDark(!isDark)} 
        currentView={currentView} 
        setView={setCurrentView} 
      />
      <main>
        {renderView()}
      </main>
      <Footer setView={setCurrentView} />
    </div>
  );
};

export default App;