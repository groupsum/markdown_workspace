import React from 'react';
import { MarkdownEditInRenderer } from '@mdwrk/markdown-edit-in-renderer-react';
import '@mdwrk/markdown-renderer-react/styles/default.css';
import '@mdwrk/markdown-editor-react/styles/default.css';
import '@mdwrk/markdown-edit-in-renderer-react/styles/default.css';

const INITIAL_MARKDOWN = `# Edit in renderer

Edit directly in this rendered document. This single surface is both the input area and the rendered display.

## Live markdown rendering

Markdown syntax is rendered in place while the document remains editable. Try adding a new line such as \`## Next section\`, \`- new item\`, or \`> note\`.

- Headings stay visually rendered as headings
- Lists stay visually rendered as lists
- **Bold** and _italic_ text render inside the same editable pane

> Blockquotes, code blocks, and tables render without switching panes.

| Syntax | Rendered result |
| --- | --- |
| \`# Title\` | heading |
| \`- Item\` | list item |

\`\`\`tsx
import { MarkdownEditInRenderer } from "@mdwrk/markdown-edit-in-renderer-react";

<MarkdownEditInRenderer value={markdown} onChange={setMarkdown} />
\`\`\`
`;

export function EditInRendererPackageDemo(): React.JSX.Element {
  const [markdown, setMarkdown] = React.useState(INITIAL_MARKDOWN);

  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        padding: 0,
        color: '#172033',
        background: '#ffffff',
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      }}
    >
      <MarkdownEditInRenderer
        value={markdown}
        onChange={setMarkdown}
        autoFocus
        style={{
          minHeight: '100vh',
        }}
        surfaceClassName="edit-in-renderer-demo-surface"
        themeVariables={{
          accent: '#1d4ed8',
          background: '#ffffff',
          backgroundActive: '#ffffff',
          border: 'transparent',
          borderActive: '#1d4ed8',
        }}
      />
    </main>
  );
}
