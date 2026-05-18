import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const app = read('App.tsx');
const hero = read('components', 'Hero.tsx');
const features = read('components', 'Features.tsx');
const demo = read('components', 'DemoSection.tsx');
const css = read('styles', 'components.css');
const staticCompiler = read('src', 'cli.mjs');
const demoContentContract = demo.replaceAll('\\`', '`');
const staticContentContract = staticCompiler.replaceAll('\\`', '`');

const featureTitles = [
  'Offline First',
  'Split Packages',
  'Extension Ready',
  'Zero Knowledge',
  'Local Database',
  'GitHub Sync',
  'Shared Themes',
  'Blazing Fast',
];

const demoMarkdownSignals = [
  '# mdwrk client surface',
  '## Shared packages',
  '| Editor | `@mdwrk/markdown-editor-react` | Live |',
  '| Preview | `@mdwrk/markdown-renderer-react` | Shared |',
  '## Workspace signals',
  '- [x] Local-first persistence',
  '- [x] Split editor and preview packages',
  '## Authoring workflow',
  '- Draft Markdown in the editor pane.',
  '- Preview headings, tables, lists, and code in the rendered pane.',
  '## Renderer workflow',
  '- Parse Markdown through the shared renderer contract.',
  '## Extension workflow',
  '- Treat the rendered preview as the product surface, not a screenshot.',
  'import { MarkdownSourceEditor } from "@mdwrk/markdown-editor-react";',
  'import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";',
];

assert.match(app, /import \{ mdwrkSite \} from '\.\/src\/mdwrk-site';/, 'SPA home route must import the MdWrk content pack.');
assert.match(app, /const compiledMdwrkSite = compileLanderSite\(mdwrkSite\);/, 'SPA home route must compile the MdWrk content pack through lander-core.');
assert.match(app, /<Route\s+path="\/"\s+element=\{<GenericLanderView\s*\/>\}\s*\/>/, 'SPA home route must render the generic lander view at /.');
assert.match(app, /<LanderPage\s+site=\{compiledMdwrkSite\}\s+page=\{page\}\s*\/>/, 'SPA generic lander route must render through @mdwrk/lander-react.');
assert.match(app, /buildPortablePageMetadata\(compiledMdwrkSite, page\)/, 'SPA generic lander route must derive metadata through @mdwrk/lander-seo.');

assert.match(hero, /<section\s+className="hero-section">/, 'SPA home hero section must render.');
assert.match(hero, /<span\s+className="hero-eyebrow-badge">Client<\/span>/, 'SPA home hero must identify the client surface.');
assert.match(hero, /mdwrk workspace, packages, and extensions documented here/, 'SPA home hero must link docs from the eyebrow copy.');
assert.match(hero, /The\s*<span className="hero-heading-accent">Local-First<\/span>\s*Markdown Workspace/s, 'SPA home hero heading must keep the Local-First Markdown Workspace message.');
assert.match(hero, /MdWrk is the workspace client, renderer\/editor package family, and extension host/, 'SPA home hero copy must describe the client and package family.');
assert.match(hero, /<Link\s+to="\/docs\/getting-started\/local-setup"\s+className="hero-primary-link">/, 'SPA home hero primary CTA must target local setup.');
assert.match(hero, /Deploy Locally/, 'SPA home hero primary CTA must say Deploy Locally.');
assert.match(hero, /className="hero-secondary-link"[^>]*>\s*Install PWA/s, 'SPA home hero secondary CTA must say Install PWA.');
assert.match(hero, /<span\s+className="hero-meta-label">ESM CDN<\/span>/, 'SPA home hero must expose the ESM CDN metadata link.');

assert.match(features, /<section\s+id="features"\s+className="features-section">/, 'SPA home features section must render.');
assert.match(features, /Designed for\s*<span className="features-heading-privacy">Privacy<\/span>, Built for\s*<span className="features-heading-accent">Reusable Surfaces<\/span>/s, 'SPA home features heading must keep the privacy and reusable surfaces message.');
assert.match(features, /The workspace client is the product surface\./, 'SPA home features copy must describe the client product surface.');
for (const title of featureTitles) {
  assert.match(features, new RegExp(`title:\\s*'${title}'`), `SPA home features must include ${title}.`);
}
assert.match(features, /The editor and previewer are separate mdwrk packages/, 'SPA home features must mention the split editor and previewer packages.');

assert.match(demo, /import \{ MarkdownSourceEditor, createMarkdownEditorThemeStyle \} from '@mdwrk\/markdown-editor-react';/, 'SPA home demo must use the reusable editor package.');
assert.match(demo, /import \{ MarkdownViewer \} from '\.\/MarkdownViewer';/, 'SPA home demo must use the shared Markdown viewer.');
assert.match(demo, /const\s+showcaseMarkdown\s*=\s*`# mdwrk client surface/, 'SPA home demo must define inline showcase Markdown content.');
for (const signal of demoMarkdownSignals) {
  assert.match(demoContentContract, new RegExp(signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `SPA home demo Markdown must include: ${signal}`);
}
assert.match(demo, /const\s+\[content,\s*setContent\]\s*=\s*useState<string>\(showcaseMarkdown\)/, 'SPA home demo must keep editable state seeded from showcase Markdown.');
assert.match(demo, /const\s+\[activeTab,\s*setActiveTab\]\s*=\s*useState<'editor'\s*\|\s*'preview'>\('preview'\)/, 'SPA home demo must default to the preview tab.');
assert.match(demo, /<section\s+id="demo"\s+className="demo-section">/, 'SPA home demo section must render.');
assert.match(demo, /One Editor Package\. One Preview Package\.\s*<span className="demo-heading-accent">Shared Everywhere\.<\/span>/s, 'SPA home demo heading must keep the editor and preview package message.');
assert.match(demo, /The lander demo now runs through the same public mdwrk editor and renderer packages that the client ships\./, 'SPA home demo copy must describe package-backed rendering.');
assert.match(demo, /<Code\s+className="demo-tab-icon"\s*\/>\s*Editor/s, 'SPA home demo must render an Editor tab.');
assert.match(demo, /<Eye\s+className="demo-tab-icon"\s*\/>\s*Preview/s, 'SPA home demo must render a Preview tab.');
assert.match(demo, /demo_showcase\.md/, 'SPA home demo must expose the inline demo filename.');
assert.match(demo, /<MarkdownSourceEditor\s+className="lander-editor"\s+value=\{content\}\s+onChange=\{setContent\}/s, 'SPA home demo editor pane must be a live MarkdownSourceEditor bound to content state.');
assert.match(demo, /showLineNumbers=\{true\}/, 'SPA home demo editor must show line numbers.');
assert.match(demo, /themeStyle=\{createMarkdownEditorThemeStyle\(\{[\s\S]*background: 'var\(--lander-panel\)'[\s\S]*accent: 'var\(--lander-accent\)'/s, 'SPA home demo editor must use lander theme tokens.');
assert.match(demo, /<MarkdownViewer\s+content=\{content\}\s*\/>/, 'SPA home demo preview pane must render the same editable content.');
assert.match(demo, /Render Engine: @mdwrk\/markdown-renderer-react/, 'SPA home demo statusbar must identify the React renderer package.');
assert.match(demo, /content\.split\(\/\\s\+\/\)\.filter\(x => x\.length > 0\)\.length/, 'SPA home demo statusbar must calculate word count from current content.');
assert.match(demo, /content\.length/, 'SPA home demo statusbar must calculate character count from current content.');

assert.match(staticCompiler, /const homeDemoMarkdown = `# mdwrk client surface/, 'Static home must define inline showcase Markdown content.');
for (const signal of demoMarkdownSignals) {
  assert.match(staticContentContract, new RegExp(signal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Static home demo Markdown must include: ${signal}`);
}
assert.match(staticCompiler, /const renderStaticHome = \(entry, registry, assetTags = ''\) => \{/, 'Static compiler must define a home renderer.');
assert.match(staticCompiler, /missing source stylesheet: apps\/mdwrkcom\/styles\/static\.css/, 'Static compiler must fail closed when the source static stylesheet is missing.');
assert.match(staticCompiler, /collectFiles\(assetsDir, file => file\.endsWith\('\.css'\)\)/, 'Static compiler must recover preserved Vite stylesheet links from the assets directory.');
assert.match(staticCompiler, /const demoPreview = renderMarkdown\(homeDemoMarkdown\)\.html;/, 'Static home preview must be rendered from the same inline Markdown source.');
assert.match(staticCompiler, /const demoWordCount = stripMarkdown\(homeDemoMarkdown\)\.split\(\/\\s\+\/\)\.filter\(Boolean\)\.length;/, 'Static home must calculate demo word count from inline Markdown.');
assert.match(staticCompiler, /<section class="hero-section">/, 'Static home hero section must render.');
assert.match(staticCompiler, /<h1 class="hero-heading">The <span class="hero-heading-accent">Local-First<\/span> Markdown Workspace<\/h1>/, 'Static home hero heading must keep the Local-First Markdown Workspace message.');
assert.match(staticCompiler, /<a href="\/docs\/getting-started\/local-setup\/" class="hero-primary-link">Deploy Locally/, 'Static home hero primary CTA must target local setup.');
assert.match(staticCompiler, /<a href="\$\{escapeAttribute\(appUrl\)\}" class="hero-secondary-link" target="_blank" rel="noopener noreferrer">Install PWA<\/a>/, 'Static home hero secondary CTA must safely target the app URL.');
assert.match(staticCompiler, /<section id="features" class="features-section">/, 'Static home features section must render.');
for (const title of featureTitles) {
  assert.match(staticCompiler, new RegExp(`\\['${title}'`), `Static home features must include ${title}.`);
}
assert.match(staticCompiler, /<section id="demo" class="demo-section">/, 'Static home demo section must render.');
assert.match(staticCompiler, /<h2 class="demo-heading">One Editor Package\. One Preview Package\. <span class="demo-heading-accent">Shared Everywhere\.<\/span><\/h2>/, 'Static home demo heading must keep the editor and preview package message.');
assert.match(staticCompiler, /<button type="button" class="demo-tab-button is-active">[\s\S]* Editor<\/button>/, 'Static home demo must render an Editor tab.');
assert.match(staticCompiler, /<button type="button" class="demo-tab-button is-active">[\s\S]* Preview<\/button>/, 'Static home demo must render a Preview tab.');
assert.match(staticCompiler, /<textarea class="lander-editor static-demo-editor" data-static-demo-editor aria-label="Static Markdown editor demo" spellcheck="false">\$\{escapeHtml\(homeDemoMarkdown\)\}<\/textarea>/, 'Static home demo must preserve an inline editor textarea seeded from the Markdown source.');
assert.match(staticCompiler, /<div class="demo-preview-pane is-preview-visible" data-static-demo-preview>\s*\$\{renderMarkdownHost\(demoPreview\)\}/s, 'Static home demo must render an inline preview pane from the Markdown source.');
assert.match(staticCompiler, /Render Engine: @mdwrk\/markdown-renderer-core/, 'Static home demo statusbar must identify the static renderer package.');
assert.match(staticCompiler, /data-static-demo-words>\$\{demoWordCount\} words<\/span><span data-static-demo-chars>\$\{homeDemoMarkdown\.length\} chars<\/span>/, 'Static home demo statusbar must expose source-derived word and character counts.');
assert.match(staticCompiler, /renderStaticDemoScript\(\)/, 'Static home must include the inline demo synchronization script.');
assert.ok(staticCompiler.includes(`return '<div class="markdown-renderer-host lander-markdown"><div class="markdown-body" data-markdown-profile="gfm-default" data-markdown-html-handling="escape">' + html.join('\\\\n') + '</div></div>';`), 'Static home live preview updates must preserve the renderer markdown-body theme scope.');
assert.match(staticCompiler, /<section id="privacy" class="privacy-section">/, 'Static home privacy section must render.');
assert.match(staticCompiler, /Your Data Stays on <span class="privacy-heading-accent">Your Device<\/span>/, 'Static home privacy heading must keep the device-local promise.');
assert.match(staticCompiler, /Privacy Standard: Verified Local/, 'Static home privacy badge must be visible.');

for (const className of ['hero-section', 'features-section', 'demo-section', 'demo-editor-pane', 'demo-preview-pane', 'privacy-section']) {
  assert.match(css, new RegExp(`\\.${className}\\s*\\{`), `Home page styles must define .${className}.`);
}

console.log('Home content validation passed.');
