import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MDWRKCOM_THIN_HOST_BOUNDARY_ID,
  MDWRKCOM_THIN_HOST_FEATURE_IDS,
  MDWRKCOM_THIN_HOST_TEST_IDS,
  validateMdwrkcomThinHost,
} from './mdwrkcom-thin-host.mjs';

test('validates mdwrkcom thin-host package adoption and content-pack importability', async () => {
  const result = await validateMdwrkcomThinHost();

  assert.deepEqual(result.failures, []);
  assert.equal(result.passed, true);
  assert.equal(result.details.boundaryId, MDWRKCOM_THIN_HOST_BOUNDARY_ID);
  assert.deepEqual(result.details.featureIds, MDWRKCOM_THIN_HOST_FEATURE_IDS);
  assert.ok(result.details.testIds.includes('tst:mdwrkcom-content-pack-rendering-intent-smoke'));
  assert.ok(result.details.testIds.includes('tst:mdwrkcom-lander-renderer-host-smoke'));
});

test('requires screenshot evidence manifest coverage for mdwrkcom page types', async () => {
  const result = await validateMdwrkcomThinHost();

  assert.equal(result.passed, true);
  assert.equal(result.details.screenshotManifestPath, 'apps/mdwrkcom/tests/page-screenshot-evidence.json');
  assert.ok(MDWRKCOM_THIN_HOST_TEST_IDS.includes('tst:mdwrkcom-page-screenshot-evidence-manifest'));
});
