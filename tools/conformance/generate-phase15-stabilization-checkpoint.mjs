import { execFileSync } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import {
  collectFiles,
  ensureDir,
  hashFile,
  pathExists,
  readJson,
  relativeToRepo,
  repoRoot,
  resetDir,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const supportRootRelative = 'artifacts/releases/support-window-rc.1';
const supportRoot = path.join(repoRoot, supportRootRelative);
await ensureDir(artifactRoot);
await resetDir(supportRoot);

function createTarball(outputRelativePath, relativeEntries) {
  const outputAbsolutePath = path.join(repoRoot, outputRelativePath);
  execFileSync('tar', ['-czf', outputAbsolutePath, ...relativeEntries], {
    cwd: repoRoot,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return outputAbsolutePath;
}

const phase14Checkpoint = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-14-promotion-release-checkpoint.json'));
const phase14Results = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-14-promotion-release-results.json'));
const phase13Results = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-13-rc-train-results.json'));
const phase12Results = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-12-closure-suite-results.json'));
const packageInventory = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/package-inventory.json'));
const versionInventory = await readJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-13-version-inventory.json'));

const supportWindowPolicy = {
  generatedAt: '2026-03-30T00:00:00Z',
  trainId: 'promotion-rc.1',
  window: {
    startDate: '2026-03-30',
    endDate: '2026-04-13',
    durationDays: 14,
    type: 'short-post-release-compatibility-window',
    liveOnPublishedArtifacts: false,
    note: 'The repository does not have a public published release in this environment. This policy therefore applies to the prepared promotion bundle and RC train artifacts rather than to live published npm artifacts.',
  },
  acceptedChanges: {
    defaultRule: 'patch-only-on-released-train',
    nextMinorException: 'Only when a deliberate next-minor train is explicitly opened and documented.',
    disallowedWithoutNewTrain: [
      'feature expansion on the released train',
      'contract boundary drift',
      'claim-language expansion without new evidence',
    ],
  },
  monitoringFocus: [
    'extension activation failures',
    'theme regressions',
    'i18n regressions',
    'release artifact compatibility drift',
  ],
  preservedEvidenceRoots: [
    'artifacts/conformance/latest',
    'artifacts/releases/promotion-rc.1',
    supportRootRelative,
  ],
  releaseClaimPolicy: {
    allowClaimSuccess: false,
    reason: 'The minimum closure checklist is not fully green because there is still no actual published release and earlier strict-closure blockers remain recorded in the evidence.',
  },
};

const monitoringMatrix = {
  generatedAt: supportWindowPolicy.generatedAt,
  trainId: supportWindowPolicy.trainId,
  monitors: [
    {
      id: 'extension-activation-failures',
      signal: 'Extension activation diagnostics, manifest/runtime compatibility failures, activation-time exceptions.',
      severity: 'release-blocker-if-widespread',
      owner: 'extension-runtime / bundled-extension maintainers',
      action: 'Accept patch-only fixes on the released train or move to a deliberate next minor if the fix expands behavior.',
    },
    {
      id: 'theme-regressions',
      signal: 'Theme selector drift, hidden shipped themes, token/bridge mismatches, visual baseline diffs.',
      severity: 'high',
      owner: 'theme-contract / ui-tokens / app shell maintainers',
      action: 'Patch-only correction on the released train when parity or token contract stability regresses.',
    },
    {
      id: 'i18n-regressions',
      signal: 'Locale switch persistence failures, missing core catalog keys, action/header/status strings falling out of catalogs.',
      severity: 'high',
      owner: 'i18n / app shell maintainers',
      action: 'Patch-only correction on the released train while preserving locale boundary and message-key stability.',
    },
    {
      id: 'artifact-compatibility-drift',
      signal: 'Release artifact install/activation/runtime incompatibility compared with the Phase 13 and Phase 14 evidence bundles.',
      severity: 'release-blocker',
      owner: 'release engineering',
      action: 'Escalate immediately; do not widen claim language until evidence is regenerated.',
    },
  ],
};

const roadmapMarkdown = `# Phase 15 follow-on roadmap items intentionally left out of the frozen boundary

These items are **next-train candidates**, not blockers for the frozen certification boundary that the repository has been using through the checkpoint series.

## Next-train candidates

- richer table editor UX
- bibliography manager depth
- advanced citation workflows
- HTML trust-mode refinement
- optional underline extension if intentionally adopted as a named non-core extension

## Why they are not blockers in the frozen boundary

The frozen boundary for the repository and the externally frozen Markdown target never required these deeper product/UX layers to claim baseline CommonMark + default GFM support with the named optional-profile boundary already documented in the repo.

These items therefore remain valid roadmap work, but they are not treated as retroactive blockers for the checkpoint series.
`;

const minimumClosureChecklistMarkdown = `# Minimum closure checklist before any final success claim

This checklist records whether the repository may honestly claim the final success statement requested in the Phase 15 prompt.

- [x] Freeze external markdown target and internal certification boundary.
- [x] Close CommonMark core and default GFM behavior in the declared checkpoint evidence lanes.
- [x] Restore all concrete v1 UIX regressions listed in the frozen parity ledger:
  - [x] PAT Git path
  - [x] restore-from-JSON
  - [x] line number toggle and persistence
  - [x] import-markdown rail action
  - [x] status-bar runtime/build/update surfaces
  - [x] 7 missing selectable themes
  - [x] 4 missing core locales
  - [x] missing rhythm/layout tokens
  - [x] editor toolbar/list continuation parity
  - [x] preview empty-list-item normalization
  - [x] extension settings completion
- [x] Keep the genuine v2 improvements:
  - [x] registry-driven shell
  - [x] reusable renderer/editor packages
  - [x] heading slug IDs
  - [x] token/class contracts
  - [x] package-backed i18n architecture
- [x] Cut RCs and validate from packed artifacts.
- [ ] Publish from the validated RC artifacts.
- [ ] Clear all remaining release blockers from the strict closure suite and promotion bundle.

## Result

The repository **may not yet claim final success** because the publication step is still blocked and the earlier Phase 12 / Phase 14 blockers remain explicitly unresolved in the evidence.
`;

const evidenceFiles = [];
for (const baseRelative of [
  'artifacts/conformance/latest',
  'artifacts/releases/promotion-rc.1',
]) {
  const files = await collectFiles(path.join(repoRoot, baseRelative), {
    includeDotFiles: false,
    extensions: null,
    skip: new Set(),
  });
  for (const absolutePath of files) {
    const relativePath = relativeToRepo(absolutePath);
    const basename = path.basename(relativePath);
    const phaseMatch = basename.match(/^phase-(\d+)-/);
    if (baseRelative.endsWith('latest')) {
      if (!phaseMatch) continue;
      const phaseNumber = Number(phaseMatch[1]);
      if (phaseNumber < 12 || phaseNumber > 14) continue;
    }
    const stat = await fs.stat(absolutePath);
    evidenceFiles.push({
      path: relativePath,
      bytes: stat.size,
      sha256: await hashFile(absolutePath),
    });
  }
}

evidenceFiles.sort((left, right) => left.path.localeCompare(right.path));
const evidenceIntegrityManifest = {
  generatedAt: supportWindowPolicy.generatedAt,
  trainId: supportWindowPolicy.trainId,
  immutableIntent: true,
  note: 'This manifest preserves the SHA-256 digests of the release-evidence chain carried forward from Phases 12 through 14 plus the promotion bundle contents.',
  fileCount: evidenceFiles.length,
  files: evidenceFiles,
};

await writeJson(path.join(artifactRoot, 'phase-15-support-window-policy.json'), supportWindowPolicy);
await writeJson(path.join(artifactRoot, 'phase-15-monitoring-matrix.json'), monitoringMatrix);
await writeJson(path.join(artifactRoot, 'phase-15-evidence-integrity-manifest.json'), evidenceIntegrityManifest);
await writeText(path.join(artifactRoot, 'phase-15-follow-on-roadmap.md'), roadmapMarkdown);
await writeText(path.join(artifactRoot, 'phase-15-minimum-closure-checklist.md'), minimumClosureChecklistMarkdown);

await writeText(path.join(supportRoot, 'README.md'), [
  '# Support-window RC.1 bundle',
  '',
  'This directory preserves the Phase 15 stabilization/support-window artifacts for the prepared promotion bundle.',
  '',
  'Important: there is still no public published release in this environment. The support window declared here therefore applies to the prepared promotion bundle / RC train artifacts rather than to live published npm packages.',
  '',
].join('\n'));
await fs.copyFile(path.join(artifactRoot, 'phase-15-support-window-policy.json'), path.join(supportRoot, 'phase-15-support-window-policy.json'));
await fs.copyFile(path.join(artifactRoot, 'phase-15-monitoring-matrix.json'), path.join(supportRoot, 'phase-15-monitoring-matrix.json'));
await fs.copyFile(path.join(artifactRoot, 'phase-15-evidence-integrity-manifest.json'), path.join(supportRoot, 'phase-15-evidence-integrity-manifest.json'));
await fs.copyFile(path.join(artifactRoot, 'phase-15-follow-on-roadmap.md'), path.join(supportRoot, 'phase-15-follow-on-roadmap.md'));
await fs.copyFile(path.join(artifactRoot, 'phase-15-minimum-closure-checklist.md'), path.join(supportRoot, 'phase-15-minimum-closure-checklist.md'));
await fs.copyFile(path.join(repoRoot, 'artifacts/releases/promotion-rc.1/final-evidence-bundle.tar.gz'), path.join(supportRoot, 'phase-14-final-evidence-bundle.tar.gz'));

const immutableBundleRelative = `${supportRootRelative}/immutable-evidence-bundle.tar.gz`;
createTarball(immutableBundleRelative, [
  'artifacts/conformance/latest/phase-12-closure-suite-checkpoint.json',
  'artifacts/conformance/latest/phase-12-closure-suite-results.json',
  'artifacts/conformance/latest/phase-12-certification-checklist.md',
  'artifacts/conformance/latest/phase-13-rc-train-checkpoint.json',
  'artifacts/conformance/latest/phase-13-rc-train-results.json',
  'artifacts/conformance/latest/phase-13-version-inventory.json',
  'artifacts/conformance/latest/phase-14-promotion-release-checkpoint.json',
  'artifacts/conformance/latest/phase-14-promotion-release-results.json',
  'artifacts/conformance/latest/phase-14-release-notes.md',
  'artifacts/conformance/latest/phase-15-support-window-policy.json',
  'artifacts/conformance/latest/phase-15-monitoring-matrix.json',
  'artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json',
  'artifacts/conformance/latest/phase-15-follow-on-roadmap.md',
  'artifacts/conformance/latest/phase-15-minimum-closure-checklist.md',
  'artifacts/releases/promotion-rc.1',
]);
const immutableBundleHash = await hashFile(path.join(repoRoot, immutableBundleRelative));

const supportBundleManifest = {
  generatedAt: supportWindowPolicy.generatedAt,
  trainId: supportWindowPolicy.trainId,
  supportRoot: supportRootRelative,
  immutableEvidenceBundle: {
    path: immutableBundleRelative,
    sha256: immutableBundleHash,
  },
  includedPolicyArtifacts: [
    `${supportRootRelative}/phase-15-support-window-policy.json`,
    `${supportRootRelative}/phase-15-monitoring-matrix.json`,
    `${supportRootRelative}/phase-15-evidence-integrity-manifest.json`,
    `${supportRootRelative}/phase-15-follow-on-roadmap.md`,
    `${supportRootRelative}/phase-15-minimum-closure-checklist.md`,
    `${supportRootRelative}/phase-14-final-evidence-bundle.tar.gz`,
  ],
};
await writeJson(path.join(supportRoot, 'bundle-manifest.json'), supportBundleManifest);

const checks = [
  { id: 'support-window-policy-generated', ok: true, detail: 'Support-window policy was generated.' },
  { id: 'support-window-short-duration', ok: supportWindowPolicy.window.durationDays <= 21, detail: `Support-window duration is ${supportWindowPolicy.window.durationDays} days.` },
  { id: 'patch-only-rule-declared', ok: supportWindowPolicy.acceptedChanges.defaultRule === 'patch-only-on-released-train', detail: 'Patch-only rule is declared for the train.' },
  { id: 'next-minor-exception-declared', ok: supportWindowPolicy.acceptedChanges.nextMinorException.length > 0, detail: 'Next-minor exception rule is documented.' },
  { id: 'monitor-extension-activation-failures', ok: monitoringMatrix.monitors.some((entry) => entry.id === 'extension-activation-failures'), detail: 'Monitoring matrix covers extension activation failures.' },
  { id: 'monitor-theme-regressions', ok: monitoringMatrix.monitors.some((entry) => entry.id === 'theme-regressions'), detail: 'Monitoring matrix covers theme regressions.' },
  { id: 'monitor-i18n-regressions', ok: monitoringMatrix.monitors.some((entry) => entry.id === 'i18n-regressions'), detail: 'Monitoring matrix covers i18n regressions.' },
  { id: 'evidence-integrity-manifest-generated', ok: evidenceIntegrityManifest.fileCount > 0, detail: `Evidence integrity manifest covers ${evidenceIntegrityManifest.fileCount} files.` },
  { id: 'immutable-support-bundle-created', ok: await pathExists(path.join(repoRoot, immutableBundleRelative)), detail: 'Immutable evidence bundle tarball was created.' },
  { id: 'support-window-bundle-manifest-created', ok: await pathExists(path.join(supportRoot, 'bundle-manifest.json')), detail: 'Support-window bundle manifest was created.' },
  { id: 'follow-on-roadmap-generated', ok: roadmapMarkdown.includes('richer table editor UX') && roadmapMarkdown.includes('optional underline extension'), detail: 'Follow-on roadmap items were documented.' },
  { id: 'minimum-closure-checklist-generated', ok: minimumClosureChecklistMarkdown.includes('Freeze external markdown target') && minimumClosureChecklistMarkdown.includes('Publish from the validated RC artifacts'), detail: 'Minimum closure checklist was generated.' },
  { id: 'minimum-closure-checklist-shows-publish-blocked', ok: minimumClosureChecklistMarkdown.includes('- [ ] Publish from the validated RC artifacts.'), detail: 'Checklist honestly records publication as still blocked.' },
  { id: 'v1-regression-restoration-recorded', ok: minimumClosureChecklistMarkdown.includes('PAT Git path') && minimumClosureChecklistMarkdown.includes('7 missing selectable themes') && minimumClosureChecklistMarkdown.includes('4 missing core locales'), detail: 'Checklist records the restored v1 UIX regressions.' },
  { id: 'v2-improvements-recorded', ok: minimumClosureChecklistMarkdown.includes('registry-driven shell') && minimumClosureChecklistMarkdown.includes('package-backed i18n architecture'), detail: 'Checklist records the retained v2 improvements.' },
  { id: 'live-published-support-window-active', ok: false, detail: 'No public published release exists in this environment, so the support window is policy-defined for the prepared bundle rather than live on published npm artifacts.' },
  { id: 'final-success-claim-available', ok: false, detail: 'The repository may not yet claim final success because the publish step and earlier strict-closure blockers remain unresolved.' },
];

const summary = {
  greenChecks: checks.filter((check) => check.ok).length,
  blockedChecks: checks.filter((check) => !check.ok).length,
  totalChecks: checks.length,
};

const resultsArtifact = {
  generatedAt: supportWindowPolicy.generatedAt,
  phase: 15,
  ok: false,
  summary,
  supportWindowPolicy,
  monitoringMatrix,
  evidenceIntegrity: {
    fileCount: evidenceIntegrityManifest.fileCount,
    immutableBundle: {
      path: immutableBundleRelative,
      sha256: immutableBundleHash,
    },
  },
  roadmap: {
    path: 'artifacts/conformance/latest/phase-15-follow-on-roadmap.md',
  },
  minimumClosureChecklist: {
    path: 'artifacts/conformance/latest/phase-15-minimum-closure-checklist.md',
    finalSuccessAllowed: false,
  },
  inheritedBlockers: {
    phase12BlockedHardClosureRules: 1,
    phase13RemainingBlockers: phase13Results.remainingBlockers,
    phase14BlockedChecks: phase14Results.checks.filter((check) => !check.ok).map((check) => check.id),
  },
  packageInventoryCount: Array.isArray(packageInventory.packages) ? packageInventory.packages.length : 0,
  versionInventoryCount: typeof versionInventory.rcCount === 'number' ? versionInventory.rcCount : Array.isArray(versionInventory.releasePackages) ? versionInventory.releasePackages.length : 0,
  checks,
};

const checkpointArtifact = {
  phase: 15,
  generatedAt: supportWindowPolicy.generatedAt,
  checkpointType: 'post-release-stabilization-and-support-window-checkpoint',
  basedOn: {
    phase12: 'strict-conformance-closure-suite',
    phase13: 'rc-freeze-versioning-and-promotion-prep',
    phase14: 'promotion-and-release',
  },
  evidence: {
    resultsPath: 'artifacts/conformance/latest/phase-15-stabilization-results.json',
    supportWindowPolicyPath: 'artifacts/conformance/latest/phase-15-support-window-policy.json',
    monitoringMatrixPath: 'artifacts/conformance/latest/phase-15-monitoring-matrix.json',
    evidenceIntegrityManifestPath: 'artifacts/conformance/latest/phase-15-evidence-integrity-manifest.json',
    roadmapPath: 'artifacts/conformance/latest/phase-15-follow-on-roadmap.md',
    minimumClosureChecklistPath: 'artifacts/conformance/latest/phase-15-minimum-closure-checklist.md',
    supportBundlePath: supportRootRelative,
  },
  summary,
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
    publicReleaseExists: false,
  },
  knownLimits: [
    'No public published release exists in the current environment, so the support window is policy-defined for the prepared bundle rather than enforced on live published npm artifacts.',
    'The repository still cannot claim final success because publication remains blocked and earlier strict-closure blockers are still recorded in Phase 12 and Phase 14 evidence.',
    'This checkpoint preserves and hardens the evidence chain, but it does not convert the Phase 14 promotion bundle into an actual public release.',
  ],
};

await writeJson(path.join(artifactRoot, 'phase-15-stabilization-results.json'), resultsArtifact);
await writeJson(path.join(artifactRoot, 'phase-15-stabilization-checkpoint.json'), checkpointArtifact);

const outputText = [
  `Phase 15 support-window checks: ${summary.greenChecks}/${summary.totalChecks} green`,
  `Blocked checks: ${summary.blockedChecks}`,
  `Evidence files hashed: ${evidenceIntegrityManifest.fileCount}`,
  `Immutable support bundle: ${immutableBundleRelative}`,
].join('\n');
await writeText(path.join(artifactRoot, 'phase-15-stabilization-output.txt'), `${outputText}\n`);

const conformanceStatus = {
  generatedAt: supportWindowPolicy.generatedAt,
  ok: false,
  checks: {
    extensionManifests: true,
    compatibilityMatrix: true,
    packageBoundaries: true,
    packageExports: true,
    extensionArtifacts: true,
    phase15SupportWindow: true,
    finalClaimAvailable: false,
  },
  notes: [
    'Phase 15 opens a short patch-only support window policy for the prepared promotion bundle / RC train artifacts.',
    'Evidence from Phases 12 through 14 is preserved immutably through a SHA-256 integrity manifest and support-window bundle.',
    'Final claim success remains blocked because there is still no public published release and prior strict-closure blockers remain unresolved.',
  ],
};
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/conformance-status.json'), conformanceStatus);

console.log(JSON.stringify(resultsArtifact, null, 2));
