import React, { useState } from 'react';
import { Terminal, FileText, Code, Eye } from 'lucide-react';
import { MarkdownViewer } from './MarkdownViewer';

const showcaseMarkdown = `# Feature Showcase

## 1. Rich Text Formatting
You can use **Bold**, *Italic*, ~~Strikethrough~~, or even ^Superscript^ and ~Subscript~.

## 2. Dynamic Tables
| Feature | Status | Performance |
| :--- | :---: | ---: |
| Offline Mode | ✅ | Instant |
| PWA Support | ✅ | Native |
| Themes | ✅ | 12 Built-in |
| Encryption | 🛡️ | AES-256 |

## 3. Lists & Tasks
- [x] Implement Markdown Engine
- [x] Deprecate AI Dependencies
- [ ] World Domination (Local-only)

## 4. Code Blocks
\`\`\`typescript
const app = {
  name: "MdWrkSpace",
  localFirst: true,
  privacy: "Maximum"
};
\`\`\`

## 5. Visuals & Quotes
> "Privacy is not an option, and it shouldn't be the price we pay for just getting on the internet." — Gary Kovacs

![Markdown Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Markdown-mark.svg/208px-Markdown-mark.svg.png)
`;

interface DemoSectionProps {
  isDark: boolean;
}

export const DemoSection: React.FC<DemoSectionProps> = ({ isDark }) => {
  const [content, setContent] = useState<string>(showcaseMarkdown);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');

  return (
    <section id="demo" className="py-24 bg-slate-100 dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 skew-y-3 transform origin-bottom-right pointer-events-none"></div>
      
      <div className="px-4 mx-auto max-w-screen-xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            A Workspace Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">Writers</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Experience the industry's most robust local-first markdown engine. No cloud, no lag, just pure expression.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-[650px] transition-colors duration-300">
          {/* Fake Window Header */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600/20"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/20"></div>
            </div>
            
            {/* View Switcher for Mobile/Small views */}
            <div className="flex bg-slate-200 dark:bg-slate-700 p-1 rounded-lg">
               <button 
                onClick={() => setActiveTab('editor')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'editor' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
               >
                 <Code className="w-3 h-3" /> Editor
               </button>
               <button 
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'}`}
               >
                 <Eye className="w-3 h-3" /> Preview
               </button>
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 hidden sm:flex items-center gap-2">
               <FileText className="w-3 h-3" />
               demo_showcase.md
            </div>
          </div>

          {/* Side-by-Side Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Editor Area */}
            <div className={`w-full lg:w-1/2 h-full border-r border-slate-200 dark:border-slate-800 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
              <textarea
                className="w-full h-full bg-slate-50 dark:bg-[#0d1117] text-slate-800 dark:text-slate-300 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed transition-colors duration-300"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                spellCheck={false}
                placeholder="Type your markdown here..."
              />
            </div>
            
            {/* Preview Area */}
            <div className={`w-full lg:w-1/2 h-full bg-white dark:bg-slate-900 p-8 overflow-y-auto ${activeTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
              <MarkdownViewer content={content} />
            </div>
          </div>
          
          {/* Status Bar */}
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs text-slate-500 flex justify-between border-t border-slate-300 dark:border-slate-700 font-mono transition-colors duration-300">
             <span className="flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                Render Engine: Marked 12.0
             </span>
             <span className="flex items-center gap-4">
                <span>{content.split(/\s+/).filter(x => x.length > 0).length} words</span>
                <span>{content.length} chars</span>
             </span>
          </div>
        </div>
      </div>
    </section>
  );
};