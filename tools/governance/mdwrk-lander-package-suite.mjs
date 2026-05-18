import fs from 'node:fs';
import path from 'node:path';
import { isCliEntry, readJson, repoRoot } from '../lib/workspace.mjs';

export const MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID = 'bnd:mdwrk-lander-package-suite-next';
export const MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID = 'feat:lander-package-suite-validation';

export const LANDER_PACKAGE_SUITE_WORKSPACES = [
  { name: '@mdwrk/lander-content-contract', path: 'packages/lander/lander-content-contract' },
  { name: '@mdwrk/lander-core', path: 'packages/lander/lander-core' },
  { name: '@mdwrk/structured-data', path: 'packages/shared/structured-data' },
  { name: '@mdwrk/lander-seo', path: 'packages/lander/lander-seo' },
  { name: '@mdwrk/lander-theme', path: 'packages/lander/lander-theme' },
  { name: '@mdwrk/lander-markdown-content-adapter', path: 'packages/lander/lander-markdown-content-adapter' },
  { name: '@mdwrk/lander-page-templates', path: 'packages/lander/lander-page-templates' },
  { name: '@mdwrk/lander-page-template-presets', path: 'packages/lander/lander-page-template-presets' },
  { name: '@mdwrk/lander-react', path: 'packages/lander/lander-react' },
  { name: '@mdwrk/mdwrkcom-content-pack', path: 'packages/content/mdwrkcom-content-pack' },
];

const REQUIRED_ROOT_SUITE_SCRIPTS = [
  'build:lander:packages',
  'typecheck:lander:packages',
  'lint:lander:packages',
  'test:lander:packages',
  'validate:mdwrk-lander-package-suite',
];

const REQUIRED_PACKAGE_SCRIPTS = ['build', 'typecheck', 'lint', 'test', 'prepack'];

export async function validateMdwrkLanderPackageSuite(options = {}) {
  const root = options.root ?? repoRoot;
  const registry = await readJson(path.join(root, '.ssot', 'registry.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));
  const failures = [];

  validateBoundary(registry, failures);
  validateRootScriptWiring(packageJson, failures);
  await validatePackageSuite(root, packageJson, failures);

  return {
    passed: failures.length === 0,
    failures,
    details: {
      boundaryId: MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID,
      featureId: MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID,
      workspaces: LANDER_PACKAGE_SUITE_WORKSPACES,
    },
  };
}

function validateBoundary(registry, failures) {
  const boundary = registry.boundaries?.find((entry) => entry.id === MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID);
  if (!boundary) {
    failures.push(`Missing boundary ${MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID}.`);
    return;
  }
  if (boundary.status !== 'active') {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID} must remain active during implementation.`);
  }
  if (boundary.frozen !== false) {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID} must remain non-frozen during implementation.`);
  }
  if (!boundary.feature_ids?.includes(MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID)) {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID} must include ${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID}.`);
  }

  const feature = registry.features?.find((entry) => entry.id === MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID);
  if (!feature) {
    failures.push(`Missing feature ${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID}.`);
    return;
  }
  if (feature.plan?.horizon !== 'explicit' || feature.plan?.slot !== 'mdwrk-lander-package-suite') {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID} must use explicit slot mdwrk-lander-package-suite.`);
  }
  if (!feature.spec_ids?.includes('spc:2095')) {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID} must link spc:2095.`);
  }
  if (!feature.claim_ids?.includes('clm:portable-lander-package-family')) {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID} must link clm:portable-lander-package-family.`);
  }
  if (!feature.test_ids?.length) {
    failures.push(`${MDWRK_LANDER_PACKAGE_SUITE_FEATURE_ID} must link at least one executable test.`);
  }
}

function validateRootScriptWiring(packageJson, failures) {
  const scripts = packageJson.scripts ?? {};
  for (const scriptName of REQUIRED_ROOT_SUITE_SCRIPTS) {
    if (!scripts[scriptName]) {
      failures.push(`package.json must expose ${scriptName}.`);
    }
  }
  if (scripts['validate:mdwrk-lander-package-suite'] !== 'node ./tools/governance/validate-mdwrk-lander-package-suite.mjs') {
    failures.push('package.json must expose validate:mdwrk-lander-package-suite with the governed validator path.');
  }
  if (!scripts['ci:governance']?.includes('npm run validate:mdwrk-lander-package-suite')) {
    failures.push('ci:governance must include npm run validate:mdwrk-lander-package-suite.');
  }

  for (const { name } of LANDER_PACKAGE_SUITE_WORKSPACES) {
    for (const scriptName of ['build:lander:packages', 'typecheck:lander:packages', 'lint:lander:packages', 'test:lander:packages']) {
      if (!scripts[scriptName]?.includes(`-w ${name}`)) {
        failures.push(`${scriptName} must include ${name}.`);
      }
    }
  }
}

async function validatePackageSuite(root, packageJson, failures) {
  const workspacePatterns = packageJson.workspaces ?? [];
  for (const { name, path: relativePath } of LANDER_PACKAGE_SUITE_WORKSPACES) {
    if (!workspacePatterns.some((pattern) => workspacePatternCovers(pattern, relativePath))) {
      failures.push(`Root workspaces must include ${relativePath}.`);
    }

    const packagePath = path.join(root, relativePath, 'package.json');
    if (!fs.existsSync(packagePath)) {
      failures.push(`Missing ${relativePath}/package.json.`);
      continue;
    }
    const manifest = await readJson(packagePath);
    if (manifest.name !== name) {
      failures.push(`${relativePath}/package.json must be named ${name}.`);
    }
    if (manifest.private === true) {
      failures.push(`${name} must remain publishable, not private.`);
    }
    if (manifest.license !== 'Apache-2.0') {
      failures.push(`${name} must declare Apache-2.0 license.`);
    }
    if (manifest.publishConfig?.access !== 'public') {
      failures.push(`${name} must declare publishConfig.access public.`);
    }
    if (manifest.engines?.node !== '>=20 <23') {
      failures.push(`${name} must declare engines.node >=20 <23.`);
    }
    if (manifest.type !== 'module') {
      failures.push(`${name} must be an ESM package.`);
    }
    if (!Array.isArray(manifest.files) || !manifest.files.includes('dist')) {
      failures.push(`${name} must publish dist in files.`);
    }
    if (manifest.main !== './dist/index.js' || manifest.types !== './dist/index.d.ts') {
      failures.push(`${name} must expose dist index main/types.`);
    }
    if (!manifest.exports?.['.']) {
      failures.push(`${name} must expose the package root export.`);
    }
    for (const scriptName of REQUIRED_PACKAGE_SCRIPTS) {
      if (!manifest.scripts?.[scriptName]) {
        failures.push(`${name} must expose ${scriptName} script.`);
      }
    }
    if (!manifest.scripts?.prepack?.includes('npm run build')) {
      failures.push(`${name} prepack must run build.`);
    }
  }
}

function workspacePatternCovers(pattern, relativePath) {
  if (pattern.endsWith('/*')) {
    return relativePath.startsWith(pattern.slice(0, -1));
  }
  return pattern === relativePath;
}

if (isCliEntry(import.meta.url)) {
  const result = await validateMdwrkLanderPackageSuite();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.passed) {
    console.log(`MdWrk lander package suite validation passed for ${MDWRK_LANDER_PACKAGE_SUITE_BOUNDARY_ID}.`);
  } else {
    for (const failure of result.failures) {
      console.error(failure);
    }
    process.exit(1);
  }
}
