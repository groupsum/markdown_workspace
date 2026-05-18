import fs from 'node:fs';
import path from 'node:path';
import { isCliEntry, readJson, repoRoot } from '../lib/workspace.mjs';

export const MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID = 'bnd:mdwrk-extension-contributions-next';

export const MDWRK_EXTENSION_CONTRIBUTION_FEATURE_IDS = [
  'feat:extension-contribution-manifest-surfaces',
  'feat:extension-host-contribution-contract',
  'feat:extension-runtime-hook-dispatch',
  'feat:extension-runtime-production-default-boundary',
  'feat:extension-catalog-contribution-fixture',
];

const REQUIRED_MANIFEST_CONTRIBUTION_TOKENS = [
  'CommandContributionDescriptor',
  'ViewContributionDescriptor',
  'WorkspaceModuleContributionDescriptor',
  'ActionRailContributionDescriptor',
  'SettingsSectionContributionDescriptor',
  'HookContributionDescriptor',
  'readonly hooks?',
];

const REQUIRED_HOST_CONTRACT_TOKENS = [
  'RegisteredCommand',
  'RegisteredView',
  'RegisteredWorkspaceModule',
  'RegisteredActionRailItem',
  'RegisteredSettingsSection',
  'RegisteredHook',
];

const REQUIRED_RUNTIME_TOKENS = [
  'registerHook(hook)',
  'hookIds',
  'hook.register',
  'options.registrationSink.registerHook',
];

const REQUIRED_CATALOG_TOKENS = [
  'external.catalog-hello.before-save',
  'workspace.beforeSave',
  'hook.register',
  'context.registerHook',
  'distribution',
  'channel: "catalog"',
];

export async function validateMdwrkExtensionContributions(options = {}) {
  const root = options.root ?? repoRoot;
  const registry = await readJson(path.join(root, '.ssot', 'registry.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));
  const failures = [];

  validateBoundary(registry, failures);
  validateScriptWiring(packageJson, failures);
  validateTextTokens(root, failures);

  return {
    passed: failures.length === 0,
    failures,
    details: {
      boundaryId: MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID,
      featureIds: MDWRK_EXTENSION_CONTRIBUTION_FEATURE_IDS,
    },
  };
}

function validateBoundary(registry, failures) {
  const boundary = registry.boundaries?.find((entry) => entry.id === MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID);
  if (!boundary) {
    failures.push(`Missing boundary ${MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID}.`);
    return;
  }
  if (boundary.status !== 'active') {
    failures.push(`${MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID} must remain active until freeze.`);
  }
  if (boundary.frozen !== false) {
    failures.push(`${MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID} must remain non-frozen during implementation.`);
  }

  const boundaryFeatures = new Set(boundary.feature_ids ?? []);
  for (const featureId of MDWRK_EXTENSION_CONTRIBUTION_FEATURE_IDS) {
    if (!boundaryFeatures.has(featureId)) {
      failures.push(`${MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID} is missing feature ${featureId}.`);
    }
    const feature = registry.features?.find((entry) => entry.id === featureId);
    if (!feature) {
      failures.push(`Missing feature ${featureId}.`);
      continue;
    }
    if (feature.plan?.horizon !== 'explicit' || feature.plan?.slot !== 'mdwrk-extension-contributions') {
      failures.push(`${featureId} must use explicit slot mdwrk-extension-contributions.`);
    }
    if (!feature.spec_ids?.includes('spc:2096')) {
      failures.push(`${featureId} must link spc:2096.`);
    }
    if (!feature.claim_ids?.length || !feature.test_ids?.length) {
      failures.push(`${featureId} must link at least one claim and test.`);
    }
  }
}

function validateScriptWiring(packageJson, failures) {
  const scripts = packageJson.scripts ?? {};
  if (scripts['validate:mdwrk-extension-contributions'] !== 'node ./tools/governance/validate-mdwrk-extension-contributions.mjs') {
    failures.push('package.json must expose validate:mdwrk-extension-contributions.');
  }
  if (!scripts['ci:governance']?.includes('npm run validate:mdwrk-extension-contributions')) {
    failures.push('ci:governance must include npm run validate:mdwrk-extension-contributions.');
  }
}

function validateTextTokens(root, failures) {
  assertTokens(
    path.join(root, 'packages/contracts/extension-manifest/src/contributions.ts'),
    REQUIRED_MANIFEST_CONTRIBUTION_TOKENS,
    failures,
  );
  assertTokens(
    path.join(root, 'packages/contracts/extension-host/src/registration.ts'),
    REQUIRED_HOST_CONTRACT_TOKENS,
    failures,
  );
  assertTokens(
    path.join(root, 'packages/contracts/extension-host/src/context.ts'),
    ['registerHook'],
    failures,
  );
  assertTokens(
    path.join(root, 'packages/extensions/extension-runtime/src/runtime.ts'),
    REQUIRED_RUNTIME_TOKENS,
    failures,
  );
  assertTokens(
    path.join(root, 'packages/extensions/extension-runtime/src/types.ts'),
    ['registerHook?', 'hookIds'],
    failures,
  );
  assertTokens(
    path.join(root, 'packages/extensions/extension-catalog-hello/src/manifest.ts'),
    REQUIRED_CATALOG_TOKENS.slice(0, 3).concat(REQUIRED_CATALOG_TOKENS.slice(4)),
    failures,
  );
  assertTokens(
    path.join(root, 'packages/extensions/extension-catalog-hello/src/index.ts'),
    ['context.registerHook', 'dispatch(payload)'],
    failures,
  );
}

function assertTokens(targetPath, tokens, failures) {
  if (!fs.existsSync(targetPath)) {
    failures.push(`Missing required file ${path.relative(repoRoot, targetPath).replaceAll('\\', '/')}.`);
    return;
  }
  const text = fs.readFileSync(targetPath, 'utf8');
  for (const token of tokens) {
    if (!text.includes(token)) {
      failures.push(`${path.relative(repoRoot, targetPath).replaceAll('\\', '/')} is missing token ${token}.`);
    }
  }
}

if (isCliEntry(import.meta.url)) {
  const result = await validateMdwrkExtensionContributions();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.passed) {
    console.log(`MdWrk extension contribution validation passed for ${MDWRK_EXTENSION_CONTRIBUTIONS_BOUNDARY_ID}.`);
  } else {
    for (const failure of result.failures) {
      console.error(failure);
    }
    process.exit(1);
  }
}
