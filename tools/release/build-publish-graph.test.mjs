import assert from 'node:assert/strict';
import test from 'node:test';
import { buildPackagePublishGraph, isPublishGraphTarget } from './build-publish-graph.mjs';

const workspace = (name, relativeDir, packageJson = {}) => ({
  packageJson: {
    name,
    version: '1.0.0',
    scripts: { build: 'tsc' },
    ...packageJson,
  },
  relativeDir,
  category: relativeDir.startsWith('examples/') ? 'example' : 'extension',
  publishable: packageJson.private !== true,
});

test('orders publish packages with workspace dependencies before dependents', () => {
  const graph = buildPackagePublishGraph([
    workspace('@mdwrk/app', 'packages/extensions/app', {
      dependencies: { '@mdwrk/core': '^1.0.0' },
    }),
    workspace('@mdwrk/core', 'packages/shared/core'),
    workspace('@mdwrk/example', 'examples/example-renderer-basic'),
  ]);

  assert.equal(graph.ok, true);
  assert.deepEqual(graph.order, ['@mdwrk/core', '@mdwrk/app']);
  assert.deepEqual(graph.edges, [{ from: '@mdwrk/core', to: '@mdwrk/app', kind: 'dependencies' }]);
});

test('detects cycles and missing internal package dependencies', () => {
  const graph = buildPackagePublishGraph([
    workspace('@mdwrk/a', 'packages/extensions/a', {
      dependencies: { '@mdwrk/b': '^1.0.0', '@mdwrk/missing': '^1.0.0' },
    }),
    workspace('@mdwrk/b', 'packages/extensions/b', {
      dependencies: { '@mdwrk/a': '^1.0.0' },
    }),
  ]);

  assert.equal(graph.ok, false);
  assert.deepEqual(graph.cycleNodes, ['@mdwrk/a', '@mdwrk/b']);
  assert.deepEqual(graph.missingInternalDependencies, [
    { packageName: '@mdwrk/a', dependencyName: '@mdwrk/missing', dependencyKind: 'dependencies' },
  ]);
});

test('default publish target predicate excludes examples and private packages', () => {
  assert.equal(isPublishGraphTarget(workspace('@mdwrk/extension', 'packages/extensions/extension')), true);
  assert.equal(isPublishGraphTarget(workspace('@mdwrk/example', 'examples/example-renderer-basic')), false);
  assert.equal(isPublishGraphTarget(workspace('@mdwrk/private', 'packages/extensions/private', { private: true })), false);
});
