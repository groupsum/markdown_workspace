import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isCliEntry, readJson, repoRoot } from '../lib/workspace.mjs';

export const MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID = 'bnd:mdwrk-docs-governance-next';
export const MDWRK_DOCS_GOVERNANCE_FEATURES = [
  {
    id: 'feat:mdwrk-package-owned-documentation',
    claimId: 'clm:docs-extension-authoring-guide',
    path: 'data/markdown/docs/product/package-owned-documentation.md',
    slug: 'product/package-owned-documentation',
    requiredTerms: [
      'package owner',
      '@mdwrk/markdown-editor-core',
      '@mdwrk/extension-manifest',
      '@mdwrk/mdwrkcom-content-pack',
      'version bumped',
    ],
  },
  {
    id: 'feat:mdwrk-screenshot-evidence-documentation',
    claimId: 'clm:docs-uix-responsive-contract',
    path: 'data/markdown/docs/product/screenshot-evidence.md',
    slug: 'product/screenshot-evidence',
    requiredTerms: [
      'screenshot evidence',
      'view, mode, pane, modal, and theme',
      'viewport band',
      'manifest',
      'artifact path',
    ],
  },
  {
    id: 'feat:mdwrk-editor-command-documentation',
    claimId: 'clm:docs-view-toolbar',
    path: 'data/markdown/docs/usage/editor-command-integrity.md',
    slug: 'usage/editor-command-integrity',
    requiredTerms: [
      '@mdwrk/markdown-editor-core',
      '@mdwrk/markdown-editor-react',
      '@mdwrk/markdown-edit-in-renderer-react',
      'Checkbox insertion',
      'Link and image commands',
    ],
  },
  {
    id: 'feat:mdwrk-extension-surface-documentation',
    claimId: 'clm:docs-extension-authoring-guide',
    path: 'data/markdown/docs/authoring/extension-contribution-surfaces.md',
    slug: 'authoring/extension-contribution-surfaces',
    requiredTerms: [
      'Extension contribution surfaces',
      'hook registrations',
      'settings schemas',
      'diagnostics',
      'external catalog fixtures',
    ],
  },
];

const ROOTS = [
  { label: 'app', root: 'apps/mdwrkcom' },
  { label: 'content-pack', root: 'packages/content/mdwrkcom-content-pack' },
];

export async function validateMdwrkDocsGovernance(options = {}) {
  const root = options.root ?? repoRoot;
  const registry = await readJson(path.join(root, '.ssot', 'registry.json'));
  const packageJson = await readJson(path.join(root, 'package.json'));
  const failures = [];

  validateBoundary(registry, failures);
  validateRootScript(packageJson, failures);
  validateDocs(root, failures);

  return {
    passed: failures.length === 0,
    failures,
    details: {
      boundaryId: MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID,
      featureIds: MDWRK_DOCS_GOVERNANCE_FEATURES.map((feature) => feature.id),
      roots: ROOTS,
    },
  };
}

function validateBoundary(registry, failures) {
  const boundary = registry.boundaries?.find((entry) => entry.id === MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID);
  if (!boundary) {
    failures.push(`Missing boundary ${MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID}.`);
    return;
  }
  if (boundary.status !== 'active') failures.push(`${MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID} must remain active.`);
  for (const feature of MDWRK_DOCS_GOVERNANCE_FEATURES) {
    if (!boundary.feature_ids?.includes(feature.id)) {
      failures.push(`${MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID} must include ${feature.id}.`);
    }
    const registryFeature = registry.features?.find((entry) => entry.id === feature.id);
    if (!registryFeature) {
      failures.push(`Missing feature ${feature.id}.`);
      continue;
    }
    if (registryFeature.plan?.slot !== 'mdwrk-docs-governance' || registryFeature.plan?.horizon !== 'explicit') {
      failures.push(`${feature.id} must use explicit slot mdwrk-docs-governance.`);
    }
    if (!registryFeature.claim_ids?.includes(feature.claimId)) {
      failures.push(`${feature.id} must link ${feature.claimId}.`);
    }
  }
}

function validateRootScript(packageJson, failures) {
  const expected = 'node ./tools/governance/validate-mdwrk-docs-governance.mjs';
  if (packageJson.scripts?.['validate:mdwrk-docs-governance'] !== expected) {
    failures.push('package.json must expose validate:mdwrk-docs-governance with the governed validator path.');
  }
  if (!packageJson.scripts?.['ci:governance']?.includes('npm run validate:mdwrk-docs-governance')) {
    failures.push('ci:governance must include npm run validate:mdwrk-docs-governance.');
  }
}

function validateDocs(root, failures) {
  for (const feature of MDWRK_DOCS_GOVERNANCE_FEATURES) {
    const docs = ROOTS.map((entry) => ({
      ...entry,
      absolutePath: path.join(root, entry.root, feature.path),
    }));
    for (const doc of docs) {
      if (!fs.existsSync(doc.absolutePath)) {
        failures.push(`${feature.id}: missing ${path.relative(root, doc.absolutePath).replace(/\\/g, '/')}.`);
        continue;
      }
      const content = fs.readFileSync(doc.absolutePath, 'utf8').replace(/^\uFEFF/, '');
      const frontmatter = readFrontmatter(content, doc.absolutePath);
      if (frontmatter.slug !== feature.slug) {
        failures.push(`${feature.id}: ${doc.label} doc slug must be ${feature.slug}.`);
      }
      if (frontmatter.status !== 'published') {
        failures.push(`${feature.id}: ${doc.label} doc must be published.`);
      }
      if (!content.includes('## Related Docs')) {
        failures.push(`${feature.id}: ${doc.label} doc must include related docs.`);
      }
      for (const term of feature.requiredTerms) {
        if (!content.includes(term)) {
          failures.push(`${feature.id}: ${doc.label} doc missing required term ${term}.`);
        }
      }
    }
    if (docs.every((doc) => fs.existsSync(doc.absolutePath))) {
      const [appDoc, packDoc] = docs;
      if (hash(appDoc.absolutePath) !== hash(packDoc.absolutePath)) {
        failures.push(`${feature.id}: app and content-pack docs must match byte-for-byte.`);
      }
    }
  }
}

function readFrontmatter(content, filePath) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) throw new Error(`${filePath} is missing frontmatter`);
  return Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map((lineMatch) => [lineMatch[1].trim(), lineMatch[2].trim().replace(/^"|"$/g, '')]),
  );
}

function hash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

if (isCliEntry(import.meta.url)) {
  const result = await validateMdwrkDocsGovernance();
  if (process.argv.includes('--json')) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else if (result.passed) {
    console.log(`MdWrk docs governance validation passed for ${MDWRK_DOCS_GOVERNANCE_BOUNDARY_ID}.`);
  } else {
    for (const failure of result.failures) console.error(failure);
    process.exit(1);
  }
}
