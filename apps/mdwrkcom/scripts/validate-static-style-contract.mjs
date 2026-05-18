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
const sourceCli = read('src', 'cli.mjs');
const sourceLanderTheme = read('..', '..', 'packages', 'lander', 'lander-theme', 'src', 'styles', 'default.css');

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
  '.docs-page-toc',
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
assert.ok(sourceComponents.includes('will-change: transform'), 'Component source must keep first-viewport blob motion on composited transforms.');
assert.ok(sourceComponents.includes('@media (prefers-reduced-motion: reduce)'), 'Component source must keep a reduced-motion override for first-viewport animations.');
assert.ok(sourceComponents.includes('.privacy-badge-dot'), 'Component source must include the animated privacy badge in the reduced-motion policy.');
assert.ok(sourceMarkdown.includes('.lander-markdown'), 'Markdown renderer source must keep the lander markdown scope.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body h2'), 'Markdown renderer source must theme lander markdown headings.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body p'), 'Markdown renderer source must theme lander markdown body text.');
assert.ok(sourceMarkdown.includes('padding: 0.12rem 0.35rem'), 'Markdown renderer source must pad inline code text away from its border.');
assert.ok(sourceMarkdown.includes('padding: 1rem 1.125rem'), 'Markdown renderer source must pad fenced code text away from its border.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body .md-ul'), 'Markdown renderer source must style unordered markdown lists.');
assert.ok(sourceMarkdown.includes('.lander-markdown .markdown-body .md-ol'), 'Markdown renderer source must style ordered markdown lists.');
assert.ok(sourceMarkdown.includes('list-style: disc'), 'Markdown renderer source must render unordered markdown lists with bullets.');
assert.ok(sourceMarkdown.includes('list-style: decimal'), 'Markdown renderer source must render ordered markdown lists with numerals.');
assert.ok(sourceLanderTheme.includes('.hero-copy.home-subtitle'), 'Lander theme source must center the homepage subtitle class.');
assert.ok(sourceLanderTheme.includes('text-align: center'), 'Lander theme source must center homepage subtitle text.');
assert.ok(sourceLanderTheme.includes('.navbar-brand'), 'Lander theme source must own navbar brand layout.');
assert.ok(sourceLanderTheme.includes('margin-right: auto'), 'Lander theme source must keep the navbar brand on the left and links on the right.');
assert.ok(sourceLanderTheme.includes('justify-content: flex-end'), 'Lander theme source must right-align navbar links.');
assert.ok(!sourceLanderTheme.includes('order: 2;'), 'Lander theme source must not reorder navbar actions ahead of links.');
assert.ok(!sourceLanderTheme.includes('order: 1;'), 'Lander theme source must not reorder navbar links away from DOM order.');
assert.ok(sourceCli.includes('--static-bg:#020617'), 'Static renderer critical CSS must include dark first-paint shell variables.');
assert.ok(sourceCli.includes('background:var(--static-bg);color:var(--static-text)'), 'Static renderer critical CSS must paint from resolved theme variables before deferred CSS loads.');
assert.ok(css.includes('.hero-copy.home-subtitle,.home-subtitle'), 'Static stylesheet must center the homepage subtitle class.');
assert.ok(css.includes('text-align:center'), 'Static stylesheet must center homepage subtitle text.');
assert.ok(css.includes('width:min(calc(100% - 2rem),var(--lander-max-width))'), 'Static stylesheet must let navbar-inner span the lander width instead of shrink-wrapping.');
assert.ok(css.includes('.navbar-brand{margin-right:auto}'), 'Static stylesheet must keep the navbar brand on the left at desktop widths.');
assert.ok(css.includes('.navbar-menu-panel{order:initial;margin-left:auto;margin-right:1rem}'), 'Static stylesheet must keep navbar links before the right-side actions.');
assert.ok(css.includes('.navbar-actions{order:initial;margin-left:.75rem}'), 'Static stylesheet must keep theme and GitHub actions on the right of the links.');
assert.ok(css.includes('justify-content:flex-end'), 'Static stylesheet must right-align navbar links.');
assert.ok(css.includes('.locale-switcher-row{display:flex;width:100%;justify-content:flex-end}'), 'Static stylesheet must place locale switchers in a full-width right-aligned row.');
assert.ok(css.includes('.docs-article-column>.locale-switcher-row{margin:0}'), 'Static stylesheet must keep locale switchers inside the docs article column as their own row.');
assert.ok(css.includes('.docs-toc{width:18rem}'), 'Static stylesheet must keep the full docs index rail wide enough for grouped navigation.');
assert.ok(css.includes('.docs-page-toc'), 'Static stylesheet must style page-local heading tables of contents separately from docs and section indexes.');
assert.ok(css.includes('.locale-switcher-summary'), 'Static stylesheet must render locale selection as a dropdown summary.');
assert.ok(css.includes('.locale-switcher-menu'), 'Static stylesheet must render locale links inside a dropdown menu.');
assert.ok(css.includes('.locale-switcher-menu{position:absolute;top:calc(100% + .4rem);right:0'), 'Static stylesheet must anchor the locale dropdown menu to the right edge.');
assert.ok(css.includes('.locale-switcher-option'), 'Static stylesheet must style locale anchors as dropdown options.');
assert.ok(!css.includes('.locale-switcher-link'), 'Static stylesheet must not render locale tags as badge or chip links.');
assert.ok(sourceCli.includes('renderArticleCard(entry, registry, renderLocaleSwitcher(entry, registry))'), 'Static renderer must place the locale switcher inside docs-article-column above article content.');
assert.ok(sourceCli.includes('<div class="locale-switcher-row">'), 'Static renderer must wrap the locale dropdown in a right-aligned row.');
assert.ok(sourceCli.includes('<details class="locale-switcher">'), 'Static renderer must use a dropdown for locale switching.');
assert.ok(sourceCli.includes('class="locale-switcher-option'), 'Static renderer must keep locale targets as anchors inside the dropdown.');
assert.ok(!sourceCli.includes('class="locale-switcher-link'), 'Static renderer must not emit top-level locale badge links.');
assert.ok(css.includes('static-menu-close-icon'), 'Static stylesheet must hide/show the static mobile navbar icons.');
assert.ok(css.includes('.navbar-github-link{display:inline-flex}'), 'Static stylesheet must keep the repository icon action visible at responsive widths.');
assert.ok(css.includes('.navbar-github-link') && css.includes('width:2.5rem'), 'Static stylesheet must keep the repository action icon-only.');
assert.ok(!css.includes('.navbar-github-label'), 'Static stylesheet must not preserve visible repository label styling.');
assert.ok(css.includes('gap:1rem'), 'Static stylesheet must keep the tablet navbar link gap compact.');
assert.ok(css.includes('gap:1.5rem'), 'Static stylesheet must keep the desktop navbar link gap compact.');
assert.ok(css.includes('.navbar-link{padding:0}'), 'Static stylesheet must not add desktop navbar link padding.');
assert.ok(!css.includes('gap:1.75rem'), 'Static stylesheet must not regress to the expanded desktop navbar link gap.');
assert.ok(!css.includes('padding:.625rem .5rem'), 'Static stylesheet must not regress to padded desktop navbar links.');
assert.ok(css.includes('padding:.12rem .35rem') || css.includes('padding:0.12rem 0.35rem'), 'Static stylesheet must pad inline code text away from its border.');
assert.ok(css.includes('padding:1rem 1.125rem'), 'Static stylesheet must pad fenced code text away from its border.');
assert.ok(css.includes('list-style:disc'), 'Static stylesheet must render unordered markdown lists with bullets.');
assert.ok(css.includes('list-style:decimal'), 'Static stylesheet must render ordered markdown lists with numerals.');
assert.ok(css.includes('.hero-blob{will-change:transform}'), 'Static stylesheet must keep hero blob motion composited.');
assert.ok(css.includes('@media (prefers-reduced-motion:reduce){.hero-blob,.privacy-badge-dot{animation:none}}'), 'Static stylesheet must disable first-viewport animations for reduced-motion users.');
assert.ok(sourceCli.includes('critical-path-manifest.json'), 'Static renderer must emit the portable critical path manifest.');
assert.ok(sourceCli.includes('staticRouteScriptFacts'), 'Static renderer must declare route-scoped script facts.');
assert.ok(sourceCli.includes('validateLanderPerformanceBudget'), 'Static renderer must validate portable lander performance budgets.');

console.log('Static style contract validation passed.');
