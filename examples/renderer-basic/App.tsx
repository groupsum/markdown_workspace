import React from 'react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@markdown-workspace/markdown-renderer-react';
import './styles.css';

const markdown = `# Portable Markdown Renderer

This example is rendered through **@markdown-workspace/markdown-renderer-react**.

- GFM checklists
- tables
- fenced code blocks
- semantic class names

| Package | Responsibility |
| --- | --- |
| core | parse/render pipeline |
| react | bindings + theme bridge |

\`\`\`ts
export const portable = true;
\`\`\`
`;

export default function App(): React.JSX.Element {
  return (
    <main className="example-shell">
      <MarkdownRenderer
        markdown={markdown}
        themeStyle={createMarkdownRendererThemeStyle({
          foreground: '#e6edf5',
          foregroundMuted: '#9ba8b8',
          accent: '#7cc5ff',
          background: '#151a21',
          border: 'rgba(255,255,255,0.12)',
          codeBackground: '#0d1117',
          codeBorder: 'rgba(255,255,255,0.12)',
        })}
      />
    </main>
  );
}
