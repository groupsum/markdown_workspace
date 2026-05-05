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

for (const token of [
  '--lander-app-bg:#f8fafc',
  '--lander-app-bg:#020617',
  '--lander-panel-muted:#eff6ff',
  '--lander-accent:#4f46e5',
  '--lander-accent:#818cf8',
]) {
  assert.ok(css.includes(token), `Static stylesheet must include MdWrk lander theme token ${token}.`);
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

console.log('Static style contract validation passed.');
