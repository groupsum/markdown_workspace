import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdownToHtmlSync } from '../../../packages/renderer/markdown-renderer-core/dist/index.js';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = path.join(landerRoot, 'styles', 'markdown-renderer.css');
const demoPath = path.join(landerRoot, 'components', 'DemoSection.tsx');
const markdownViewerPath = path.join(landerRoot, 'components', 'MarkdownViewer.tsx');
const staticCompilerPath = path.join(landerRoot, 'src', 'cli.mjs');
const viteConfigPath = path.join(landerRoot, 'vite.config.ts');
const css = readFileSync(cssPath, 'utf8');
const demoSource = readFileSync(demoPath, 'utf8');
const markdownViewerSource = readFileSync(markdownViewerPath, 'utf8');
const staticCompilerSource = readFileSync(staticCompilerPath, 'utf8');
const viteConfigSource = readFileSync(viteConfigPath, 'utf8');

const syntaxVariables = [
  '--lander-syntax-comment',
  '--lander-syntax-keyword',
  '--lander-syntax-string',
  '--lander-syntax-number',
  '--lander-syntax-function',
  '--lander-syntax-operator',
  '--lander-syntax-tag',
];

const tokenSelectors = [
  '.lander-markdown .token.comment',
  '.lander-markdown .token.keyword',
  '.lander-markdown .token.string',
  '.lander-markdown .token.number',
  '.lander-markdown .token.function',
  '.lander-markdown .token.operator',
  '.lander-markdown .token.tag',
  '.lander-markdown .token.property',
];

function readThemeVariables(themeId) {
  const match = new RegExp(`:root\\[data-lander-theme=['"]${themeId}['"][^{]*\\{([\\s\\S]*?)\\n\\}`, 'm').exec(css);
  assert.ok(match, `Missing ${themeId} theme block in ${cssPath}`);

  const variables = new Map();
  for (const [, name, value] of match[1].matchAll(/(--lander-[\w-]+):\s*([^;]+);/g)) {
    variables.set(name, value.trim());
  }
  return variables;
}

function readShowcaseMarkdown() {
  const match = /const\s+showcaseMarkdown\s*=\s*`([\s\S]*?)`;/m.exec(demoSource);
  assert.ok(match, `Missing showcaseMarkdown template in ${demoPath}`);
  return match[1].replace(/\\`/g, '`');
}

const syntaxFixture = [
  '```ts',
  'const value = call(1);',
  '```',
  '',
  '```json',
  '{"name": "MdWrk", "private": true}',
  '```',
  '',
  '```css',
  '.lander { color: #fff; }',
  '```',
  '',
  '```html',
  '<main class="lander">Docs</main>',
  '```',
].join('\n');

const rendered = renderMarkdownToHtmlSync(syntaxFixture, { profile: 'gfm-default' });
const homepagePreviewMarkdown = readShowcaseMarkdown();
const homepagePreviewHtml = renderMarkdownToHtmlSync(homepagePreviewMarkdown, { profile: 'gfm-default' });

for (const expectedToken of [
  'token keyword',
  'token function',
  'token number',
  'token operator',
  'token property',
  'token string',
  'token boolean',
  'token selector',
  'token tag',
]) {
  assert.match(rendered, new RegExp(expectedToken), `Renderer did not emit ${expectedToken}`);
}

for (const expectedToken of [
  'token keyword',
  'token string',
  'token operator',
  'token punctuation',
]) {
  assert.match(homepagePreviewHtml, new RegExp(expectedToken), `Homepage preview fixture did not emit ${expectedToken}`);
}

for (const selector of tokenSelectors) {
  assert.ok(css.includes(selector), `Missing syntax selector ${selector}`);
}

const light = readThemeVariables('lander-light');
const dark = readThemeVariables('lander-dark');

for (const variable of syntaxVariables) {
  assert.ok(light.has(variable), `Light theme missing ${variable}`);
  assert.ok(dark.has(variable), `Dark theme missing ${variable}`);
  assert.notEqual(light.get(variable), dark.get(variable), `${variable} must be theme-specific`);
  assert.notEqual(light.get(variable), light.get('--lander-code-fg'), `Light ${variable} must differ from the generic code foreground`);
  assert.notEqual(dark.get(variable), dark.get('--lander-code-fg'), `Dark ${variable} must differ from the generic code foreground`);
}

assert.match(
  demoSource,
  /<div className=\{previewPaneClassName\}>\s*<MarkdownViewer content=\{content\} \/>/s,
  'Homepage preview pane must render the editable content through MarkdownViewer.',
);
assert.match(
  staticCompilerSource,
  /from\s+['"]\.\.\/\.\.\/\.\.\/packages\/renderer\/markdown-renderer-core\/dist\/index\.js['"]/,
  'Static lander compiler must import the workspace renderer dist so Docker production output emits syntax tokens.',
);
assert.match(
  staticCompilerSource,
  /const\s+demoPreview\s*=\s*renderMarkdown\(homeDemoMarkdown\)\.html/,
  'Static homepage preview must be rendered from the shared renderer before JavaScript hydration.',
);
assert.match(markdownViewerSource, /<MarkdownRenderer[\s\S]*markdown=\{content\}/s, 'MarkdownViewer must render content through MarkdownRenderer.');
assert.doesNotMatch(
  markdownViewerSource,
  /profile\s*=\s*['"]commonmark-core['"]/,
  'MarkdownViewer must not force the CommonMark profile because it disables code token spans.',
);
assert.match(
  viteConfigSource,
  /find:\s*\/\^@mdwrk\\\/markdown-renderer-core\$\/[\s\S]*packages\/renderer\/markdown-renderer-core\/dist\/index\.js/s,
  'Lander Vite config must resolve markdown-renderer-core from the workspace dist so homepage preview syntax tokens are bundled.',
);
assert.match(
  viteConfigSource,
  /find:\s*\/\^@mdwrk\\\/markdown-renderer-react\$\/[\s\S]*packages\/renderer\/markdown-renderer-react\/dist\/index\.js/s,
  'Lander Vite config must resolve markdown-renderer-react from the workspace dist.',
);

console.log('Lander syntax theme validation passed.');
