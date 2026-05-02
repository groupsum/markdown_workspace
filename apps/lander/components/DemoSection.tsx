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
  const editorTabClassName = ['demo-tab-button', activeTab === 'editor' ? 'is-active' : 'is-inactive'].join(' ');
  const previewTabClassName = ['demo-tab-button', activeTab === 'preview' ? 'is-active' : 'is-inactive'].join(' ');
  const editorPaneClassName = ['demo-editor-pane', activeTab === 'preview' ? 'is-preview-hidden' : 'is-editor-visible'].join(' ');
  const previewPaneClassName = ['demo-preview-pane', activeTab === 'editor' ? 'is-editor-hidden' : 'is-preview-visible'].join(' ');

  return (
    <section id="demo" className="demo-section">
      <div className="demo-backdrop"></div>

      <div className="demo-container">
        <div className="demo-header">
          <h2 className="demo-heading">
            One Editor Package. One Preview Package. <span className="demo-heading-accent">Shared Everywhere.</span>
          </h2>
          <p className="demo-copy">
            The lander demo now runs through the same public mdwrk editor and renderer packages that the client ships.
          </p>
        </div>

        <div className="demo-frame">
          <div className="demo-toolbar">
            <div className="demo-toolbar-lights">
              <div className="demo-light demo-light-red"></div>
              <div className="demo-light demo-light-yellow"></div>
              <div className="demo-light demo-light-green"></div>
            </div>

            <div className="demo-tablist">
               <button
                onClick={() => setActiveTab('editor')}
                className={editorTabClassName}
               >
                 <Code className="demo-tab-icon" /> Editor
               </button>
               <button
                onClick={() => setActiveTab('preview')}
                className={previewTabClassName}
               >
                 <Eye className="demo-tab-icon" /> Preview
               </button>
            </div>

            <div className="demo-filename">
               <FileText className="demo-filename-icon" />
               demo_showcase.md
            </div>
          </div>

          <div className="demo-body">
            <div className={editorPaneClassName}>
              <MarkdownSourceEditor
                className="lander-editor"
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

            <div className={previewPaneClassName}>
              <MarkdownViewer content={content} />
            </div>
          </div>

          <div className="demo-statusbar">
             <span className="demo-status-primary">
                <Terminal className="demo-status-icon" />
                {renderEngineLabel}
             </span>
             <span className="demo-status-secondary">
                <span>{content.split(/\s+/).filter(x => x.length > 0).length} words</span>
                <span>{content.length} chars</span>
             </span>
          </div>
        </div>
      </div>
    </section>
  );
};

