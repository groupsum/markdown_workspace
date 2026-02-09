import React from 'react';
import { Download, WifiOff } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">
      {/* Background Blobs - Adjusted opacity for light mode */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 px-4 mx-auto max-w-screen-xl text-center">
        <div className="inline-flex items-center justify-between px-1 py-1 pr-4 mb-7 text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
          <span className="text-xs bg-indigo-600 rounded-full text-white px-3 py-1.5 mr-3">New</span> 
          <span className="text-sm font-medium">v2.0 is now available offline</span>
          <WifiOff className="w-4 h-4 ml-2 text-emerald-500 dark:text-emerald-400" />
        </div>
        
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-slate-900 dark:text-white">
          The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400">Local-First</span> Markdown Workspace
        </h1>
        
        <p className="mb-8 text-lg font-normal text-slate-600 dark:text-slate-400 lg:text-xl sm:px-16 lg:px-48">
          Write, organize, and sync without a server. MarkSpace runs entirely in your browser using local database technology. Connect to GitHub when you want to sync, stay offline when you don't.
        </p>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
          <a href="#" className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-indigo-600 hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-900 transition-all shadow-lg shadow-indigo-500/30">
            Install PWA
            <Download className="w-4 h-4 ml-2 -mr-1" />
          </a>
          <a href="#demo" className="inline-flex justify-center items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-slate-700 dark:text-slate-300 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-4 focus:ring-slate-200 dark:focus:ring-slate-800 transition-all">
            Try Live Demo
          </a>
        </div>
      </div>
    </section>
  );
};