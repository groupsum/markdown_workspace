import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(appRoot, 'src', 'mdwrk-site.ts'), 'utf8');

assert.match(source, /import \{ compileLanderSite, defineLanderSite \} from '@mdwrk\/lander-core';/);
assert.match(source, /export const compiledMdwrkSite = compileLanderSite\(mdwrkSite\);/);
assert.match(source, /export const mdwrkcomLanderRendererHost = Object\.freeze/);
assert.match(source, /contentPack: '@mdwrk\/mdwrkcom-content-pack'/);
assert.match(source, /rendererPackage: '@mdwrk\/lander-react'/);
assert.doesNotMatch(source, /from '@mdwrk\/lander-react'/);
