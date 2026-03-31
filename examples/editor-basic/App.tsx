import React from 'react';
import {
  MarkdownSourceEditor,
  createMarkdownEditorThemeStyle,
  type MarkdownSourceEditorHandle,
} from '@mdwrk/markdown-editor-react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@mdwrk/markdown-renderer-react';
import './styles.css';

type OptionalExtensionId = 'definition-lists' | 'math' | 'footnotes';
type ThemePresetId = 'default' | 'research-science' | 'industrial';

const THEME_PRESETS: Record<ThemePresetId, { label: string; editor: React.CSSProperties; renderer: React.CSSProperties }> = {
  default: {
    label: 'Default dark',
    editor: createMarkdownEditorThemeStyle(),
    renderer: createMarkdownRendererThemeStyle(),
  },
  'research-science': {
    label: 'Research science',
    editor: createMarkdownEditorThemeStyle({
      background: '#f7f9fc',
      foreground: '#10213f',
      foregroundMuted: '#506179',
      accent: '#224f9c',
      border: 'rgba(16, 33, 63, 0.14)',
      gutterBackground: '#eef2f7',
      lineHeight: '1.75rem',
      gutterWidth: '64px',
    }),
    renderer: createMarkdownRendererThemeStyle({
      foreground: '#10213f',
      foregroundMuted: '#506179',
      accent: '#224f9c',
      background: '#f7f9fc',
      border: 'rgba(16, 33, 63, 0.14)',
      codeBackground: '#eef2f7',
      codeBorder: 'rgba(16, 33, 63, 0.14)',
      lineHeight: '1.75rem',
      headingLineHeight: '1.2',
    }),
  },
  industrial: {
    label: 'Industrial high-contrast',
    editor: createMarkdownEditorThemeStyle({
      background: '#0f1216',
      foreground: '#f5f7fa',
      foregroundMuted: '#a1aab5',
      accent: '#ff7a00',
      border: 'rgba(255,255,255,0.16)',
      gutterBackground: '#0a0d11',
      lineHeight: '1.85rem',
      gutterWidth: '68px',
    }),
    renderer: createMarkdownRendererThemeStyle({
      foreground: '#f5f7fa',
      foregroundMuted: '#a1aab5',
      accent: '#ff7a00',
      background: '#151a21',
      border: 'rgba(255,255,255,0.16)',
      codeBackground: '#0d1117',
      codeBorder: 'rgba(255,255,255,0.16)',
      lineHeight: '1.85rem',
      headingLineHeight: '1.15',
    }),
  },
};

const initialMarkdown = `# Portable Markdown Editor

This example uses **@mdwrk/markdown-editor-react** with the reusable renderer package on the right.

- Ctrl/Cmd+B: bold
- Ctrl/Cmd+I: italic
- Ctrl/Cmd+Shift+X: strikethrough
- toolbar Bullet button: create unordered list items
- toolbar Task button: create unchecked task items
- Tab / Shift+Tab: indent and outdent
- Enter on a list item: continue the list
- Enter on an empty task item: terminate the list
- Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z: undo and redo

- [x] preview task item
- [ ] another task item
- visit https://example.com for the docs

1. Ordered list continuation is demonstrated here.
2. Place the caret after this line and press Enter.

| Package | Responsibility |
| --- | --- |
| editor-core | selection transforms, commands, history |
| editor-react | textarea surface, keyboard wiring |
| renderer-react | preview |

Term
: Optional profiles can be previewed in the reusable renderer package.

Math: $E=mc^2$

Footnote ref.[^1]

[^1]: The example opts into definition lists, math, and footnotes when toggled on.
`;

const OPTIONAL_EXTENSION_OPTIONS: readonly { id: OptionalExtensionId; label: string }[] = [
  { id: 'definition-lists', label: 'Definition lists' },
  { id: 'math', label: 'Math' },
  { id: 'footnotes', label: 'Footnotes' },
] as const;

export default function App(): React.JSX.Element {
  const editorRef = React.useRef<MarkdownSourceEditorHandle>(null);
  const [value, setValue] = React.useState(initialMarkdown);
  const [showLineNumbers, setShowLineNumbers] = React.useState(true);
  const [themePreset, setThemePreset] = React.useState<ThemePresetId>('default');
  const [enabledExtensions, setEnabledExtensions] = React.useState<OptionalExtensionId[]>(['definition-lists', 'math', 'footnotes']);

  const currentTheme = THEME_PRESETS[themePreset];

  const toggleExtension = (extensionId: OptionalExtensionId) => {
    setEnabledExtensions((current) => current.includes(extensionId)
      ? current.filter((entry) => entry !== extensionId)
      : [...current, extensionId]);
  };

  return (
    <main className="example-shell">
      <h1>Portable Editor Example</h1>
      <p>This example exercises the public editor package surface rather than private workspace wiring.</p>
      <div className="toolbar">
        <button onClick={() => editorRef.current?.executeCommand('bold')}>Bold</button>
        <button onClick={() => editorRef.current?.executeCommand('italic')}>Italic</button>
        <button onClick={() => editorRef.current?.executeCommand('strikethrough')}>Strike</button>
        <button onClick={() => editorRef.current?.executeCommand('bullet-list')}>Bullet</button>
        <button onClick={() => editorRef.current?.executeCommand('task-list')}>Task</button>
        <button onClick={() => editorRef.current?.executeCommand('indent')}>Indent</button>
        <button onClick={() => editorRef.current?.executeCommand('outdent')}>Outdent</button>
        <button onClick={() => editorRef.current?.executeCommand('inline-math')}>Math</button>
        <button onClick={() => editorRef.current?.executeCommand('footnote')}>Footnote</button>
        <button onClick={() => editorRef.current?.executeCommand('undo')}>Undo</button>
        <button onClick={() => editorRef.current?.executeCommand('redo')}>Redo</button>
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={showLineNumbers}
            onChange={(event) => setShowLineNumbers(event.target.checked)}
          />
          <span>Line numbers</span>
        </label>
        <label className="toolbar-select">
          <span>Theme</span>
          <select value={themePreset} onChange={(event) => setThemePreset(event.target.value as ThemePresetId)}>
            {Object.entries(THEME_PRESETS).map(([id, theme]) => (
              <option key={id} value={id}>{theme.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="toolbar profile-toggle-row">
        {OPTIONAL_EXTENSION_OPTIONS.map((option) => (
          <label key={option.id} className="toolbar-toggle">
            <input
              type="checkbox"
              checked={enabledExtensions.includes(option.id)}
              onChange={() => toggleExtension(option.id)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      <div className="example-grid">
        <section className="editor-card">
          <MarkdownSourceEditor
            ref={editorRef}
            value={value}
            onChange={setValue}
            showLineNumbers={showLineNumbers}
            themeStyle={currentTheme.editor}
          />
        </section>
        <section className="preview-card" style={currentTheme.renderer}>
          <MarkdownRenderer
            markdown={value}
            profile="gfm-default"
            extensions={enabledExtensions}
            themeStyle={currentTheme.renderer}
          />
        </section>
      </div>
    </main>
  );
}
