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
    { id: '/docs', label: 'Docs' },
    { id: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-[var(--lander-border)] bg-[color:var(--lander-nav-bg)]/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <div className="bg-[var(--lander-accent)] p-2 rounded-lg">
            <CloudOff className="w-6 h-6 text-white" />
          </div>
          <span className="self-center text-2xl font-bold whitespace-nowrap text-[var(--lander-fg)]">MdWork</span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-2 rtl:space-x-reverse items-center">
           <button
            onClick={toggleTheme}
            className="p-2 text-[var(--lander-fg-muted)] hover:bg-[var(--lander-panel-muted)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--lander-accent)] transition-colors"
            aria-label={`Toggle theme. Active theme: ${themeLabel}`}
            title={themeLabel}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <a
            href={links.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-[var(--lander-fg)] bg-[var(--lander-panel-muted)] hover:bg-[var(--lander-panel)] focus:ring-4 focus:outline-none focus:ring-[var(--lander-border-strong)] font-medium rounded-lg text-sm px-4 py-2 text-center items-center gap-2 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Star</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-[var(--lander-fg-muted)] rounded-lg md:hidden hover:bg-[var(--lander-panel-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--lander-border-strong)]"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        <div
          className={`items-center justify-between w-full md:flex md:w-auto md:order-1 md:ml-auto md:mr-8 ${
            isOpen ? 'block' : 'hidden'
          }`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-[var(--lander-border)] rounded-lg bg-[var(--lander-panel-muted)] md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
            {navLinks.map(link => (
              <li key={link.id}>
                <NavLink
                  to={link.id}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded md:p-0 transition-colors ${
                      isActive
                        ? 'text-[var(--lander-accent)] underline underline-offset-8'
                        : 'text-[var(--lander-fg-muted)] hover:text-[var(--lander-accent)]'
                    }`
                  }
                  end={link.id === '/'}
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
