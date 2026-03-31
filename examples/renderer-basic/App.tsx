import React from 'react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@mdwrk/markdown-renderer-react';
import './styles.css';

type OptionalExtensionId = 'definition-lists' | 'math' | 'footnotes';
type ThemePresetId = 'default' | 'research-science' | 'industrial';

const THEME_PRESETS: Record<ThemePresetId, { label: string; style: React.CSSProperties }> = {
  default: {
    label: 'Default dark',
    style: createMarkdownRendererThemeStyle(),
  },
  'research-science': {
    label: 'Research science',
    style: createMarkdownRendererThemeStyle({
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
    style: createMarkdownRendererThemeStyle({
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

const OPTIONAL_EXTENSION_OPTIONS: readonly { id: OptionalExtensionId; label: string }[] = [
  { id: 'definition-lists', label: 'Definition lists' },
  { id: 'math', label: 'Math' },
  { id: 'footnotes', label: 'Footnotes' },
] as const;

const markdown = `# Portable Markdown Renderer

This example is rendered through **@mdwrk/markdown-renderer-react** with the default GFM profile.

- [x] task lists
- ~~strikethrough~~
- literal autolinks like https://example.com and docs@example.com
- aligned tables

| Package | Responsibility | Status |
| :--- | ---: | :---: |
| core | parse/render pipeline | stable |
| react | bindings + theme bridge | ready |

Term
: Definition list support can be enabled per profile.

Equation: $E=mc^2$

Here is a footnote.[^1]

[^1]: Optional profiles are explicitly opt-in and certification-scoped.

\`\`\`ts
export const portable = true;
\`\`\`
`;

export default function App(): React.JSX.Element {
  const [themePreset, setThemePreset] = React.useState<ThemePresetId>('industrial');
  const [enabledExtensions, setEnabledExtensions] = React.useState<OptionalExtensionId[]>(['definition-lists', 'math', 'footnotes']);

  const currentTheme = THEME_PRESETS[themePreset];

  const toggleExtension = (extensionId: OptionalExtensionId) => {
    setEnabledExtensions((current) => current.includes(extensionId)
      ? current.filter((entry) => entry !== extensionId)
      : [...current, extensionId]);
  };

  return (
    <main className="example-shell">
      <h1>Portable Markdown Renderer</h1>
      <p>This example validates the reusable renderer package directly, including default GFM and optional profile rendering.</p>
      <div className="toolbar">
        <label className="toolbar-select">
          <span>Theme</span>
          <select value={themePreset} onChange={(event) => setThemePreset(event.target.value as ThemePresetId)}>
            {Object.entries(THEME_PRESETS).map(([id, theme]) => (
              <option key={id} value={id}>{theme.label}</option>
            ))}
          </select>
        </label>
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
      <section className="preview-card" style={currentTheme.style}>
        <MarkdownRenderer
          markdown={markdown}
          profile="gfm-default"
          extensions={enabledExtensions}
          themeStyle={currentTheme.style}
        />
      </section>
    </main>
  );
}
