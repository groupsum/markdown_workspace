import React from 'react';
import { WifiOff, Shield, Database, Github, Smartphone, Zap, Palette } from 'lucide-react';
import { FeatureItem } from '../types';

const features: FeatureItem[] = [
  {
    title: "Offline First",
    description: "Built as a Progressive Web App (PWA). Install it once, run it anywhere without an internet connection.",
    icon: WifiOff
  },
  {
    title: "Zero Knowledge",
    description: "We don't have a backend server. Your data never leaves your device unless you push it to your own GitHub.",
    icon: Shield
  },
  {
    title: "Local Database",
    description: "Powered by IndexedDB for instant saves and lightning-fast full-text search across all your documents.",
    icon: Database
  },
  {
    title: "GitHub Sync",
    description: "Optional integration with GitHub REST API. Use your personal access token to sync repositories.",
    icon: Github
  },
  {
    title: "Custom Themes",
    description: "Comes with 12+ built-in themes including Solarized, Dracula, and GitHub Light. Switch instantly to match your mood.",
    icon: Palette
  },
  {
    title: "Blazing Fast",
    description: "No network latency for saving or typing. The editor is optimized for performance.",
    icon: Zap
  }
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="bg-white dark:bg-slate-900 py-24 border-t border-slate-200 dark:border-slate-800/50 transition-colors duration-300">
      <div className="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div className="max-w-screen-md mb-8 lg:mb-16">
          <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white">
            Designed for <span className="text-emerald-500 dark:text-emerald-400">Privacy</span>, Built for <span className="text-indigo-600 dark:text-indigo-400">Speed</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 sm:text-xl">
            Most markdown editors require you to trust their servers. We took a different approach. The app is just a shell; the data is all yours.
          </p>
        </div>
        <div className="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-12 md:space-y-0">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col p-6 mx-auto max-w-lg text-left rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex justify-center items-center mb-4 w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                <feature.icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};