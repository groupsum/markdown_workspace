import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const navbar = read('components', 'Navbar.tsx');
const css = read('styles', 'components.css');
const staticCompiler = read('src', 'cli.mjs');

const reactNavLinks = [
  ['/', 'Home'],
  ['/features/offline-markdown-editor', 'Features'],
  ['/compare/obsidian', 'Compare'],
  ['/docs', 'Docs'],
  ['/blog', 'News'],
  ['/privacy', 'Privacy'],
];

const staticNavLinks = [
  ['/', 'Home'],
  ['/features/offline-markdown-editor/', 'Features'],
  ['/compare/obsidian/', 'Compare'],
  ['/docs/', 'Docs'],
  ['/blog/', 'News'],
  ['/privacy/', 'Privacy'],
];

assert.match(navbar, /<nav\s+className="navbar">/, 'React header must render the lander navbar element.');
assert.match(navbar, /<span\s+className="navbar-brand-text">MdWrk<\/span>/, 'React header must render the MdWrk brand text.');
assert.match(navbar, /<CloudOff\s+className="navbar-brand-icon"\s*\/>/, 'React header must render the MdWrk brand icon.');
assert.match(navbar, /aria-label=\{`Toggle theme\. Active theme: \$\{themeLabel\}`\}/, 'React header theme toggle must expose the active theme label.');
assert.match(navbar, /aria-controls="navbar-sticky"/, 'React mobile menu toggle must control the sticky navigation panel.');
assert.match(navbar, /aria-expanded=\{isOpen\}/, 'React mobile menu toggle must expose expanded state.');

for (const [target, label] of reactNavLinks) {
  assert.match(
    navbar,
    new RegExp(`\\{\\s*id:\\s*['"]${target.replaceAll('/', '\\/')}['"],\\s*label:\\s*['"]${label}['"]\\s*\\}`),
    `React header must include ${label} navigation targeting ${target}.`,
  );
}

assert.match(navbar, /href=\{links\.githubRepo\}/, 'React header GitHub CTA must use the configured repository URL.');
assert.match(navbar, /className="navbar-github-link"/, 'React header GitHub CTA must use the grouped CTA class.');
assert.match(navbar, /aria-label="Open MdWrk GitHub repository"/, 'React header GitHub CTA must expose an accessible label.');
assert.match(navbar, /<Github\s+className="navbar-github-icon"\s*\/>\s*<span\s+className="navbar-github-label">GitHub<\/span>/s, 'React header GitHub CTA must render the GitHub icon and visible grouped label.');
assert.doesNotMatch(navbar, />Repo<\/|['"]Repo['"]/, 'React header must not use the old Repo CTA copy.');

assert.match(staticCompiler, /<nav class="navbar" aria-label="Main navigation">/, 'Static header must expose main navigation semantics.');
assert.match(staticCompiler, /<span class="navbar-brand-text">MdWrk<\/span>/, 'Static header must render the MdWrk brand text.');
assert.match(staticCompiler, /renderStaticCloudOffIcon\(\)/, 'Static header must render the MdWrk brand icon.');
assert.match(staticCompiler, /data-static-theme-toggle aria-label="Toggle lander theme"/, 'Static header theme toggle must expose an accessible label.');

for (const [target, label] of staticNavLinks) {
  assert.match(
    staticCompiler,
    new RegExp(`\\['${target.replaceAll('/', '\\/')}',\\s*'${label}'\\]`),
    `Static header must include ${label} navigation targeting ${target}.`,
  );
}

assert.match(staticCompiler, /href="\$\{escapeAttribute\(githubRepoUrl\)\}"/, 'Static header GitHub CTA must use the configured repository URL.');
assert.match(staticCompiler, /class="navbar-github-link"/, 'Static header GitHub CTA must use the grouped CTA class.');
assert.match(staticCompiler, /aria-label="Open MdWrk GitHub repository"/, 'Static header GitHub CTA must expose an accessible label.');
assert.match(staticCompiler, /renderStaticGithubIcon\(\)\}\s*<span class="navbar-github-label">GitHub<\/span>/s, 'Static header GitHub CTA must render the GitHub icon and visible grouped label.');
assert.doesNotMatch(staticCompiler, />Repo<\/|['"]Repo['"]/, 'Static header must not use the old Repo CTA copy.');

assert.match(css, /\.navbar-github-link\s*\{[^}]*gap-2[^}]*px-3/s, 'GitHub CTA styles must group the icon and label with spacing.');
assert.match(css, /\.navbar-github-label\s*\{[^}]*whitespace-nowrap/s, 'GitHub CTA label must stay grouped with the icon.');

console.log('Header content validation passed.');
