import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MDWRK_EXTENSION_CONTRIBUTION_FEATURE_IDS,
  validateMdwrkExtensionContributions,
} from './mdwrk-extension-contributions.mjs';

test('validates the live extension contribution boundary runtime contract', async () => {
  const result = await validateMdwrkExtensionContributions();

  assert.equal(result.passed, true, result.failures.join('\n'));
  assert.deepEqual(MDWRK_EXTENSION_CONTRIBUTION_FEATURE_IDS, [
    'feat:extension-contribution-manifest-surfaces',
    'feat:extension-host-contribution-contract',
    'feat:extension-runtime-hook-dispatch',
    'feat:extension-runtime-production-default-boundary',
    'feat:extension-catalog-contribution-fixture',
  ]);
});

test('requires every boundary feature to stay in the extension contribution slot', async () => {
  const result = await validateMdwrkExtensionContributions();

  assert.equal(result.details.boundaryId, 'bnd:mdwrk-extension-contributions-next');
  assert.equal(result.details.featureIds.length, 5);
});
