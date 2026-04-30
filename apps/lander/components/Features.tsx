import React from 'react';
import { WifiOff, Shield, Database, Github, Zap, Palette, Package, Puzzle } from 'lucide-react';
import { FeatureItem } from '../types';

const features: FeatureItem[] = [
  {
    title: 'Offline First',
    description: 'Built as a Progressive Web App (PWA). Install the mdwrk client once, keep working offline, and sync only when you choose to.',
    icon: WifiOff
  },
  {
    title: 'Split Packages',
    description: 'The editor and previewer are separate mdwrk packages, so the client, examples, and docs can all consume the same public surfaces.',
    icon: Package
  },
  {
    title: 'Extension Ready',
    description: 'The client hosts bundled and external extensions through a governed runtime, manifest, settings, and trust policy stack.',
    icon: Puzzle
  },
  {
    title: 'Zero Knowledge',
    description: 'No hosted authoring backend owns your markdown. Data stays local unless you connect your own Git provider.',
    icon: Shield
  },
  {
    title: 'Local Database',
    description: 'IndexedDB persistence keeps workspaces, sessions, themes, and extension state local to the device.',
    icon: Database
  },
  {
    title: 'GitHub Sync',
    description: 'Optional Git provider integration keeps repository operations additive instead of mandatory.',
    icon: Github
  },
  {
    title: 'Shared Themes',
    description: 'Renderer, editor, docs, blog, and client app all consume mdwrk theme contracts instead of forking per-surface styling.',
    icon: Palette
  },
  {
    title: 'Blazing Fast',
    description: 'No network round-trip for typing or previewing. The client stays responsive because the editor and preview pipeline are local.',
    icon: Zap
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="bg-[var(--lander-app-bg)] py-24 border-t border-[var(--lander-border)] transition-colors duration-300">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md mb-8 lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-[var(--lander-fg)]">
            Designed for <span className="text-emerald-500">Privacy</span>, Built for <span className="text-[var(--lander-accent)]">Reusable Surfaces</span>
          </h2>
          <p className="text-[var(--lander-fg-muted)] sm:text-xl">
            The workspace client is the product surface. The lander is a guided window into the client, the shared packages, and the extension platform.
          </p>
        </div>
        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 md:space-y-0">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col p-6 mx-auto max-w-lg text-left rounded-xl bg-[var(--lander-panel-muted)] border border-[var(--lander-border)] hover:bg-[var(--lander-panel)] hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg bg-[var(--lander-accent-soft)]">
                <feature.icon className="w-6 h-6 text-[var(--lander-accent)]" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-[var(--lander-fg)]">{feature.title}</h3>
              <p className="text-[var(--lander-fg-muted)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
