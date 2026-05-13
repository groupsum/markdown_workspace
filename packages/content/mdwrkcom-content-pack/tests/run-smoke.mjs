import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  MDWRKCOM_CONTENT_PACK_NAME,
  mdwrkcomContentPack,
  mdwrkcomLanderRenderingIntent,
  resolveMdwrkcomContentPackPath,
} from '../dist/index.js';

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(packageRoot, '..', '..', '..');
const mdwrkcomRoot = path.join(repoRoot, 'apps', 'mdwrkcom');

const hashFile = (filePath) => crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');

const collectFiles = (root, ignored = new Set()) => {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) return collectFiles(entryPath, ignored);
    if (entry.name === 'AGENTS.md') return [];
    if (ignored.has(path.relative(root, entryPath).replace(/\\/g, '/')) || ignored.has(entry.name)) return [];
    return [entryPath];
  });
};

const compareTrees = (sourceRoot, packRoot, ignored = new Set()) => {
  const sourceFiles = collectFiles(sourceRoot, ignored)
    .map((file) => path.relative(sourceRoot, file).replace(/\\/g, '/'))
    .sort();
  const packFiles = collectFiles(packRoot, ignored)
    .map((file) => path.relative(packRoot, file).replace(/\\/g, '/'))
    .sort();

  assert.deepEqual(packFiles, sourceFiles, `${path.relative(repoRoot, packRoot)} must mirror ${path.relative(repoRoot, sourceRoot)}`);

  for (const relativePath of sourceFiles) {
    assert.equal(
      hashFile(path.join(packRoot, relativePath)),
      hashFile(path.join(sourceRoot, relativePath)),
      `${relativePath} must match source content`,
    );
  }
};

assert.equal(MDWRKCOM_CONTENT_PACK_NAME, '@mdwrk/mdwrkcom-content-pack');
assert.equal(mdwrkcomContentPack.sitemapPath, 'data/content-sitemap.yaml');
assert.equal(mdwrkcomLanderRenderingIntent.compilerPackage, '@mdwrk/lander-core');
assert.equal(mdwrkcomLanderRenderingIntent.rendererPackage, '@mdwrk/lander-react');
assert.ok(mdwrkcomLanderRenderingIntent.componentIntents.some((intent) => intent.kind === 'page_shell'));
assert.ok(mdwrkcomLanderRenderingIntent.componentIntents.some((intent) => intent.kind === 'structured_data_graph'));
assert.deepEqual(
  mdwrkcomLanderRenderingIntent.schemaIntents.map((intent) => intent.kind).sort(),
  ['FAQPage', 'ItemList', 'SoftwareApplication', 'SoftwareSourceCode', 'TechArticle', 'WebSite'],
);
assert.ok(resolveMdwrkcomContentPackPath('data/content-sitemap.yaml').endsWith('/data/content-sitemap.yaml'));

compareTrees(path.join(mdwrkcomRoot, 'content'), path.join(packageRoot, 'content'));
compareTrees(path.join(mdwrkcomRoot, 'data'), path.join(packageRoot, 'data'));
compareTrees(path.join(mdwrkcomRoot, 'public'), path.join(packageRoot, 'public'), new Set(mdwrkcomContentPack.generatedArtifacts));

for (const artifact of mdwrkcomContentPack.generatedArtifacts) {
  const source = path.join(mdwrkcomRoot, 'dist-static', artifact);
  const packaged = path.join(packageRoot, 'generated', artifact);
  if (fs.existsSync(source)) {
    assert.equal(hashFile(packaged), hashFile(source), `${artifact} must match mdwrkcom dist-static`);
  }
}
