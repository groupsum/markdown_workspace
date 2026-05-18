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
    <section id="features" className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-heading">
            Designed for <span className="features-heading-privacy">Privacy</span>, Built for <span className="features-heading-accent">Reusable Surfaces</span>
          </h2>
          <p className="features-copy">
            The workspace client is the product surface. The lander is a guided window into the client, the shared packages, and the extension platform.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon-wrap">
                <feature.icon className="feature-icon" />
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
