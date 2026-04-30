import React from 'react';
import { Download, WifiOff } from 'lucide-react';
import { links } from '../utils/links';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[var(--lander-app-bg)] transition-colors duration-300">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
        <div className="inline-flex items-center justify-between px-1 py-1 pr-4 mb-7 text-sm text-[var(--lander-fg-muted)] bg-[var(--lander-panel-muted)] rounded-full hover:bg-[var(--lander-panel)] transition-colors border border-[var(--lander-border)]">
          <span className="text-xs bg-[var(--lander-accent)] rounded-full text-white px-3 py-1.5 mr-3">Client</span>
          <span className="text-sm font-medium">mdwrk workspace, packages, and extensions documented here</span>
          <WifiOff className="w-4 h-4 ml-2 text-emerald-500" />
        </div>

        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-[var(--lander-fg)]">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lander-accent)] to-[var(--lander-accent-alt)]">Local-First</span> Markdown Workspace
        </h1>

        <p className="mb-8 text-lg font-normal text-[var(--lander-fg-muted)] lg:text-xl sm:px-16 lg:px-48">
          mdwrk is the workspace client, renderer/editor package family, and extension host for local-first markdown work. The lander is only the documentation and release surface.
        </p>

        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <a
            href={links.npmRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-[var(--lander-accent)] hover:bg-[var(--lander-accent-strong)] focus:ring-4 focus:ring-[var(--lander-accent)]/30 transition-all shadow-lg"
          >
            Get from npm
            <Download className="w-4 h-4 ml-2 -mr-1" />
          </a>
          <a
            href={links.app}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-[var(--lander-fg)] rounded-lg border border-[var(--lander-border-strong)] hover:bg-[var(--lander-panel-muted)] focus:ring-4 focus:ring-[var(--lander-border)] transition-all"
          >
            Install
          </a>
        </div>
        <div className="mt-6 text-xs text-[var(--lander-fg-muted)] flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
          <span className="uppercase tracking-widest text-[10px] text-[var(--lander-fg-subtle)]">ESM CDN</span>
          <a href={links.esmCdn} target="_blank" rel="noopener noreferrer" className="font-mono text-[var(--lander-accent)] hover:underline">
            {links.esmCdn}
          </a>
        </div>
      </div>
    </section>
  );
};
