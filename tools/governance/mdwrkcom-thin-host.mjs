import fs from 'node:fs';
import path from 'node:path';
import { isCliEntry, readJson, repoRoot } from '../lib/workspace.mjs';

export const MDWRKCOM_THIN_HOST_BOUNDARY_ID = 'bnd:mdwrkcom-thin-host-next';
export const MDWRKCOM_THIN_HOST_FEATURE_IDS = [
  'feat:mdwrkcom-content-pack-importability',
  'feat:mdwrkcom-thin-host-package-adoption',
  'feat:mdwrkcom-page-screenshot-evidence',
];

export const MDWRKCOM_THIN_HOST_TEST_IDS = [
  'tst:mdwrkcom-content-pack-rendering-intent-smoke',
  'tst:mdwrkcom-lander-renderer-host-smoke',
  'tst:mdwrkcom-page-screenshot-evidence-manifest',
  'tst:tools-governance-mdwrkcom-thin-host.test.mjs',
];

const APP_PACKAGE = '@mdwrk/mdwrkcom';
const CONTENT_PACK_PACKAGE = '@mdwrk/mdwrkcom-content-pack';
const SCREENSHOT_MANIFEST_PATH = 'apps/mdwrkcom/tests/page-screenshot-evidence.json';

export async function validateMdwrkcomThinHost(options = {}) {
  const root = options.root ?? repoRoot;
  const registry = await readJson(path.join(root, '.ssot', 'registry.json'));
  const appManifest = await readJson(path.join(root, 'apps', 'mdwrkcom', 'package.json'));
  const contentPackManifest = await readJson(path.join(root, 'packages', 'content', 'mdwrkcom-content-pack', 'package.json'));
  const screenshotManifest = await readJson(path.join(root, SCREENSHOT_MANIFEST_PATH));
  const failures = [];

  validateBoundary(registry, failures);
  validatePackageAdoption(appManifest, contentPackManifest, failures);
  validateRuntimeSources(root, failures);
  validateScreenshotManifest(root, screenshotManifest, failures);

  return {
    passed: failures.length === 0,
    failures,
    details: {
      boundaryId: MDWRKCOM_THIN_HOST_BOUNDARY_ID,
      featureIds: MDWRKCOM_THIN_HOST_FEATURE_IDS,
      testIds: MDWRKCOM_THIN_HOST_TEST_IDS,
      screenshotManifestPath: SCREENSHOT_MANIFEST_PATH,
    },
  };
}

function validateBoundary(registry, failures) {
  const boundary = registry.boundaries?.find((entry) => entry.id === MDWRKCOM_THIN_HOST_BOUNDARY_ID);
  if (!boundary) {
    failures.push(`Missing boundary ${MDWRKCOM_THIN_HOST_BOUNDARY_ID}.`);
    return;
  }
  if (boundary.status !== 'active') failures.push(`${MDWRKCOM_THIN_HOST_BOUNDARY_ID} must remain active.`);
  for (const featureId of MDWRKCOM_THIN_HOST_FEATURE_IDS) {
    if (!boundary.feature_ids?.includes(featureId)) {
      failures.push(`${MDWRKCOM_THIN_HOST_BOUNDARY_ID} must include ${featureId}.`);
    }
    const feature = registry.features?.find((entry) => entry.id === featureId);
    if (!feature) {
      failures.push(`Missing feature ${featureId}.`);
      continue;
    }
    if (feature.plan?.horizon !== 'explicit' || feature.plan?.slot !== 'mdwrkcom-thin-host') {
      failures.push(`${featureId} must use explicit slot mdwrkcom-thin-host.`);
    }
    if (!feature.claim_ids?.length) failures.push(`${featureId} must link at least one claim.`);
    if (!feature.spec_ids?.length) failures.push(`${featureId} must link at least one spec.`);
  }
}

function validatePackageAdoption(appManifest, contentPackManifest, failures) {
  if (appManifest.name !== APP_PACKAGE) failures.push('apps/mdwrkcom/package.json must be named @mdwrk/mdwrkcom.');
  if (contentPackManifest.name !== CONTENT_PACK_PACKAGE) {
    failures.push('packages/content/mdwrkcom-content-pack/package.json must be named @mdwrk/mdwrkcom-content-pack.');
  }
  if (!appManifest.dependencies?.[CONTENT_PACK_PACKAGE]) {
    failures.push(`${APP_PACKAGE} must depend on ${CONTENT_PACK_PACKAGE}.`);
  }
  if (!contentPackManifest.exports?.['.'] || !contentPackManifest.exports?.['./generated/*']) {
    failures.push(`${CONTENT_PACK_PACKAGE} must export root declarations and generated artifact mirrors.`);
  }
  if (!contentPackManifest.files?.includes('content') || !contentPackManifest.files?.includes('public')) {
    failures.push(`${CONTENT_PACK_PACKAGE} must publish content and public assets.`);
  }
  if (!appManifest.scripts?.['test:lander-renderer-host']) {
    failures.push(`${APP_PACKAGE} must expose test:lander-renderer-host.`);
  }
}

function validateRuntimeSources(root, failures) {
  const cliSource = fs.readFileSync(path.join(root, 'apps', 'mdwrkcom', 'src', 'cli.mjs'), 'utf8');
  const contentPackSource = fs.readFileSync(path.join(root, 'packages', 'content', 'mdwrkcom-content-pack', 'src', 'index.ts'), 'utf8');

  if (!cliSource.includes("import('@mdwrk/mdwrkcom-content-pack')")) {
    failures.push('apps/mdwrkcom/src/cli.mjs must import the mdwrkcom content pack.');
  }
  if (!cliSource.includes('packages/content/mdwrkcom-content-pack/dist/index.js')) {
    failures.push('apps/mdwrkcom/src/cli.mjs must include a repo-local content-pack fallback for non-hydrated workspace installs.');
  }
  if (!cliSource.includes('resolveMdwrkcomContentPackUrl')) {
    failures.push('apps/mdwrkcom/src/cli.mjs must resolve source roots through the content pack.');
  }
  for (const forbidden of [
    "const contentRoot = path.join(landerRoot, 'content')",
    "const dataRoot = path.join(landerRoot, 'data')",
    "const publicRoot = path.join(landerRoot, 'public')",
  ]) {
    if (cliSource.includes(forbidden)) failures.push(`apps/mdwrkcom/src/cli.mjs must not retain app-local root ${forbidden}.`);
  }
  if (!contentPackSource.includes('resolveMdwrkcomContentPackUrl')) {
    failures.push('mdwrkcom content pack must export a URL resolver for host adoption.');
  }
  if (!contentPackSource.includes('componentIntents') || !contentPackSource.includes('schemaIntents')) {
    failures.push('mdwrkcom content pack must expose component and schema intent declarations.');
  }
}

function validateScreenshotManifest(root, manifest, failures) {
  if (manifest.schemaVersion !== 1) failures.push(`${SCREENSHOT_MANIFEST_PATH} must use schemaVersion 1.`);
  if (manifest.boundaryId !== MDWRKCOM_THIN_HOST_BOUNDARY_ID) failures.push(`${SCREENSHOT_MANIFEST_PATH} boundaryId mismatch.`);
  if (manifest.featureId !== 'feat:mdwrkcom-page-screenshot-evidence') failures.push(`${SCREENSHOT_MANIFEST_PATH} featureId mismatch.`);
  if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length < 3) {
    failures.push(`${SCREENSHOT_MANIFEST_PATH} must list at least home, docs, and blog-list screenshots.`);
    return;
  }

  const requiredViews = new Set(['home', 'docs', 'blog-list']);
  const seenViews = new Set();
  const seenThemes = new Set();
  const contentPackRoot = path.join(root, 'packages', 'content', 'mdwrkcom-content-pack');
  for (const entry of manifest.screenshots) {
    for (const field of ['id', 'route', 'view', 'theme', 'mode', 'viewportBand', 'artifact']) {
      if (!entry[field]) failures.push(`${SCREENSHOT_MANIFEST_PATH}: screenshot entry missing ${field}.`);
    }
    seenViews.add(entry.view);
    seenThemes.add(entry.theme);
    const artifactPath = path.join(contentPackRoot, entry.artifact ?? '');
    if (!fs.existsSync(artifactPath)) {
      failures.push(`${SCREENSHOT_MANIFEST_PATH}: missing screenshot artifact ${entry.artifact}.`);
      continue;
    }
    const size = fs.statSync(artifactPath).size;
    if (size < 1024) failures.push(`${entry.artifact} must be a non-empty screenshot artifact.`);
  }
  for (const view of requiredViews) {
    if (!seenViews.has(view)) failures.push(`${SCREENSHOT_MANIFEST_PATH} missing ${view} view screenshot.`);
  }
  if (!seenThemes.has('lander-light') || !seenThemes.has('lander-dark')) {
    failures.push(`${SCREENSHOT_MANIFEST_PATH} must include light and dark lander themes.`);
  }
}

if (isCliEntry(import.meta.url)) {
  const result = await validateMdwrkcomThinHost();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.passed) {
    console.log(`mdwrkcom thin-host validation passed for ${MDWRKCOM_THIN_HOST_BOUNDARY_ID}.`);
  } else {
    for (const failure of result.failures) console.error(failure);
    process.exit(1);
  }
}
