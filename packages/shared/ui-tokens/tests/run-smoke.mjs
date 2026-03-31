import assert from 'node:assert/strict';
import {
  createMarkdownWorkspaceThemeTokenMap,
  createRendererThemeBridgeVariableRecord,
  createEditorThemeBridgeVariableRecord,
  renderThemeBridgeCssVariables,
  renderThemeCssVariables,
  MARKDOWN_WORKSPACE_UI_TOKEN_NAMES,
} from '../dist/index.js';

const darkTheme = createMarkdownWorkspaceThemeTokenMap({
  'bg-panel': '#101418',
  'bg-inset': '#16202b',
  'fg-primary': '#f8fafc',
  'fg-secondary': '#d5dde6',
  'fg-muted': '#9fb3c8',
  accent: '#5eead4',
  'border-color': '#334155',
  'font-mono': '"JetBrains Mono", monospace',
  'editor-padding': '24px',
});
assert.equal(darkTheme['bg-panel'], '#101418');

const lightTheme = createMarkdownWorkspaceThemeTokenMap({
  'bg-panel': '#ffffff',
  'bg-inset': '#f4f7fb',
  'fg-primary': '#0f172a',
  'fg-secondary': '#334155',
  'fg-muted': '#64748b',
  accent: '#2563eb',
  'border-color': '#cbd5e1',
});
assert.equal(lightTheme.accent, '#2563eb');

const customTheme = createMarkdownWorkspaceThemeTokenMap({
  'bg-panel': '#1b1028',
  'bg-inset': '#241338',
  'fg-primary': '#f5e8ff',
  'fg-secondary': '#dbc2ff',
  'fg-muted': '#b89add',
  accent: '#ff79c6',
  'border-color': '#6d28d9',
  'editor-padding': '32px',
});
assert.equal(customTheme['editor-padding'], '32px');

const rendererBridge = createRendererThemeBridgeVariableRecord(customTheme);
assert.equal(rendererBridge['--mw-bg-surface'], '#1b1028');
assert.equal(rendererBridge['--mw-accent'], '#ff79c6');

const editorBridge = createEditorThemeBridgeVariableRecord(customTheme);
assert.equal(editorBridge['--mwe-bg-gutter'], '#241338');
assert.equal(editorBridge['--mwe-editor-padding'], '32px');

const rendererCss = renderThemeBridgeCssVariables('renderer', customTheme, { selector: '.custom-renderer' });
assert.ok(rendererCss.includes('--mw-bg-surface: #1b1028;'));
assert.ok(rendererCss.includes('.custom-renderer'));

const editorCss = renderThemeBridgeCssVariables('editor', darkTheme, { selector: '.dark-editor' });
assert.ok(editorCss.includes('--mwe-bg-surface: #101418;'));
assert.ok(editorCss.includes('--mwe-accent: #5eead4;'));

const hostCss = renderThemeCssVariables(lightTheme, { selector: '.light-theme' });
assert.ok(hostCss.includes('--bg-panel: #ffffff;'));
assert.ok(hostCss.includes('--accent: #2563eb;'));

const requiredPhase9Tokens = [
  "editor-line-height",
  "editor-line-rhythm",
  "markdown-line-height",
  "markdown-heading-line-height",
  "line-number-gutter-width",
  "mobile-rail-expanded-width",
  "mobile-expandable-rail-width",
];
for (const tokenName of requiredPhase9Tokens) {
  assert.ok(MARKDOWN_WORKSPACE_UI_TOKEN_NAMES.includes(tokenName));
}

const alignmentTheme = createMarkdownWorkspaceThemeTokenMap({
  "editor-line-height": "1.75rem",
  "editor-line-rhythm": "1.75rem",
  "markdown-line-height": "1.75rem",
  "markdown-heading-line-height": "1.2",
  "line-number-gutter-width": "56px",
  "mobile-rail-expanded-width": "100vw",
  "mobile-expandable-rail-width": "100vw",
});
assert.equal(alignmentTheme["editor-line-height"], "1.75rem");

const alignmentRendererBridge = createRendererThemeBridgeVariableRecord(alignmentTheme);
assert.equal(alignmentRendererBridge["--mw-line-height"], "1.75rem");
assert.equal(alignmentRendererBridge["--mw-heading-line-height"], "1.2");

const alignmentEditorBridge = createEditorThemeBridgeVariableRecord(alignmentTheme);
assert.equal(alignmentEditorBridge["--mwe-line-height"], "1.75rem");
assert.equal(alignmentEditorBridge["--mwe-gutter-width"], "56px");


console.log('ui-tokens smoke: ok');
