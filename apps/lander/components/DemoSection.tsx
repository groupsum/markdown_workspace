import React, { useState } from 'react';
import { Terminal, FileText, Code, Eye } from 'lucide-react';
import { MarkdownSourceEditor, createMarkdownEditorThemeStyle } from '@mdwrk/markdown-editor-react';
import { MARKDOWN_RENDERER_REACT_VERSION } from '@mdwrk/markdown-renderer-react';
import { MarkdownViewer } from './MarkdownViewer';

const showcaseMarkdown = `# mdwrk client surface

The lander now demonstrates the same shared packages that the mdwrk client uses.

## Shared packages
| Surface | Package | Notes |
| :--- | :---: | ---: |
| Editor | \`@mdwrk/markdown-editor-react\` | Live |
| Preview | \`@mdwrk/markdown-renderer-react\` | Shared |
| Themes | \`@mdwrk/theme-contract\` | Light + dark |
| Extensions | Runtime-backed | Governed |

## Workspace signals
- [x] Local-first persistence
- [x] Split editor and preview packages
- [x] Extension-ready client host
- [x] Shared theme rendering for docs and blog

## Example
\`\`\`typescript
import { MarkdownSourceEditor } from "@mdwrk/markdown-editor-react";
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";

const surface = {
  client: "@mdwrk/mdwrkspace",
  editor: "@mdwrk/markdown-editor-react",
  preview: "@mdwrk/markdown-renderer-react"
};
\`\`\`
`;

interface DemoSectionProps {
  isDark: boolean;
}

export const DemoSection: React.FC<DemoSectionProps> = ({ isDark }) => {
  const [content, setContent] = useState<string>(showcaseMarkdown);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('preview');
  const renderEngineLabel = 'Render Engine: @mdwrk/markdown-renderer-react ' + MARKDOWN_RENDERER_REACT_VERSION;

  return (
    <section id="demo" className="py-24 bg-slate-100 dark:bg-slate-900 relative transition-colors duration-300 overflow-hidden">
      <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-900/10 skew-y-3 transform origin-bottom-right pointer-events-none"></div>

      <div className="px-4 mx-auto max-w-screen-xl relative z-10">
        <div className="text-center mb-12">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            One Editor Package. One Preview Package. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--lander-accent)] to-[var(--lander-accent-alt)]">Shared Everywhere.</span>
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            The lander demo now runs through the same public mdwrk editor and renderer packages that the client ships.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl flex flex-col h-[650px] transition-colors duration-300">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 flex items-center justify-between border-b border-slate-300 dark:border-slate-700 transition-colors duration-300">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600/20"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-600/20"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 border border-green-600/20"></div>
            </div>

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

          <div className="flex-1 flex overflow-hidden">
            <div className={`w-full lg:w-1/2 h-full border-r border-slate-200 dark:border-slate-800 ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
              <MarkdownSourceEditor
                className="lander-editor w-full h-full"
                value={content}
                onChange={setContent}
                placeholder="Type your markdown here..."
                showLineNumbers={true}
                themeStyle={createMarkdownEditorThemeStyle({
                  background: 'var(--lander-panel)',
                  gutterBackground: 'var(--lander-panel-muted)',
                  border: 'var(--lander-border)',
                  foreground: 'var(--lander-fg)',
                  foregroundMuted: 'var(--lander-fg-muted)',
                  accent: 'var(--lander-accent)',
                  fontMono: 'var(--lander-font-mono)',
                  padding: '1.5rem',
                  fontSize: '0.95rem',
                })}
              />
            </div>

            <div className={`w-full lg:w-1/2 h-full bg-white dark:bg-slate-900 p-8 overflow-y-auto ${activeTab === 'editor' ? 'hidden lg:block' : 'block'}`}>
              <MarkdownViewer content={content} />
            </div>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs text-slate-500 flex justify-between border-t border-slate-300 dark:border-slate-700 font-mono transition-colors duration-300">
             <span className="flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                {renderEngineLabel}
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

