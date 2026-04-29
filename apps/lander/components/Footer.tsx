import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOff } from 'lucide-react';
import { links } from '../utils/links';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const sectionHeadingClass = "mb-5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-[0.16em]";
  const linkListClass = "text-sm font-medium leading-6 text-slate-600 dark:text-slate-400 space-y-2.5";
  const footerLinkClass = "inline-flex text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:text-indigo-600 dark:focus-visible:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 rounded-sm transition-colors";

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="/" className="flex items-center">
              <CloudOff className="w-8 h-8 text-indigo-600 dark:text-indigo-500 mr-3" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-slate-900 dark:text-white">MdWork</span>
            </Link>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-sm max-w-xs leading-relaxed">
               The local-first markdown workspace. Your data, your device, your rules.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
            <div>
              <h2 className={sectionHeadingClass}>Resources</h2>
              <ul className={linkListClass}>
                <li><Link to="/docs" className={footerLinkClass}>Documentation</Link></li>
                <li><Link to="/blog" className={footerLinkClass}>Blog</Link></li>
                <li><a href={links.demo} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>Live Demo</a></li>
                <li><a href={links.npmRepo} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>npm</a></li>
              </ul>
            </div>
            <div>
              <h2 className={sectionHeadingClass}>Follow</h2>
              <ul className={linkListClass}>
                <li><a href={links.github} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>GitHub</a></li>
                <li><a href={links.x} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>X.com</a></li>
                <li><a href={links.community} target="_blank" rel="noopener noreferrer" className={footerLinkClass}>Community</a></li>
              </ul>
            </div>
            <div>
              <h2 className={sectionHeadingClass}>Legal</h2>
              <ul className={linkListClass}>
                <li><Link to="/legal/privacy" className={footerLinkClass}>Privacy</Link></li>
                <li><Link to="/legal/terms" className={footerLinkClass}>Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="my-8 border-slate-200 dark:border-slate-800" />
        <div className="text-center text-xs text-slate-500">
          © {currentYear} MdWork. Designed for privacy.
        </div>
      </div>
    </footer>
  );
};
