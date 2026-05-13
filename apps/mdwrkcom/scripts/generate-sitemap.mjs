#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(appRoot, 'public');
const syncOut = path.join(appRoot, '.tmp', 'public-discovery-sync');

const artifacts = [
  'sitemap.xml',
  'robots.txt',
  'llms.txt',
  'llms-full.txt',
  'content-index.json',
  'content-registry.json',
  'jsonld-graph.json',
  'cache-header-manifest.json',
];

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

fs.rmSync(syncOut, { recursive: true, force: true });

const build = spawnSync(process.execPath, ['./src/cli.mjs', 'build', '--out', '.tmp/public-discovery-sync'], {
  cwd: appRoot,
  stdio: 'inherit',
});

if (build.status !== 0) {
  fail('Failed to build static lander artifacts for public sitemap sync.');
}

fs.mkdirSync(publicRoot, { recursive: true });

for (const artifact of artifacts) {
  const source = path.join(syncOut, artifact);
  const target = path.join(publicRoot, artifact);
  if (!fs.existsSync(source)) {
    fail(`Missing generated discovery artifact: ${path.relative(appRoot, source)}`);
  }
  fs.copyFileSync(source, target);
}

const copiedSitemap = fs.readFileSync(path.join(publicRoot, 'sitemap.xml'), 'utf8');
const urlCount = (copiedSitemap.match(/<url>/g) ?? []).length;

console.log(`Synced ${artifacts.length} discovery artifacts from static compiler into public/ (${urlCount} sitemap URLs).`);
