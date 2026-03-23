import assert from 'node:assert/strict';
import manifest from '../dist/manifest.js';
import extension from '../dist/index.js';

assert.equal(manifest.kind, 'external');
assert.equal(manifest.distribution?.channel, 'catalog');
assert.equal(extension.manifest.id, manifest.id);
assert.equal(typeof extension.activate, 'function');

console.log('extension-catalog-hello smoke tests passed');
