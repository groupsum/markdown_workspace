import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..', '..');

const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const editorExample = read('examples/editor-basic/App.tsx');
const rendererExample = read('examples/renderer-basic/App.tsx');
const matrix = read('docs/reference/workspace-package-certification-matrix.md');
const boundaryMap = read('docs/reference/package-boundary-map.md');
const mdwrkAppDoc = read('docs/apps/mdwrkspace-app.md');
const landerAppDoc = read('docs/apps/lander-app.md');

const checks = [
  {
    id: 'matrix-present',
    description: 'workspace package certification matrix exists',
    test() {
      assert.match(matrix, /Workspace package certification matrix/);
    },
  },
  {
    id: 'boundary-map-present',
    description: 'package boundary map exists',
    test() {
      assert.match(boundaryMap, /Package boundary map/);
    },
  },
  {
    id: 'apps-docs-present',
    description: 'app docs for mdwrkspace and lander exist',
    test() {
      assert.match(mdwrkAppDoc, /Public configuration surface/);
      assert.match(landerAppDoc, /Dependency boundary map/);
    },
  },
  {
    id: 'editor-example-phase11-features',
    description: 'editor example demonstrates theme support, line numbers, task insertion, and profile toggles',
    test() {
      assert.match(editorExample, /THEME_PRESETS/);
      assert.match(editorExample, /showLineNumbers/);
      assert.match(editorExample, /executeCommand\('task-list'\)/);
      assert.match(editorExample, /OPTIONAL_EXTENSION_OPTIONS/);
      assert.match(editorExample, /continue the list/);
    },
  },
  {
    id: 'renderer-example-phase11-features',
    description: 'renderer example demonstrates GFM and optional extension rendering',
    test() {
      assert.match(rendererExample, /task lists/);
      assert.match(rendererExample, /~~strikethrough~~/);
      assert.match(rendererExample, /https:\/\/example.com and docs@example.com/);
      assert.match(rendererExample, /OPTIONAL_EXTENSION_OPTIONS/);
    },
  },
];

const results = [];
let passed = 0;
for (const check of checks) {
  try {
    check.test();
    results.push({ id: check.id, description: check.description, passed: true });
    passed += 1;
  } catch (error) {
    results.push({ id: check.id, description: check.description, passed: false, message: error.message });
  }
}

const summary = {
  total: results.length,
  passed,
  failed: results.length - passed,
  results,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `phase11 package evidence failures: ${summary.failed}`);
  console.log('phase11 package evidence checks passed');
}
