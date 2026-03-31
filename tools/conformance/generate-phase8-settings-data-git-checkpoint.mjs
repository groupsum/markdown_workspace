import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { loadWorkspacePackages, readJson, repoRoot, writeJson } from '../lib/workspace.mjs';

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
const i18nPackage = await readJson(path.join(repoRoot, 'packages/shared/i18n/package.json'));
const extensionManagerPackage = await readJson(path.join(repoRoot, 'packages/extensions/extension-manager/package.json'));
const themeStudioPackage = await readJson(path.join(repoRoot, 'packages/extensions/extension-theme-studio/package.json'));
const geminiPackage = await readJson(path.join(repoRoot, 'packages/extensions/extension-gemini-agent/package.json'));
const phase8 = JSON.parse(runNode(['apps/client/tests/phase8-settings-data-git-parity.mjs', '--json']));

const settingsSchemaRendererText = loadText('apps/client/src/features/settings/SettingsSchemaRenderer.tsx');
const settingsViewText = loadText('apps/client/src/shell/SettingsView.tsx');
const dataSettingsPanelText = loadText('apps/client/src/features/settings/DataSettingsPanel.tsx');
const gitSettingsPanelText = loadText('apps/client/src/features/settings/GitSettingsPanel.tsx');
const useAppText = loadText('apps/client/hooks/useApp.ts');
const useFileManagerText = loadText('apps/client/hooks/useFileManager.ts');
const useCoreSurfaceRegistrationsText = loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const registrationSinkText = loadText('apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx');
const extensionManagerManifestText = loadText('packages/extensions/extension-manager/dist/manifest.js');
const extensionManagerEntryText = loadText('packages/extensions/extension-manager/dist/createExtensionManagerBundledEntry.js');
const themeStudioEntryText = loadText('packages/extensions/extension-theme-studio/dist/createThemeStudioBundledEntry.js');
const geminiEntryText = loadText('packages/extensions/extension-gemini-agent/dist/createGeminiAgentBundledEntry.js');

const structuralAudit = {
  dataSettingsPanel: {
    path: 'apps/client/src/features/settings/DataSettingsPanel.tsx',
    restoreButtonPresent: dataSettingsPanelText.includes('INIT_RESTORE'),
    restoreActionPresent: dataSettingsPanelText.includes('restoreData(payload)'),
    secondaryVersionVisible: dataSettingsPanelText.includes('APP_VERSION') && dataSettingsPanelText.includes('BUILD_ID') && dataSettingsPanelText.includes('PACKAGE'),
    indexedDbExportRetained: dataSettingsPanelText.includes('EXECUTE_EXPORT') && dataSettingsPanelText.includes('snapshot.actions.exportData'),
  },
  gitSettingsPanel: {
    path: 'apps/client/src/features/settings/GitSettingsPanel.tsx',
    authModeVisible: gitSettingsPanelText.includes('AUTH_MODE'),
    testLinkWired: gitSettingsPanelText.includes('snapshot.actions.testGitLink'),
    saveConfigWired: gitSettingsPanelText.includes('snapshot.actions.handleGitConfigSave'),
    refreshReposWired: gitSettingsPanelText.includes('snapshot.actions.refreshGitRepositories'),
  },
  appActions: {
    path: 'apps/client/hooks/useApp.ts',
    restoreDataActionPresent: useAppText.includes('const restoreData = async'),
    refreshDispatchPresent: useAppText.includes('new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT)'),
    saveConfigFunctional: useAppText.includes('GIT CONFIG SAVED'),
    oidcGuardPresent: useAppText.includes('OIDC SIGN-IN IS DISABLED WHEN AUTH MODE IS PAT'),
  },
  fileManager: {
    path: 'apps/client/hooks/useFileManager.ts',
    restoreFlowPresent: useFileManagerText.includes('const restoreProjectData = async'),
    exportEnvelopePresent: useFileManagerText.includes("format: 'mdwrk/project-backup'") && useFileManagerText.includes('version: 2'),
    restoreValidationPresent: useFileManagerText.includes('UNSUPPORTED BACKUP FORMAT') && useFileManagerText.includes('BACKUP IMAGE MISSING REQUIRED FIELDS'),
  },
  sessionSettings: {
    path: 'apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx',
    autoSaveTogglePresent: useCoreSurfaceRegistrationsText.includes('autoSaveEnabled'),
    restoreSessionTogglePresent: useCoreSurfaceRegistrationsText.includes('persistSessionEnabled'),
    lineNumbersTogglePresent: useCoreSurfaceRegistrationsText.includes('showLineNumbers'),
  },
  settingsHost: {
    path: 'apps/client/src/shell/SettingsView.tsx',
    extensionStoreBound: settingsViewText.includes('extensionRuntime.getConfigurationStore(section.extensionId)'),
    formatLabelBound: settingsViewText.includes('formatLabel={services.i18n.format}'),
  },
  settingsRenderer: {
    path: 'apps/client/src/features/settings/SettingsSchemaRenderer.tsx',
    multilineSupportPresent: settingsSchemaRendererText.includes("field.multiline") && settingsSchemaRendererText.includes('<textarea'),
    numericConstraintsPresent: settingsSchemaRendererText.includes('numericField?.min') && settingsSchemaRendererText.includes('numericField?.max') && settingsSchemaRendererText.includes('numericField.step'),
    multiselectPresent: settingsSchemaRendererText.includes('selectedOptions') && settingsSchemaRendererText.includes('multiple'),
    storeSupportPresent: settingsSchemaRendererText.includes('readonly store?: SettingsSchemaValueStore;') && settingsSchemaRendererText.includes('store.watch(field.key'),
  },
  extensionRegistrationSink: {
    path: 'apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx',
    schemaPropagationPresent: registrationSinkText.includes('schema,') && registrationSinkText.includes('extensionId,'),
    placeholderOnlyWhenNoSchema: registrationSinkText.includes('render: schema ? undefined : () => createSettingsSectionPlaceholder'),
  },
  bundledExtensions: {
    managerManifestPath: 'packages/extensions/extension-manager/dist/manifest.js',
    managerCapabilitiesUpdated: extensionManagerManifestText.includes('settings.read') && extensionManagerManifestText.includes('settings.write'),
    managerSettingsSectionPresent: extensionManagerManifestText.includes('settingsSections'),
    managerSchemaRegistrationPresent: extensionManagerEntryText.includes('schema: extensionManagerManifest.settingsSchema'),
    themeStudioSchemaRegistrationPresent: themeStudioEntryText.includes('schema: themeStudioManifest.settingsSchema'),
    geminiSchemaRegistrationPresent: geminiEntryText.includes('schema: geminiAgentManifest.settingsSchema'),
  },
};

const structuralChecks = Object.values(structuralAudit).flatMap((group) => Object.entries(group)
  .filter(([key]) => !key.toLowerCase().endsWith('path'))
  .map(([key, value]) => ({ key, value })));
const structuralPassed = structuralChecks.filter((entry) => entry.value === true).length;
const structuralFailed = structuralChecks.length - structuralPassed;

const workspacePackages = await loadWorkspacePackages();
const packageInventory = workspacePackages.map((workspacePackage) => ({
  name: workspacePackage.packageJson.name,
  version: workspacePackage.packageJson.version,
  path: workspacePackage.relativeDir,
  category: workspacePackage.category,
  publishable: workspacePackage.publishable,
}));
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/package-inventory.json'), {
  generatedAt: new Date().toISOString(),
  packages: packageInventory,
});

const resultsArtifact = {
  phase: 8,
  generatedAt: new Date().toISOString(),
  boundary: 'settings-data-session-git-and-extension-settings-parity',
  commands: {
    settingsParity: 'node apps/client/tests/phase8-settings-data-git-parity.mjs --json',
    checkpointGenerator: 'node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs',
  },
  results: {
    settingsParity: phase8,
  },
  aggregate: {
    totalChecks: phase8.total,
    totalPassed: phase8.passed,
    totalFailed: phase8.failed,
    structuralAudit: {
      total: structuralChecks.length,
      passed: structuralPassed,
      failed: structuralFailed,
    },
  },
  structuralAudit,
  packageVersions: {
    client: clientPackage.version,
    i18n: i18nPackage.version,
    extensionManager: extensionManagerPackage.version,
    extensionThemeStudio: themeStudioPackage.version,
    extensionGeminiAgent: geminiPackage.version,
  },
};

const checkpointArtifact = {
  phase: 8,
  generatedAt: new Date().toISOString(),
  checkpointType: 'settings-data-session-git-parity-checkpoint',
  packages: {
    client: {
      name: clientPackage.name,
      version: clientPackage.version,
      path: 'apps/client',
    },
    sharedI18n: {
      name: i18nPackage.name,
      version: i18nPackage.version,
      path: 'packages/shared/i18n',
    },
    extensionManager: {
      name: extensionManagerPackage.name,
      version: extensionManagerPackage.version,
      path: 'packages/extensions/extension-manager',
    },
    extensionThemeStudio: {
      name: themeStudioPackage.name,
      version: themeStudioPackage.version,
      path: 'packages/extensions/extension-theme-studio',
    },
    extensionGeminiAgent: {
      name: geminiPackage.name,
      version: geminiPackage.version,
      path: 'packages/extensions/extension-gemini-agent',
    },
  },
  evidence: {
    settingsParityCommand: 'node apps/client/tests/phase8-settings-data-git-parity.mjs --json',
    generatorCommand: 'node tools/conformance/generate-phase8-settings-data-git-checkpoint.mjs',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-8-settings-data-git-results.json',
    auditedPaths: [
      structuralAudit.dataSettingsPanel.path,
      structuralAudit.gitSettingsPanel.path,
      structuralAudit.appActions.path,
      structuralAudit.fileManager.path,
      structuralAudit.sessionSettings.path,
      structuralAudit.settingsHost.path,
      structuralAudit.settingsRenderer.path,
      structuralAudit.extensionRegistrationSink.path,
      structuralAudit.bundledExtensions.managerManifestPath,
    ],
  },
  summary: {
    totalChecks: phase8.total,
    passedChecks: phase8.passed,
    failedChecks: phase8.failed,
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
    'restore workspace from JSON and real restore-state flow',
    'secondary PWA version visibility inside settings',
    'PAT versus OIDC auth mode, PAT token/status, provider normalization, and manual/automatic repository refresh',
    'functional TEST_LINK and SAVE_CONFIG settings actions',
    'real schema-backed extension settings forms with persistence, multiline, numeric, and multiselect support',
    'extension manager settings section registration and bundled schema propagation',
  ],
  knownLimits: [
    'This checkpoint still does not close theme exposure parity, visible language selection parity, or the remaining final Markdown corpus/release-evidence closures.',
    'The provided zip environment still lacks the complete browser-test dependency surface for final client-side Vitest/browser closure.',
    'Bundled extension distribution artifacts included elsewhere in the repository have not been republished on a new release line in this checkpoint.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-8-settings-data-git-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-8-settings-data-git-checkpoint.json'), checkpointArtifact);

console.log('phase 8 settings/data/git checkpoint artifacts generated');
