import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (...parts) => readFileSync(path.join(landerRoot, ...parts), 'utf8');

const dataDocs = read('data', 'docs.ts');
const docsView = read('components', 'DocsView.tsx');
const compareView = read('components', 'CompareView.tsx');
const navbar = read('components', 'Navbar.tsx');
const staticCompiler = read('src', 'cli.mjs');
const sitemapGenerator = read('scripts', 'generate-sitemap.mjs');

assert.match(dataDocs, /export const compareDocs = docEntries\s*\n\s*\.filter\(\(entry\) => entry\.section === 'Compares' \|\| entry\.slug\.startsWith\('compare\/'\)\)/, 'Comparison markdown must be exported through compareDocs.');
assert.match(dataDocs, /export const docs = docEntries\s*\n\s*\.filter\(\(entry\) => entry\.section !== 'Compares' && !entry\.slug\.startsWith\('compare\/'\)[^)]*entry\.section !== 'Features'[^)]*!entry\.slug\.startsWith\('features\/'\)\)/, 'Docs export must exclude comparison markdown.');
assert.match(dataDocs, /const toCompareSlug = \(slug: string\) =>\s*`compare\/\$\{slug/s, 'Comparison docs must be normalized to compare/* SPA slugs.');

assert.match(compareView, /import \{ compareDocs, compareDocsBySlug \} from '\.\.\/data\/docs';/, 'CompareView must use compareDocs as its source.');
assert.match(compareView, /heading="Compares"/, 'CompareView must label the sidebar as Compares.');
assert.match(compareView, /icon=\{<Scale className="docs-sidebar-icon" \/>\}/, 'CompareView must render the Compares sidebar icon through the section menu.');
assert.doesNotMatch(compareView, /navigate\(`\/\$\{compareDocs\[0\]\.slug\}`,\s*\{ replace: true \}\)/, 'CompareView must render /compare as an index page instead of redirecting to the first comparison route.');
assert.match(compareView, /{ name: 'Compares', path: '\/compare\/' }/, 'CompareView breadcrumbs must place pages under Compares.');
assert.match(compareView, /<MarkdownViewer content=\{articleContent\} \/>/, 'CompareView must render comparison article content.');

assert.doesNotMatch(docsView, /compareDocs|compareDocsBySlug/, 'DocsView must not import comparison content.');
assert.match(navbar, /\{\s*id:\s*'\/compare',\s*label:\s*'Compare'\s*\}/, 'React header Compare nav must point to the compare index.');
assert.doesNotMatch(navbar, /\/docs\/comparisons/, 'React header must not point Compare to docs/comparisons.');

assert.match(staticCompiler, /const toCompareRouteSlug = \(slug\) => `\/compare\/\$\{String\(slug\)/, 'Static compiler must normalize comparison markdown to /compare routes.');
assert.match(staticCompiler, /const isComparison = section === 'Compares' \|\| slug\.startsWith\('comparisons\/'\);/, 'Static compiler must detect comparison markdown by section or source slug.');
assert.match(staticCompiler, /const routeSlug = isComparison \? toCompareRouteSlug\(slug\) : isFeature \? toFeatureRouteSlug\(slug\) : `\/docs\/\$\{slug\}\/`;/, 'Static compiler must route comparisons outside /docs.');
assert.match(staticCompiler, /const contentType = isComparison \? 'comparison' : isFeature \? 'feature' : 'docs';/, 'Static compiler must classify comparison markdown as comparison content.');
assert.match(staticCompiler, /const tags = isComparison \? \['compare', section\] : isFeature \? \['features', section\] : \['docs', section\];/, 'Static compiler must tag comparison markdown under compare.');
assert.match(staticCompiler, /\.filter\(item => item\.frontmatter\.contentType === 'docs' && item\.frontmatter\.slug\.startsWith\('\/docs\/'\)/, 'Static docs sidebar must include only docs content.');

assert.match(sitemapGenerator, /const toCompareRoutePath = \(slug\) => `\/compare\/\$\{String\(slug\)/, 'Sitemap generator must normalize comparison markdown to /compare routes.');
assert.match(sitemapGenerator, /const isComparison = metadata\.section === 'Compares' \|\| String\(sourceSlug\)\.startsWith\('comparisons\/'\);/, 'Sitemap generator must detect comparison markdown.');
assert.match(sitemapGenerator, /const routePath = isComparison \? toCompareRoutePath\(sourceSlug\) : isFeature \? toFeatureRoutePath\(sourceSlug\) : `\/docs\/\$\{sourceSlug\}`;/, 'Sitemap generator must keep comparison URLs out of /docs.');
assert.match(sitemapGenerator, /type: isComparison \? 'comparison' : isFeature \? 'feature' : 'doc'/, 'Sitemap semantic index must type comparison entries as comparison.');

for (const legacyPath of [
  ['content', 'pages', 'compare', 'obsidian.md'],
  ['content', 'pages', 'compare', 'vscode-markdown.md'],
]) {
  assert.equal(existsSync(path.join(landerRoot, ...legacyPath)), false, `${legacyPath.join('/')} must not duplicate canonical comparison markdown.`);
}

console.log('Compare content validation passed.');
