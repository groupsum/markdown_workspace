import React from 'react';
import { contentFiles } from '../data/content';
import { parseMarkdown } from '../utils/markdownParser';
import { MarkdownViewer } from './MarkdownViewer';
import { ShieldCheck } from 'lucide-react';

interface LegalViewProps {
  page: 'legal/privacy' | 'legal/terms';
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const { metadata, content } = parseMarkdown(contentFiles[page]);

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-3xl mx-auto p-8 md:p-12 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-8 text-indigo-500">
           <ShieldCheck className="w-8 h-8" />
           <span className="font-bold tracking-widest uppercase text-sm">Official Document</span>
        </div>
        <div className="text-xs text-slate-500 mb-4">Last Updated: {metadata.lastUpdated}</div>
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
};