import React from 'react';
import { Link } from 'react-router-dom';
import { CloudOff } from 'lucide-react';
import { links } from '../utils/links';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-layout">
          <div className="footer-brand-block">
            <Link to="/" className="footer-brand-link">
              <CloudOff className="footer-brand-icon" />
              <span className="footer-brand-text">MdWrk</span>
            </Link>
            <p className="footer-copy">
               The local-first Markdown workspace. Your data, your device, your rules.
            </p>
          </div>
          <div className="footer-nav-grid">
            <div>
              <h2 className="footer-section-heading">Resources</h2>
              <ul className="footer-link-list">
                <li><Link to="/docs" className="footer-link">Documentation</Link></li>
                <li><Link to="/blog" className="footer-link">News</Link></li>
                <li><a href={links.demo} target="_blank" rel="noopener noreferrer" className="footer-link">Live Demo</a></li>
                <li><a href={links.npmRepo} target="_blank" rel="noopener noreferrer" className="footer-link">npm</a></li>
              </ul>
            </div>
            <div>
              <h2 className="footer-section-heading">Follow</h2>
              <ul className="footer-link-list">
                <li><a href={links.github} target="_blank" rel="noopener noreferrer" className="footer-link">GitHub</a></li>
                <li><a href={links.x} target="_blank" rel="noopener noreferrer" className="footer-link">X.com</a></li>
                <li><a href={links.community} target="_blank" rel="noopener noreferrer" className="footer-link">Community</a></li>
              </ul>
            </div>
            <div>
              <h2 className="footer-section-heading">Legal</h2>
              <ul className="footer-link-list">
                <li><Link to="/legal/privacy" className="footer-link">Privacy</Link></li>
                <li><Link to="/legal/terms" className="footer-link">Terms</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="footer-legal">
          &copy; {currentYear} MdWrk. Designed for privacy.
        </div>
      </div>
    </footer>
  );
};
