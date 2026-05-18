import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MDWRK_PACKAGE_CR_FEATURE_IDS,
  orderChangeRequestsByOwner,
  packageOwnerForPath,
  semverPatchOrMinorOnly,
  validateMdwrkPackageCrOrder,
} from './mdwrk-package-cr-order.mjs';

test('orders change requests by package owner dependency order', () => {
  const ordered = orderChangeRequestsByOwner([
    { id: 'CR-app', path: 'apps/client/src/App.tsx' },
    { id: 'CR-contract', path: 'packages/contracts/theme-contract/src/tokens.ts' },
    { id: 'CR-editor', path: 'packages/editor/markdown-editor-core/src/index.ts' },
    { id: 'CR-docs', path: 'docs/reference/package-boundary-map.md' },
  ]);

  assert.deepEqual(ordered.map((entry) => entry.id), ['CR-contract', 'CR-editor', 'CR-app', 'CR-docs']);
  assert.deepEqual(ordered.map((entry) => entry.owner), ['contracts', 'editor', 'client', 'docs']);
});

test('maps repository paths to package owners', () => {
  assert.equal(packageOwnerForPath('packages/extensions/extension-runtime/src/index.ts').id, 'extensions');
  assert.equal(packageOwnerForPath('packages/lander/lander-core/src/index.ts').id, 'lander');
  assert.equal(packageOwnerForPath('apps/mdwrkcom/src/cli.mjs').id, 'mdwrkcom');
  assert.equal(packageOwnerForPath('unknown/file.txt').id, 'unowned');
});

test('accepts patch or minor version bumps only', () => {
  assert.equal(semverPatchOrMinorOnly('1.2.3', '1.2.4'), true);
  assert.equal(semverPatchOrMinorOnly('1.2.3', '1.3.0'), true);
  assert.equal(semverPatchOrMinorOnly('1.2.3', '2.0.0'), false);
  assert.equal(semverPatchOrMinorOnly('1.2.3', '1.3.1'), false);
  assert.equal(semverPatchOrMinorOnly('1.2.3', '1.2.3'), false);
});

test('validates the live first boundary runtime contract', async () => {
  const result = await validateMdwrkPackageCrOrder();

  assert.equal(result.passed, true, result.failures.join('\n'));
  assert.deepEqual(MDWRK_PACKAGE_CR_FEATURE_IDS, [
    'feat:mdwrk-package-change-request-execution',
    'feat:mdwrk-package-owned-version-bump-governance',
    'feat:mdwrk-scoped-agent-ownership-instructions',
    'feat:mdwrk-package-screenshot-evidence-matrix',
  ]);
  assert.ok(result.details.workspacePackageCount > 0);
  assert.ok(result.details.requiredAgentPaths.includes('AGENTS.md'));
  assert.ok(result.details.requiredScreenshotTokens.includes('extension-manager-modal'));
});
