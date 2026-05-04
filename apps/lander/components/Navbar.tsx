import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Github, CloudOff, Sun, Moon } from 'lucide-react';
import { links } from '../utils/links';

interface NavbarProps {
  isDark: boolean;
  themeLabel: string;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, themeLabel, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: '/', label: 'Home' },
    { id: '/features/offline-markdown-editor', label: 'Features' },
    { id: '/compare/obsidian', label: 'Compare' },
    { id: '/docs', label: 'Docs' },
    { id: '/updates', label: 'Updates' },
    { id: '/privacy', label: 'Privacy' },
  ];
  const menuPanelClassName = ['navbar-menu-panel', isOpen ? 'is-open' : 'is-closed'].join(' ');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-mark">
            <CloudOff className="navbar-brand-icon" />
          </div>
          <span className="navbar-brand-text">MdWrk</span>
        </Link>
        <div className="navbar-actions">
           <button
            onClick={toggleTheme}
            className="navbar-theme-toggle"
            aria-label={`Toggle theme. Active theme: ${themeLabel}`}
            title={themeLabel}
          >
            {isDark ? <Sun className="navbar-theme-icon" /> : <Moon className="navbar-theme-icon" />}
          </button>

          <a
            href={links.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="navbar-github-link"
            aria-label="Open MdWrk GitHub repository"
            title="Open MdWrk GitHub repository"
          >
            <Github className="navbar-github-icon" />
            <span className="navbar-github-label">GitHub</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="navbar-menu-toggle"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="navbar-menu-icon" /> : <Menu className="navbar-menu-icon" />}
          </button>
        </div>
        <div
          className={menuPanelClassName}
          id="navbar-sticky"
        >
          <ul className="navbar-menu-list">
            {navLinks.map(link => (
              <li key={link.id}>
                <NavLink
                  to={link.id}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) => ['navbar-link', isActive ? 'is-active' : 'is-inactive'].join(' ')}
                  end={link.id !== '/updates'}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

