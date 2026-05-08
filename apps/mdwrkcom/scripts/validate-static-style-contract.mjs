import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const css = read('styles', 'static.css');
const sourceComponents = read('styles', 'components.css');
const sourceBase = read('styles', 'base.css');
const sourceMarkdown = read('styles', 'markdown-renderer.css');

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  return [
    Number.parseInt(normalized.slice(0, 2), 16) / 255,
    Number.parseInt(normalized.slice(2, 4), 16) / 255,
    Number.parseInt(normalized.slice(4, 6), 16) / 255,
  ];
};

const linearize = (value) => (
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
);

const relativeLuminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map(linearize);
  return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
};

const contrastRatio = (foreground, background) => {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
};

const assertAaContrast = (label, foreground, background, minimum = 4.5) => {
  const ratio = contrastRatio(foreground, background);
  assert.ok(
    ratio >= minimum,
    `${label} contrast ${ratio.toFixed(2)}:1 must be at least ${minimum}:1.`,
  );
};

for (const token of [
  '--lander-app-bg:#f8fafc',
  '--lander-app-bg:#020617',
  '--lander-panel-muted:#eff6ff',
  '--lander-accent:#4f46e5',
  '--lander-accent:#818cf8',
  '--lander-success:#047857',
  '--lander-success:#34d399',
]) {
  assert.ok(css.includes(token), `Static stylesheet must include MdWrk lander theme token ${token}.`);
}

for (const contrastCase of [
  ['light foreground', '#0f172a', '#f8fafc'],
  ['light muted foreground', '#475569', '#f8fafc'],
  ['light subtle foreground', '#475569', '#f8fafc'],
  ['light success foreground', '#047857', '#f8fafc'],
  ['light accent foreground', '#4f46e5', '#f8fafc'],
  ['light accent alternate foreground', '#0e7490', '#f8fafc'],
  ['dark foreground', '#f8fafc', '#020617'],
  ['dark muted foreground', '#94a3b8', '#020617'],
  ['dark subtle foreground', '#94a3b8', '#020617'],
  ['dark success foreground', '#34d399', '#020617'],
  ['dark accent foreground', '#818cf8', '#020617'],
  ['dark accent alternate foreground', '#22d3ee', '#020617'],
]) {
  assertAaContrast(...contrastCase);
}

for (const className of [
  '.navbar',
  '.footer',
  '.hero-section',
  '.features-section',
  '.demo-section',
  '.demo-editor-pane',
  '.demo-preview-pane',
  '.privacy-section',
  '.docs-content-card',
  '.faq-section',
  '.related-section',
  '.lander-page__hero',
  '.lander-page__card',
  '.lander-markdown .markdown-body h2',
  '.lander-markdown .markdown-body p',
]) {
  assert.ok(css.includes(className), `Static stylesheet must include ${className}.`);
}

for (const sourceSignal of [
  '.demo-editor-pane',
  '.demo-preview-pane',
  '.navbar',
  '.footer',
]) {
  assert.ok(sourceComponents.includes(sourceSignal), `Component source must keep ${sourceSignal}.`);
}

assert.ok(sourceBase.includes('@keyframes lander-blob'), 'Base source must keep the pre-split lander blob animation.');
assert.ok(sourceMarkdown.includes('.lander-markdown'), 'Markdown renderer source must keep the lander markdown scope.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body h2'), 'Markdown renderer source must theme lander markdown headings.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body p'), 'Markdown renderer source must theme lander markdown body text.');
assert.ok(sourceMarkdown.includes('padding: 0.12rem 0.35rem'), 'Markdown renderer source must pad inline code text away from its border.');
assert.ok(sourceMarkdown.includes('padding: 1rem 1.125rem'), 'Markdown renderer source must pad fenced code text away from its border.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body .md-ul'), 'Markdown renderer source must style unordered markdown lists.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body .md-ol'), 'Markdown renderer source must style ordered markdown lists.');
assert.ok(sourceMarkdown.includes('list-style: disc'), 'Markdown renderer source must render unordered markdown lists with bullets.');
assert.ok(sourceMarkdown.includes('list-style: decimal'), 'Markdown renderer source must render ordered markdown lists with numerals.');
assert.ok(css.includes('padding:.12rem .35rem') || css.includes('padding:0.12rem 0.35rem'), 'Static stylesheet must pad inline code text away from its border.');
assert.ok(css.includes('padding:1rem 1.125rem'), 'Static stylesheet must pad fenced code text away from its border.');
assert.ok(css.includes('list-style:disc'), 'Static stylesheet must render unordered markdown lists with bullets.');
assert.ok(css.includes('list-style:decimal'), 'Static stylesheet must render ordered markdown lists with numerals.');

console.log('Static style contract validation passed.');
