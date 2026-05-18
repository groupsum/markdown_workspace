import React from 'react';
import { Link } from 'react-router-dom';
import { Download, WifiOff } from 'lucide-react';
import { links } from '../utils/links';

export const Hero: React.FC = () => {
  return (
    <section className="hero-section">
      <div className="hero-blob hero-blob-indigo"></div>
      <div className="hero-blob hero-blob-emerald"></div>
      <div className="hero-blob hero-blob-cyan"></div>

      <div className="hero-inner">
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-badge">Client</span>
          <Link to="/docs" className="hero-eyebrow-copy hero-eyebrow-link">
            mdwrk workspace, packages, and extensions documented here
          </Link>
          <WifiOff className="hero-eyebrow-icon" />
        </div>

        <h1 className="hero-heading">
          The <span className="hero-heading-accent">Local-First</span> Markdown Workspace
        </h1>

        <p className="hero-copy">
          MdWrk is the workspace client, renderer/editor package family, and extension host for local-first markdown work. The lander is only the documentation and release surface.
        </p>

        <div className="hero-actions">
          <Link to="/docs/getting-started/local-setup" className="hero-primary-link">
            Deploy Locally
            <Download className="hero-primary-icon" />
          </Link>
          <a
            href={links.app}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-secondary-link"
          >
            Install PWA
          </a>
        </div>
        <div className="hero-meta">
          <span className="hero-meta-label">ESM CDN</span>
          <a href={links.esmCdn} target="_blank" rel="noopener noreferrer" className="hero-meta-link">
            {links.esmCdn}
          </a>
        </div>
      </div>
    </section>
  );
};
