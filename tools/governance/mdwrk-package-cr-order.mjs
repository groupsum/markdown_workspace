import fs from 'node:fs';
import path from 'node:path';
import {
  collectWorkspacePackageJsonPaths,
  isCliEntry,
  readJson,
  relativeToRepo,
  repoRoot,
} from '../lib/workspace.mjs';

export const MDWRK_PACKAGE_CR_BOUNDARY_ID = 'bnd:mdwrk-package-cr-order-next';

export const MDWRK_PACKAGE_CR_FEATURE_IDS = [
  'feat:mdwrk-package-change-request-execution',
  'feat:mdwrk-package-owned-version-bump-governance',
  'feat:mdwrk-scoped-agent-ownership-instructions',
  'feat:mdwrk-package-screenshot-evidence-matrix',
];

export const PACKAGE_OWNER_ORDER = [
  { id: 'contracts', order: 10, prefixes: ['packages/contracts/'] },
  { id: 'shared', order: 20, prefixes: ['packages/shared/'] },
  { id: 'renderer', order: 30, prefixes: ['packages/renderer/'] },
  { id: 'editor', order: 40, prefixes: ['packages/editor/'] },
  { id: 'extensions', order: 50, prefixes: ['packages/extensions/'] },
  { id: 'client', order: 60, prefixes: ['apps/client/'] },
  { id: 'desktop', order: 70, prefixes: ['apps/desktop/'] },
  { id: 'lander', order: 80, prefixes: ['packages/lander/'] },
  { id: 'content', order: 90, prefixes: ['packages/content/'] },
  { id: 'examples', order: 110, prefixes: ['examples/'] },
  { id: 'docs', order: 120, prefixes: ['docs/'] },
  { id: 'governance', order: 130, prefixes: ['.ssot/', 'tools/governance/', 'AGENTS.md', 'package.json'] },
];

export const REQUIRED_AGENT_PATHS = [
  'AGENTS.md',
  'packages/AGENTS.md',
  'packages/contracts/theme-contract/AGENTS.md',
  'packages/shared/ui-tokens/AGENTS.md',
  'packages/renderer/AGENTS.md',
  'packages/editor/AGENTS.md',
  'packages/lander/lander-content-contract/AGENTS.md',
  'packages/lander/lander-react/AGENTS.md',
  'packages/lander/lander-theme/AGENTS.md',
  'apps/client/styles/AGENTS.md',
  'docs/AGENTS.md',
];

export const REQUIRED_SCREENSHOT_TOKENS = [
  'theme',
  'portrait',
  'square',
  'landscape',
  'wide',
  'ultra-wide',
  'workspace-panel-open-single-pane',
  'workspace-panel-open-split-stage',
  'workspace-panel-open-preview-pane',
  'selector-create-modal',
  'selector-theme-modal',
  'selector-delete-modal',
  'settings-visual',
  'settings-data-pwa',
  'extension-manager-modal',
  'command-palette',
  'git-pane',
];

export function semverPatchOrMinorOnly(fromVersion, toVersion) {
  const from = parseSemver(fromVersion);
  const to = parseSemver(toVersion);
  if (!from || !to) {
    return false;
  }
  if (from.major !== to.major) {
    return false;
  }
  if (to.minor === from.minor && to.patch > from.patch) {
    return true;
  }
  if (to.minor > from.minor && to.patch === 0) {
    return true;
  }
  return false;
}

export function packageOwnerForPath(relativePath) {
  const normalized = relativePath.replaceAll('\\', '/');
  for (const owner of PACKAGE_OWNER_ORDER) {
    if (owner.prefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix))) {
      return owner;
    }
  }
  return { id: 'unowned', order: Number.MAX_SAFE_INTEGER, prefixes: [] };
}

export function orderChangeRequestsByOwner(changeRequests) {
  return [...changeRequests].sort((left, right) => {
    const leftOwner = packageOwnerForPath(left.path);
    const rightOwner = packageOwnerForPath(right.path);
    if (leftOwner.order !== rightOwner.order) {
      return leftOwner.order - rightOwner.order;
    }
    return left.path.localeCompare(right.path);
  }).map((request) => ({
    ...request,
    owner: packageOwnerForPath(request.path).id,
  }));
}

export async function validateMdwrkPackageCrOrder(options = {}) {
  const root = options.root ?? repoRoot;
  const registry = await readJson(path.join(root, '.ssot', 'registry.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));
  const workspacePackageJsonPaths = await collectWorkspacePackageJsonPaths();
  const failures = [];
  const details = {
    workspacePackageCount: workspacePackageJsonPaths.length,
    orderedOwners: PACKAGE_OWNER_ORDER.map((owner) => owner.id),
    requiredAgentPaths: REQUIRED_AGENT_PATHS,
    requiredScreenshotTokens: REQUIRED_SCREENSHOT_TOKENS,
  };

  validateBoundary(registry, failures);
  await validateWorkspacePackageVersions(workspacePackageJsonPaths, failures);
  validateScripts(packageJson, failures);
  validateScopedAgents(root, failures);
  validateScreenshotMatrix(root, failures);

  return {
    passed: failures.length === 0,
    failures,
    details,
  };
}

function validateBoundary(registry, failures) {
  const boundary = registry.boundaries?.find((entry) => entry.id === MDWRK_PACKAGE_CR_BOUNDARY_ID);
  if (!boundary) {
    failures.push(`Missing boundary ${MDWRK_PACKAGE_CR_BOUNDARY_ID}.`);
    return;
  }
  if (boundary.status !== 'active') {
    failures.push(`${MDWRK_PACKAGE_CR_BOUNDARY_ID} must remain active until scope is frozen.`);
  }
  if (boundary.frozen !== false) {
    failures.push(`${MDWRK_PACKAGE_CR_BOUNDARY_ID} must be non-frozen during implementation.`);
  }

  const boundaryFeatures = new Set(boundary.feature_ids ?? []);
  for (const featureId of MDWRK_PACKAGE_CR_FEATURE_IDS) {
    if (!boundaryFeatures.has(featureId)) {
      failures.push(`${MDWRK_PACKAGE_CR_BOUNDARY_ID} is missing feature ${featureId}.`);
    }
    const feature = registry.features?.find((entry) => entry.id === featureId);
    if (!feature) {
      failures.push(`Missing feature ${featureId}.`);
      continue;
    }
    if (feature.plan?.horizon !== 'explicit' || feature.plan?.slot !== 'mdwrk-package-cr-order') {
      failures.push(`${featureId} must use explicit slot mdwrk-package-cr-order.`);
    }
    if (!feature.claim_ids?.length) {
      failures.push(`${featureId} must link at least one claim.`);
    }
    if (!feature.test_ids?.length) {
      failures.push(`${featureId} must link at least one test.`);
    }
  }
}

async function validateWorkspacePackageVersions(packageJsonPaths, failures) {
  if (packageJsonPaths.length === 0) {
    failures.push('Workspace package discovery returned no package manifests.');
  }
  for (const packageJsonPath of packageJsonPaths) {
    const packageJson = await readJson(packageJsonPath);
    if (!packageJson.name) {
      failures.push(`${relativeToRepo(packageJsonPath)} is missing package name.`);
    }
    if (!parseSemver(packageJson.version)) {
      failures.push(`${relativeToRepo(packageJsonPath)} must use a valid semver package version.`);
    }
  }
}

function validateScripts(packageJson, failures) {
  const scripts = packageJson.scripts ?? {};
  if (scripts['validate:mdwrk-package-cr-order'] !== 'node ./tools/governance/validate-mdwrk-package-cr-order.mjs') {
    failures.push('package.json must expose validate:mdwrk-package-cr-order.');
  }
  if (!scripts['ci:governance']?.includes('npm run validate:mdwrk-package-cr-order')) {
    failures.push('ci:governance must include npm run validate:mdwrk-package-cr-order.');
  }
}

function validateScopedAgents(root, failures) {
  for (const relativePath of REQUIRED_AGENT_PATHS) {
    if (!fs.existsSync(path.join(root, relativePath))) {
      failures.push(`Missing scoped agent ownership instructions: ${relativePath}.`);
    }
  }
}

function validateScreenshotMatrix(root, failures) {
  const screenshotScriptPath = path.join(root, 'apps', 'client', 'tests', 'generate-theme-screenshots.mjs');
  if (!fs.existsSync(screenshotScriptPath)) {
    failures.push('Missing screenshot matrix generator: apps/client/tests/generate-theme-screenshots.mjs.');
    return;
  }
  const text = fs.readFileSync(screenshotScriptPath, 'utf8');
  for (const token of REQUIRED_SCREENSHOT_TOKENS) {
    if (!text.includes(token)) {
      failures.push(`Screenshot matrix generator is missing required token: ${token}.`);
    }
  }
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(String(version ?? ''));
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

if (isCliEntry(import.meta.url)) {
  const result = await validateMdwrkPackageCrOrder();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.passed) {
    console.log(`MdWrk package CR order validation passed for ${MDWRK_PACKAGE_CR_BOUNDARY_ID}.`);
  } else {
    for (const failure of result.failures) {
      console.error(failure);
    }
    process.exit(1);
  }
}
