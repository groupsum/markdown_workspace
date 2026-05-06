import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const dataDocs = read('data', 'docs.ts');
const docsView = read('components', 'DocsView.tsx');
const featureView = read('components', 'FeatureView.tsx');
const navbar = read('components', 'Navbar.tsx');
const staticCompiler = read('src', 'cli.mjs');
const sitemapGenerator = read('scripts', 'generate-sitemap.mjs');

assert.match(dataDocs, /export const featureDocs = docEntries\s*\n\s*\.filter\(\(entry\) => entry\.section === 'Features' \|\| entry\.slug\.startsWith\('features\/'\)\)/, 'Feature markdown must be exported through featureDocs.');
assert.match(dataDocs, /export const docs = docEntries\s*\n\s*\.filter\(\(entry\) => entry\.section !== 'Compares' && !entry\.slug\.startsWith\('compare\/'\) && entry\.section !== 'Features' && !entry\.slug\.startsWith\('features\/'\)\)/, 'Docs export must exclude feature markdown.');
assert.match(dataDocs, /const toFeatureSlug = \(slug: string\) =>\s*`features\/\$\{slug/s, 'Feature docs must be normalized to features/* SPA slugs.');

assert.match(featureView, /import \{ featureDocs, featureDocsBySlug \} from '\.\.\/data\/docs';/, 'FeatureView must use featureDocs as its source.');
assert.match(featureView, /heading="Features"/, 'FeatureView must label the sidebar as Features.');
assert.match(featureView, /icon=\{<Sparkles className="docs-sidebar-icon" \/>\}/, 'FeatureView must render the Features sidebar icon through the section menu.');
assert.doesNotMatch(featureView, /navigate\(`\/\$\{featureDocs\[0\]\.slug\}`,\s*\{ replace: true \}\)/, 'FeatureView must render /features as an index page instead of redirecting to the first feature route.');
assert.match(featureView, /{ name: 'Features', path: '\/features\/' }/, 'FeatureView breadcrumbs must place pages under Features.');
assert.match(featureView, /<MarkdownViewer content=\{articleContent\} \/>/, 'FeatureView must render feature article content.');

assert.doesNotMatch(docsView, /featureDocs|featureDocsBySlug/, 'DocsView must not import feature content.');
assert.match(navbar, /\{\s*id:\s*'\/features',\s*label:\s*'Features'\s*\}/, 'React header Features nav must point to the features index.');
assert.doesNotMatch(navbar, /\/docs\/product|\/docs\/usage\/(?:editor-basics|rendering-and-preview|advanced-formatting)/, 'React header must not point feature navigation to docs routes.');

assert.match(staticCompiler, /const toFeatureRouteSlug = \(slug\) => `\/features\/\$\{String\(slug\)/, 'Static compiler must normalize feature markdown to /features routes.');
assert.match(staticCompiler, /const isFeature = section === 'Features';/, 'Static compiler must detect feature markdown by section.');
assert.match(staticCompiler, /const routeSlug = isComparison \? toCompareRouteSlug\(slug\) : isFeature \? toFeatureRouteSlug\(slug\) : `\/docs\/\$\{slug\}\/`;/, 'Static compiler must route features outside /docs.');
assert.match(staticCompiler, /const contentType = isComparison \? 'comparison' : isFeature \? 'feature' : 'docs';/, 'Static compiler must classify feature markdown as feature content.');
assert.match(staticCompiler, /const tags = isComparison \? \['compare', section\] : isFeature \? \['features', section\] : \['docs', section\];/, 'Static compiler must tag feature markdown under features.');
assert.match(staticCompiler, /\.filter\(item => item\.frontmatter\.contentType === 'docs' && item\.frontmatter\.slug\.startsWith\('\/docs\/'\)/, 'Static docs sidebar must include only docs content.');

assert.match(sitemapGenerator, /const toFeatureRoutePath = \(slug\) => `\/features\/\$\{String\(slug\)/, 'Sitemap generator must normalize feature markdown to /features routes.');
assert.match(sitemapGenerator, /const isFeature = metadata\.section === 'Features';/, 'Sitemap generator must detect feature markdown.');
assert.match(sitemapGenerator, /const routePath = isComparison \? toCompareRoutePath\(sourceSlug\) : isFeature \? toFeatureRoutePath\(sourceSlug\) : `\/docs\/\$\{sourceSlug\}`;/, 'Sitemap generator must keep feature URLs out of /docs.');
assert.match(sitemapGenerator, /type: isComparison \? 'comparison' : isFeature \? 'feature' : 'doc'/, 'Sitemap semantic index must type feature entries as feature.');

for (const legacyPath of [
  ['content', 'pages', 'features', 'offline-markdown-editor.md'],
  ['content', 'pages', 'features', 'local-first-markdown.md'],
  ['content', 'pages', 'features', 'extension-platform.md'],
]) {
  assert.equal(existsSync(path.join(landerRoot, ...legacyPath)), false, `${legacyPath.join('/')} must not duplicate canonical feature markdown.`);
}

const searchableSources = [
  read('components', 'Navbar.tsx'),
  read('content', 'pages', 'index.md'),
  read('src', 'cli.mjs'),
  read('scripts', 'generate-sitemap.mjs'),
];
for (const source of searchableSources) {
  assert.doesNotMatch(source, /\/docs\/product|\/docs\/usage\/(?:editor-basics|rendering-and-preview|advanced-formatting)/, 'Feature links must not use docs/product or feature-like docs/usage routes.');
}

console.log('Feature content validation passed.');
