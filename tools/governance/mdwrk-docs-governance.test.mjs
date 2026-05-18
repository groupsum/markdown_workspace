import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID,
  MDWRK_DOCS_GOVERNANCE_FEATURES,
  validateMdwrkDocsGovernance,
} from './mdwrk-docs-governance.mjs';

test('validates docs governance boundary and feature-owned docs', async () => {
  const result = await validateMdwrkDocsGovernance();

  assert.deepEqual(result.failures, []);
  assert.equal(result.passed, true);
  assert.equal(result.details.boundaryId, MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID);
  assert.deepEqual(
    result.details.featureIds,
    MDWRK_DOCS_GOVERNANCE_FEATURES.map((feature) => feature.id),
  );
});

test('requires app and content-pack documentation roots', async () => {
  const result = await validateMdwrkDocsGovernance();
  const rootLabels = result.details.roots.map((root) => root.label);

  assert.equal(result.passed, true);
  assert.deepEqual(rootLabels, ['app', 'content-pack']);
});
