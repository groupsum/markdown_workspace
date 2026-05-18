import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = fs.readFileSync(path.join(appRoot, 'src', 'cli.mjs'), 'utf8');

assert.match(cli, /from '\.\.\/\.\.\/\.\.\/packages\/lander\/lander-core\/dist\/performance\/budget\.js'/);
assert.match(cli, /validateLanderPerformanceBudget\(\{ manifest: criticalPathManifest, cacheManifest \}\)/);
assert.match(cli, /buildCriticalPathManifest\(registry\.entries\.map/);
assert.match(cli, /staticRouteScriptFacts/);
assert.match(cli, /staticRouteMotionFacts/);
assert.doesNotMatch(cli, /const defaultLanderPerformanceBudget\s*=/);
assert.doesNotMatch(cli, /DISALLOWED_FIRST_VIEWPORT_ANIMATION_PROPERTIES/);
