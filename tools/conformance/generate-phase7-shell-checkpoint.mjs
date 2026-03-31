import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readJson, repoRoot, writeJson } from '../lib/workspace.mjs';

function runNode(relativeArgs) {
  return execFileSync(process.execPath, relativeArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const clientPackage = await readJson(path.join(repoRoot, 'apps/client/package.json'));
const shellParity = JSON.parse(runNode(['apps/client/tests/phase7-shell-parity.mjs', '--json']));

const footerText = loadText('apps/client/components/Chassis/Footer/Footer.tsx');
const actionRailText = loadText('apps/client/components/Chassis/ActionRail/ActionRail.tsx');
const actionRailHostText = loadText('apps/client/src/shell/ActionRailHost.tsx');
const appShellText = loadText('apps/client/src/shell/AppShell.tsx');
const coreRegistrationsText = loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const useAppText = loadText('apps/client/hooks/useApp.ts');
const splitViewPolicyText = loadText('apps/client/src/features/layout/splitViewPolicy.ts');
const editorPaneText = loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx');

const structuralAudit = {
  footer: {
    path: 'apps/client/components/Chassis/Footer/Footer.tsx',
    runtimeLabelPresent: footerText.includes("const runtimeLabel = `${shellLabel}: v${shellVersion}:${buildId}`"),
    updateBadgePresent: footerText.includes('UPDATE_READY'),
  },
  actionRail: {
    path: 'apps/client/components/Chassis/ActionRail/ActionRail.tsx',
    localizedAriaPropPresent: actionRailText.includes('readonly ariaLabel?: string;') && actionRailText.includes('aria-label={ariaLabel}'),
    ariaPressedPresent: actionRailText.includes('aria-pressed={active === undefined ? undefined : active}'),
  },
  actionRailHost: {
    path: 'apps/client/src/shell/ActionRailHost.tsx',
    localeAwareRerenderPresent: actionRailHostText.includes('services.i18n.subscribe') && actionRailHostText.includes('localeSnapshot.locale'),
  },
  appShell: {
    path: 'apps/client/src/shell/AppShell.tsx',
    hiddenImportInputPresent: appShellText.includes('accept=".md,.markdown,text/markdown"'),
    buildIdPropForwarded: appShellText.includes('buildId={APP_BUILD_ID}'),
  },
  coreRegistrations: {
    path: 'apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx',
    importCommandPresent: coreRegistrationsText.includes("id: 'core.import-markdown'"),
    importRailItemPresent: coreRegistrationsText.includes("commandId: 'core.import-markdown'"),
    cloudSyncRefreshEventPresent: coreRegistrationsText.includes('GIT_REPO_REFRESH_REQUEST_EVENT'),
  },
  useApp: {
    path: 'apps/client/hooks/useApp.ts',
    requestMarkdownImportActionPresent: useAppText.includes('requestMarkdownImport'),
    handleImportMarkdownActionPresent: useAppText.includes('handleImportMarkdown'),
  },
  splitViewPolicy: {
    path: 'apps/client/src/features/layout/splitViewPolicy.ts',
    helperPresent: splitViewPolicyText.includes('isSplitViewAllowedForViewport'),
    editorPaneUsesHelper: editorPaneText.includes('isSplitViewAllowedForViewport'),
  },
};

const structuralChecks = Object.values(structuralAudit).flatMap((group) => Object.entries(group)
  .filter(([key]) => key !== 'path')
  .map(([key, value]) => ({ key, value })));
const structuralPassed = structuralChecks.filter((entry) => entry.value === true).length;
const structuralFailed = structuralChecks.length - structuralPassed;

const resultsArtifact = {
  phase: 7,
  generatedAt: new Date().toISOString(),
  boundary: 'shell-parity-header-status-action-rail-layout',
  commands: {
    shellParity: 'node apps/client/tests/phase7-shell-parity.mjs --json',
    checkpointGenerator: 'node tools/conformance/generate-phase7-shell-checkpoint.mjs',
  },
  results: {
    shellParity,
  },
  aggregate: {
    totalChecks: shellParity.total,
    totalPassed: shellParity.passed,
    totalFailed: shellParity.failed,
    structuralAudit: {
      total: structuralChecks.length,
      passed: structuralPassed,
      failed: structuralFailed,
    },
  },
  structuralAudit,
};

const checkpointArtifact = {
  phase: 7,
  generatedAt: new Date().toISOString(),
  checkpointType: 'shell-parity-checkpoint',
  packages: {
    client: {
      name: clientPackage.name,
      version: clientPackage.version,
      path: 'apps/client',
    },
  },
  evidence: {
    shellParityCommand: 'node apps/client/tests/phase7-shell-parity.mjs --json',
    generatorCommand: 'node tools/conformance/generate-phase7-shell-checkpoint.mjs',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-7-shell-parity-results.json',
    auditedPaths: [
      structuralAudit.footer.path,
      structuralAudit.actionRail.path,
      structuralAudit.actionRailHost.path,
      structuralAudit.appShell.path,
      structuralAudit.coreRegistrations.path,
      structuralAudit.useApp.path,
      structuralAudit.splitViewPolicy.path,
    ],
  },
  summary: {
    totalChecks: shellParity.total,
    passedChecks: shellParity.passed,
    failedChecks: shellParity.failed,
    structuralAuditChecks: structuralChecks.length,
    structuralAuditPassed: structuralPassed,
    structuralAuditFailed: structuralFailed,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    'status bar runtime shell label, build identifier, and update-ready badge parity',
    'import-markdown action-rail button, command registration, and hidden-file-input shell bridge',
    'localized action-rail navigation aria-label with locale-aware host rerendering',
    'v1 mobile-landscape split-view heuristic parity through a reusable split-view policy helper',
    'cloud-sync refresh-event dispatch restored at the shell command surface',
  ],
  knownLimits: [
    'This checkpoint does not yet close the remaining Git PAT, restore-from-JSON, theme exposure, language-selection, or extension-settings gaps.',
    'This checkpoint improves shell parity but does not yet complete final repository-wide certification or full frozen-target Markdown corpus closure.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-7-shell-parity-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-7-shell-parity-checkpoint.json'), checkpointArtifact);

console.log('phase 7 shell parity checkpoint artifacts generated');
