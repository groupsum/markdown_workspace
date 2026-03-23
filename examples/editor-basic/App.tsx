import React from 'react';
import {
  MarkdownSourceEditor,
  createMarkdownEditorThemeStyle,
  type MarkdownSourceEditorHandle,
} from '@markdown-workspace/markdown-editor-react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@markdown-workspace/markdown-renderer-react';
import './styles.css';

const initialMarkdown = `# Portable Markdown Editor

This example uses **@markdown-workspace/markdown-editor-react** with the shared renderer package on the right.

- Ctrl/Cmd+B: bold
- Ctrl/Cmd+I: italic
- Tab / Shift+Tab: indent and outdent
- Ctrl/Cmd+Z / Ctrl+Y: undo and redo

| Package | Responsibility |
| --- | --- |
| editor-core | selection transforms, commands, history |
| editor-react | textarea surface, keyboard wiring |
| renderer-react | preview |
`;

export default function App(): React.JSX.Element {
  const editorRef = React.useRef<MarkdownSourceEditorHandle>(null);
  const [value, setValue] = React.useState(initialMarkdown);

  return (
    <main className="example-shell">
      <h1>Portable Editor Example</h1>
      <p>Source-mode editing is reusable outside the main Markdown Workspace client.</p>
      <div className="toolbar">
        <button onClick={() => editorRef.current?.executeCommand('bold')}>Bold</button>
        <button onClick={() => editorRef.current?.executeCommand('italic')}>Italic</button>
        <button onClick={() => editorRef.current?.executeCommand('strikethrough')}>Strike</button>
        <button onClick={() => editorRef.current?.executeCommand('undo')}>Undo</button>
        <button onClick={() => editorRef.current?.executeCommand('redo')}>Redo</button>
      </div>
      <div className="example-grid">
        <section className="editor-card">
          <MarkdownSourceEditor
            ref={editorRef}
            value={value}
            onChange={setValue}
            themeStyle={createMarkdownEditorThemeStyle()}
          />
        </section>
        <section className="preview-card">
          <MarkdownRenderer
            markdown={value}
            themeStyle={createMarkdownRendererThemeStyle()}
          />
        </section>
      </div>
    </main>
  );
}
