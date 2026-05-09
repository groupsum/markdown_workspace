import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');
const validateGenerated = process.argv.includes('--generated');

const cliSource = read('src', 'cli.mjs');

for (const token of [
  '--static-bg:#f8fafc',
  '--static-bg:#020617',
  '--static-text:#edf4ff',
  '--static-muted:#94a3b8',
  '--static-accent:#818cf8',
  '*{box-sizing:border-box}',
  'body{margin:0;background:var(--static-bg);color:var(--static-text)',
  '.app-shell{min-height:100vh;background:var(--static-bg);color:var(--static-text)}',
  '.navbar-inner{display:flex;align-items:center;justify-content:space-between;width:min(100%,1180px);min-height:4rem;margin:0 auto;padding:.7rem 1rem;gap:1rem}',
  '.navbar-brand-icon{display:block;width:1.5rem;height:1.5rem;flex:0 0 auto}',
  '.navbar-theme-icon,.navbar-menu-icon,.navbar-github-icon,.static-menu-close-icon{display:block;width:1.25rem;height:1.25rem;flex:0 0 auto}',
  '.navbar-menu-panel.is-closed{display:none}',
  '.docs-sidebar,.docs-toc{display:none}',
  '.docs-article-column{display:flex;min-width:0;flex-direction:column;gap:1rem}',
  '.lander-content-card,.docs-content-card{background:var(--static-panel);border:1px solid var(--static-border);border-radius:1rem;padding:clamp(1.25rem,4vw,2.5rem);box-shadow:0 20px 80px rgba(2,6,23,.18)}',
  '.lander-markdown .markdown-body{color:var(--static-text);font-size:1rem;line-height:1.75}',
  '.navbar-menu-panel,.navbar-menu-panel.is-closed{display:block;position:static;margin-left:auto;padding:0;background:transparent;border:0;border-radius:0;box-shadow:none}',
  '.navbar-actions{margin-left:.75rem}',
  '.navbar-github-link{width:auto;padding:.5rem .75rem;gap:.35rem}',
]) {
  assert.ok(cliSource.includes(token), `Static first-paint critical CSS must include ${token}.`);
}

assert.ok(
  !cliSource.includes('.app-shell{min-height:100vh;background:var(--static-bg,#f8fafc);color:var(--static-text,#102033)}'),
  'Static first-paint critical CSS must not fall back to light app-shell colors.',
);

const samplePagePath = path.join(landerRoot, 'dist-static', 'docs', 'quickstart', 'index.html');
if (validateGenerated) {
  assert.ok(existsSync(samplePagePath), 'Generated static page sample must exist before generated first-paint validation.');
  const html = readFileSync(samplePagePath, 'utf8');
  const bootstrapIndex = html.indexOf("const key = 'mdwrk:lander-theme'");
  const criticalCssIndex = html.indexOf('data-lander-critical-css="mdwrkcom-static-shell"');
  const stylesheetIndex = html.indexOf('rel="preload"');

  assert.ok(bootstrapIndex > -1, 'Generated static page must include the theme bootstrap.');
  assert.ok(criticalCssIndex > -1, 'Generated static page must include critical CSS.');
  assert.ok(stylesheetIndex > -1, 'Generated static page must include deferred stylesheet preload.');
  assert.ok(bootstrapIndex < criticalCssIndex, 'Theme bootstrap must run before critical CSS is parsed.');
  assert.ok(criticalCssIndex < stylesheetIndex, 'Critical CSS must be available before the deferred stylesheet.');
  assert.ok(html.includes('--static-bg:#020617'), 'Generated critical CSS must include dark first-paint background variables.');
  assert.ok(html.includes('background:var(--static-bg);color:var(--static-text)'), 'Generated critical CSS must paint shell from theme variables.');
  assert.ok(html.includes('.navbar-brand-icon{display:block;width:1.5rem;height:1.5rem;flex:0 0 auto}'), 'Generated critical CSS must constrain navbar brand icon size.');
  assert.ok(html.includes('.navbar-menu-panel.is-closed{display:none}'), 'Generated critical CSS must keep closed nav menu hidden before deferred CSS loads.');
  assert.ok(html.includes('.docs-sidebar,.docs-toc{display:none}'), 'Generated critical CSS must keep docs chrome from crowding article content before deferred CSS loads.');
  assert.ok(html.includes('.lander-markdown .markdown-body{color:var(--static-text);font-size:1rem;line-height:1.75}'), 'Generated critical CSS must expose readable article content before deferred CSS loads.');
  assert.ok(
    html.indexOf('class="navbar-menu-panel is-closed"') < html.indexOf('class="navbar-actions"'),
    'Generated navbar markup must render links before right-side theme and GitHub actions.',
  );
}

console.log('Static first-paint theme validation passed.');
