import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(appRoot, 'package.json'), 'utf8'));
const source = fs.readFileSync(path.join(appRoot, 'src', 'mdwrk-site.ts'), 'utf8');
const cliSource = fs.readFileSync(path.join(appRoot, 'src', 'cli.mjs'), 'utf8');

assert.equal(packageJson.dependencies['@mdwrk/mdwrkcom-content-pack'], '^0.1.8');
assert.match(source, /import \{ compileLanderSite, defineLanderSite \} from '@mdwrk\/lander-core';/);
assert.match(source, /export const compiledMdwrkSite = compileLanderSite\(mdwrkSite\);/);
assert.match(source, /export const mdwrkcomLanderRendererHost = Object\.freeze/);
assert.match(source, /contentPack: '@mdwrk\/mdwrkcom-content-pack'/);
assert.match(source, /rendererPackage: '@mdwrk\/lander-react'/);
assert.doesNotMatch(source, /from '@mdwrk\/lander-react'/);
assert.match(cliSource, /import\('@mdwrk\/mdwrkcom-content-pack'\)/);
assert.match(cliSource, /packages\/content\/mdwrkcom-content-pack\/dist\/index\.js/);
assert.match(cliSource, /resolveMdwrkcomContentPackUrl/);
assert.doesNotMatch(cliSource, /const contentRoot = path\.join\(landerRoot, 'content'\);/);
