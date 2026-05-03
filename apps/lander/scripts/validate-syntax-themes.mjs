import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderMarkdownToHtmlSync } from '../../../packages/renderer/markdown-renderer-core/dist/index.js';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = path.join(landerRoot, 'styles', 'markdown-renderer.css');
const css = readFileSync(cssPath, 'utf8');

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
  for (const [, name, value] of match[1].matchAll(/(--lander-syntax-[\w-]+):\s*([^;]+);/g)) {
    variables.set(name, value.trim());
  }
  return variables;
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

for (const selector of tokenSelectors) {
  assert.ok(css.includes(selector), `Missing syntax selector ${selector}`);
}

const light = readThemeVariables('lander-light');
const dark = readThemeVariables('lander-dark');

for (const variable of syntaxVariables) {
  assert.ok(light.has(variable), `Light theme missing ${variable}`);
  assert.ok(dark.has(variable), `Dark theme missing ${variable}`);
  assert.notEqual(light.get(variable), dark.get(variable), `${variable} must be theme-specific`);
}

console.log('Lander syntax theme validation passed.');
