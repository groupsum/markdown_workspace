#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landerRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(landerRoot, '..', '..');
const distStaticRoot = path.join(landerRoot, 'dist-static');
const packageGeneratedRoot = path.join(workspaceRoot, 'packages', 'content', 'mdwrkcom-content-pack', 'generated');

const artifacts = [
  'content-index.json',
  'semantic-index.json',
  'content-registry.json',
  'jsonld-graph.json',
  'llms-full.txt',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  'sitemap.xsl',
  'cache-header-manifest.json',
];

fs.mkdirSync(packageGeneratedRoot, { recursive: true });

for (const artifact of artifacts) {
  const source = path.join(distStaticRoot, artifact);
  const target = path.join(packageGeneratedRoot, artifact);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing generated artifact: ${source}`);
  }
  fs.writeFileSync(target, fs.readFileSync(source));
}

const sourceSitemapsRoot = path.join(distStaticRoot, 'sitemaps');
if (fs.existsSync(sourceSitemapsRoot)) {
  const targetSitemapsRoot = path.join(packageGeneratedRoot, 'sitemaps');
  fs.rmSync(targetSitemapsRoot, { recursive: true, force: true });
  fs.mkdirSync(targetSitemapsRoot, { recursive: true });
  for (const entry of fs.readdirSync(sourceSitemapsRoot, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.xml')) {
      fs.writeFileSync(path.join(targetSitemapsRoot, entry.name), fs.readFileSync(path.join(sourceSitemapsRoot, entry.name)));
    }
  }
}

console.log(`Synced ${artifacts.length} generated artifacts and child sitemaps into packages/content/mdwrkcom-content-pack/generated.`);
