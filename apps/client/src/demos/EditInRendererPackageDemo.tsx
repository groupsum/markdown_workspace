import React from 'react';
import {
  MarkdownEditInRenderer,
  MARKDOWN_EDIT_IN_RENDERER_REACT_VERSION,
} from '@mdwrk/markdown-edit-in-renderer-react';
import '@mdwrk/markdown-renderer-react/styles/default.css';
import '@mdwrk/markdown-editor-react/styles/default.css';
import '@mdwrk/markdown-edit-in-renderer-react/styles/default.css';

const INITIAL_MARKDOWN = `# Edit in renderer

Click any rendered block to edit it in place. The package keeps the document in rendered flow until a block is active.

- Renderer package handles inactive blocks
- Editor package handles active source blocks
- Whole-document markdown is emitted on change

\`\`\`ts
import { MarkdownEditInRenderer } from "@mdwrk/markdown-edit-in-renderer-react";
\`\`\`
`;

export function EditInRendererPackageDemo(): React.JSX.Element {
  const [markdown, setMarkdown] = React.useState(INITIAL_MARKDOWN);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(320px, 38vw)',
        gap: '24px',
        padding: '24px',
        color: '#172033',
        background: '#eef2f7',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <section
        style={{
          minWidth: 0,
          background: '#ffffff',
          border: '1px solid #cfd8e6',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 16px 42px rgba(15, 23, 42, 0.14)',
        }}
      >
        <header style={{ marginBottom: '16px' }}>
          <div style={{ color: '#526174', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
            @mdwrk/markdown-edit-in-renderer-react {MARKDOWN_EDIT_IN_RENDERER_REACT_VERSION}
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: '24px', lineHeight: 1.15 }}>
            Typora-style edit-in-renderer package demo
          </h1>
        </header>

        <MarkdownEditInRenderer
          value={markdown}
          onChange={setMarkdown}
          autoFocus
          themeVariables={{
            accent: '#1d4ed8',
            background: '#ffffff',
            backgroundActive: '#f8fbff',
            borderActive: '#1d4ed8',
          }}
        />
      </section>

      <aside
        style={{
          minWidth: 0,
          background: '#111827',
          color: '#dbeafe',
          border: '1px solid #24324a',
          borderRadius: '8px',
          padding: '16px',
          overflow: 'auto',
        }}
      >
        <h2 style={{ margin: '0 0 12px', fontSize: '13px', textTransform: 'uppercase' }}>Live Markdown</h2>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: 1.5 }}>
          {markdown}
        </pre>
      </aside>
    </main>
  );
}
