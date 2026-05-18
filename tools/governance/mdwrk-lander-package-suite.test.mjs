import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LANDER_PACKAGE_SUITE_WORKSPACES,
  MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID,
  MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID,
  validateMdwrkLanderPackageSuite,
} from './mdwrk-lander-package-suite.mjs';

test('validates the MdWrk lander package suite boundary runtime contract', async () => {
  const result = await validateMdwrkLanderPackageSuite();

  assert.deepEqual(result.failures, []);
  assert.equal(result.passed, true);
  assert.equal(result.details.boundaryId, MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID);
  assert.equal(result.details.featureId, MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID);
  assert.ok(result.details.workspaces.length >= 10);
});

test('requires every lander package suite workspace to be named and publishable', async () => {
  const result = await validateMdwrkLanderPackageSuite();
  const workspaceNames = result.details.workspaces.map((workspace) => workspace.name);

  assert.equal(result.passed, true);
  assert.ok(workspaceNames.includes('@mdwrk/lander-core'));
  assert.ok(workspaceNames.includes('@mdwrk/lander-react'));
  assert.ok(workspaceNames.includes('@mdwrk/page-template-demo-content-pack'));
  assert.deepEqual(
    LANDER_PACKAGE_SUITE_WORKSPACES.map((workspace) => workspace.name),
    workspaceNames,
  );
});
