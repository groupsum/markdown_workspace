import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const footer = read('components', 'Footer.tsx');
const css = read('styles', 'components.css');
const staticCompiler = read('src', 'cli.mjs');

const reactInternalLinks = [
  ['/docs', 'Documentation'],
  ['/blog', 'News'],
  ['/legal/privacy', 'Privacy'],
  ['/legal/terms', 'Terms'],
];

const reactExternalLinks = [
  ['links.demo', 'Live Demo'],
  ['links.npmRepo', 'npm'],
  ['links.github', 'GitHub'],
  ['links.x', 'X.com'],
  ['links.community', 'Community'],
];

const staticInternalLinks = [
  ['/docs/', 'Documentation'],
  ['/blog/', 'News'],
  ['/legal/privacy/', 'Privacy'],
  ['/legal/terms/', 'Terms'],
];

const staticExternalLinks = [
  ['demoUrl', 'Live Demo'],
  ['npmRepoUrl', 'npm'],
  ['githubRepoUrl', 'GitHub'],
  ['xProfileUrl', 'X.com'],
  ['communityUrl', 'Community'],
];

assert.match(footer, /<footer\s+className="footer">/, 'React footer must render the lander footer element.');
assert.match(footer, /<Link\s+to="\/"\s+className="footer-brand-link">/, 'React footer brand must link to the homepage.');
assert.match(footer, /<CloudOff\s+className="footer-brand-icon"\s*\/>/, 'React footer must render the MdWrk brand icon.');
assert.match(footer, /<span\s+className="footer-brand-text">MdWrk<\/span>/, 'React footer must render the MdWrk brand text.');
assert.match(footer, /The local-first Markdown workspace\. Your data, your device, your rules\./, 'React footer must render the product positioning copy.');
assert.match(footer, /const\s+currentYear\s*=\s*new Date\(\)\.getFullYear\(\)/, 'React footer must derive the copyright year at runtime.');
assert.match(footer, /&copy;\s*\{currentYear\}\s*MdWrk\. Designed for privacy\./, 'React footer must render the copyright and privacy note.');

for (const heading of ['Resources', 'Follow', 'Legal']) {
  assert.match(
    footer,
    new RegExp(`<h2\\s+className="footer-section-heading">${heading}<\\/h2>`),
    `React footer must render the ${heading} section heading.`,
  );
}

for (const [target, label] of reactInternalLinks) {
  assert.match(
    footer,
    new RegExp(`<li><Link\\s+to="${target.replaceAll('/', '\\/')}"\\s+className="footer-link">${label}<\\/Link><\\/li>`),
    `React footer must include ${label} linking to ${target}.`,
  );
}

for (const [target, label] of reactExternalLinks) {
  assert.match(
    footer,
    new RegExp(`<li><a\\s+href=\\{${target.replace('.', '\\.')}\\}\\s+target="_blank"\\s+rel="noopener noreferrer"\\s+className="footer-link">${label}<\\/a><\\/li>`),
    `React footer must include safe external ${label} link from ${target}.`,
  );
}

assert.match(staticCompiler, /const renderStaticFooter = \(\) => \{/, 'Static compiler must define a static footer renderer.');
assert.match(staticCompiler, /<footer class="footer">/, 'Static footer must render the lander footer element.');
assert.match(staticCompiler, /<a href="\/" class="footer-brand-link">/, 'Static footer brand must link to the homepage.');
assert.match(staticCompiler, /renderStaticCloudOffIcon\(\)/, 'Static footer must render the MdWrk brand icon.');
assert.match(staticCompiler, /<span class="footer-brand-text">MdWrk<\/span>/, 'Static footer must render the MdWrk brand text.');
assert.match(staticCompiler, /<p class="footer-copy">The local-first Markdown workspace\. Your data, your device, your rules\.<\/p>/, 'Static footer must render the product positioning copy.');
assert.match(staticCompiler, /const currentYear = new Date\(\)\.getFullYear\(\);/, 'Static footer must derive the copyright year at render time.');
assert.match(staticCompiler, /<div class="footer-legal">&copy; \$\{currentYear\} MdWrk\. Designed for privacy\.<\/div>/, 'Static footer must render the copyright and privacy note.');

for (const heading of ['Resources', 'Follow', 'Legal']) {
  assert.match(
    staticCompiler,
    new RegExp(`<h2 class="footer-section-heading">${heading}<\\/h2>`),
    `Static footer must render the ${heading} section heading.`,
  );
}

for (const [target, label] of staticInternalLinks) {
  assert.match(
    staticCompiler,
    new RegExp(`<li><a href="${target.replaceAll('/', '\\/')}" class="footer-link">${label}<\\/a><\\/li>`),
    `Static footer must include ${label} linking to ${target}.`,
  );
}

for (const [target, label] of staticExternalLinks) {
  assert.match(
    staticCompiler,
    new RegExp(`<li><a href="\\$\\{escapeAttribute\\(${target}\\)\\}" target="_blank" rel="noopener noreferrer" class="footer-link">${label}<\\/a><\\/li>`),
    `Static footer must include safe external ${label} link from ${target}.`,
  );
}

for (const className of ['footer-inner', 'footer-layout', 'footer-nav-grid', 'footer-section-heading', 'footer-link', 'footer-legal']) {
  assert.match(css, new RegExp(`\\.${className}\\s*\\{`), `Footer styles must define .${className}.`);
}

console.log('Footer content validation passed.');
