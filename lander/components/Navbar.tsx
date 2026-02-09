import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Github, CloudOff, Sun, Moon } from 'lucide-react';
import { links } from '../utils/links';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { id: '/', label: 'Home' },
    { id: '/docs', label: 'Docs' },
    { id: '/blog', label: 'Blog' },
  ];

  return (
    <nav className="fixed w-full z-50 top-0 start-0 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <CloudOff className="w-6 h-6 text-white" />
          </div>
          <span className="self-center text-2xl font-bold whitespace-nowrap text-slate-900 dark:text-white">MarkSpace</span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-2 rtl:space-x-reverse items-center">
           <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <a
            href={links.githubRepo}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 focus:ring-4 focus:outline-none focus:ring-slate-300 dark:focus:ring-slate-800 font-medium rounded-lg text-sm px-4 py-2 text-center items-center gap-2 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>Star</span>
          </a>
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-slate-500 dark:text-slate-400 rounded-lg md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600"
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
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-800 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent dark:md:bg-transparent">
            {navLinks.map(link => (
              <li key={link.id}>
                <NavLink
                  to={link.id}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block py-2 px-3 rounded md:p-0 transition-colors ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-8'
                        : 'text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
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
