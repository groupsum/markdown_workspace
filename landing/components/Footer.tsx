import React from 'react';
import { CloudOff, X } from 'lucide-react';

interface FooterProps {
  setView: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <button onClick={() => setView('home')} className="flex items-center">
              <CloudOff className="w-8 h-8 text-indigo-600 dark:text-indigo-500 mr-3" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-slate-900 dark:text-white">MarkSpace</span>
            </button>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
               The local-first markdown workspace. Your data, your device, your rules.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className="mb-6 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Resources</h2>
              <ul className="text-slate-600 dark:text-slate-400 font-medium space-y-3 text-sm">
                <li><button onClick={() => setView('docs')} className="hover:text-indigo-600 transition-colors">Documentation</button></li>
                <li><button onClick={() => setView('blog')} className="hover:text-indigo-600 transition-colors">Blog</button></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Follow</h2>
              <ul className="text-slate-600 dark:text-slate-400 font-medium space-y-3 text-sm">
                <li><a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">GitHub</a></li>
                <li><a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">X.com</a></li>
              </ul>
            </div>
            <div>
              <h2 className="mb-6 text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Legal</h2>
              <ul className="text-slate-600 dark:text-slate-400 font-medium space-y-3 text-sm">
                <li><button onClick={() => setView('privacy')} className="hover:text-indigo-600 transition-colors">Privacy</button></li>
                <li><button onClick={() => setView('terms')} className="hover:text-indigo-600 transition-colors">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-8 border-slate-200 dark:border-slate-800" />
        <div className="text-center text-xs text-slate-500">
          © 2024 MarkSpace. Designed for privacy.
        </div>
      </div>
    </footer>
  );
};