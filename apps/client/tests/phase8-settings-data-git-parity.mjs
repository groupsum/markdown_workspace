import path from 'node:path';
import { readFileSync } from 'node:fs';

const repoRoot = path.resolve(new URL('../../..', import.meta.url).pathname);

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function loadJson(relativePath) {
  return JSON.parse(loadText(relativePath));
}

const typesText = loadText('apps/client/types.ts');
const gitConfigServiceText = loadText('apps/client/services/gitConfig.ts');
const useAppText = loadText('apps/client/hooks/useApp.ts');
const useFileManagerText = loadText('apps/client/hooks/useFileManager.ts');
const oidcSelectorText = loadText('apps/client/components/Modals/OidcSignInSelector.tsx');
const repoAutocompleteText = loadText('apps/client/components/Modals/RepositoryAutocomplete.tsx');
const gitSettingsPanelText = loadText('apps/client/src/features/settings/GitSettingsPanel.tsx');
const dataSettingsPanelText = loadText('apps/client/src/features/settings/DataSettingsPanel.tsx');
const coreRegistrationsText = loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const settingsViewText = loadText('apps/client/src/shell/SettingsView.tsx');
const settingsSchemaRendererText = loadText('apps/client/src/features/settings/SettingsSchemaRenderer.tsx');
const registrationSinkText = loadText('apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx');
const extensionManagerManifestText = loadText('packages/extensions/extension-manager/src/manifest.ts');
const extensionManagerEntryText = loadText('packages/extensions/extension-manager/src/createExtensionManagerBundledEntry.tsx');
const themeStudioEntryText = loadText('packages/extensions/extension-theme-studio/src/createThemeStudioBundledEntry.tsx');
const geminiEntryText = loadText('packages/extensions/extension-gemini-agent/src/createGeminiAgentBundledEntry.tsx');

const packageVersions = {
  client: loadJson('apps/client/package.json').version,
  extensionManager: loadJson('packages/extensions/extension-manager/package.json').version,
  extensionThemeStudio: loadJson('packages/extensions/extension-theme-studio/package.json').version,
  extensionGeminiAgent: loadJson('packages/extensions/extension-gemini-agent/package.json').version,
  i18n: loadJson('packages/shared/i18n/package.json').version,
};

const nodeModuleVersions = {
  extensionManager: loadJson('node_modules/@mdwrk/extension-manager/package.json').version,
  extensionThemeStudio: loadJson('node_modules/@mdwrk/extension-theme-studio/package.json').version,
  extensionGeminiAgent: loadJson('node_modules/@mdwrk/extension-gemini-agent/package.json').version,
  i18n: loadJson('node_modules/@mdwrk/i18n/package.json').version,
};

const nodeModuleExtensionManagerManifestText = loadText('node_modules/@mdwrk/extension-manager/dist/manifest.js');
const nodeModuleExtensionManagerEntryText = loadText('node_modules/@mdwrk/extension-manager/dist/createExtensionManagerBundledEntry.js');
const nodeModuleThemeStudioEntryText = loadText('node_modules/@mdwrk/extension-theme-studio/dist/createThemeStudioBundledEntry.js');
const nodeModuleGeminiEntryText = loadText('node_modules/@mdwrk/extension-gemini-agent/dist/createGeminiAgentBundledEntry.js');

const checks = [
  {
    id: 'git.types.auth-mode-and-pat-token',
    pass: typesText.includes("authMode: AuthMode;") && typesText.includes("patToken: string;") && typesText.includes("export type AuthMode = 'oidc' | 'pat';"),
  },
  {
    id: 'git.service.provider-normalization',
    pass: gitConfigServiceText.includes('inferPatProvider')
      && gitConfigServiceText.includes('normalizeRepositoryUrl')
      && gitConfigServiceText.includes('PROVIDER_REPO_HOST')
      && gitConfigServiceText.includes("gitConfig.authMode === 'pat'"),
  },
  {
    id: 'git.settings.auth-mode-selector',
    pass: oidcSelectorText.includes("core.settings.git.auth-mode")
      && oidcSelectorText.includes("value=\"pat\"")
      && oidcSelectorText.includes("value=\"oidc\""),
  },
  {
    id: 'git.settings.pat-status-and-input',
    pass: oidcSelectorText.includes('TOKEN_READY')
      && oidcSelectorText.includes('TOKEN_REQUIRED')
      && oidcSelectorText.includes('PAT TOKEN')
      && oidcSelectorText.includes("type=\"password\""),
  },
  {
    id: 'git.settings.repo-autocomplete-refresh-and-timestamp',
    pass: repoAutocompleteText.includes('GIT_REPO_REFRESH_REQUEST_EVENT')
      && repoAutocompleteText.includes('UPDATED {new Date(lastUpdatedAt).toLocaleTimeString()}')
      && repoAutocompleteText.includes('setLastUpdatedAt'),
  },
  {
    id: 'git.settings.pat-shorthand-and-create-repo',
    pass: repoAutocompleteText.includes('owner/repo')
      && repoAutocompleteText.includes('createRepo')
      && repoAutocompleteText.includes('selectedRepoHost'),
  },
  {
    id: 'git.settings.panel-wired-actions',
    pass: gitSettingsPanelText.includes('TEST_LINK')
      && gitSettingsPanelText.includes('REFRESH_REPOS')
      && gitSettingsPanelText.includes('SAVE_CONFIG')
      && gitSettingsPanelText.includes('handleGitConfigSave')
      && gitSettingsPanelText.includes('refreshGitRepositories')
      && gitSettingsPanelText.includes('testGitLink'),
  },
  {
    id: 'git.useapp-functional-actions',
    pass: useAppText.includes('handleGitConfigUpdate')
      && useAppText.includes('handleGitConfigSave')
      && useAppText.includes('refreshGitRepositories')
      && useAppText.includes('testGitLink')
      && useAppText.includes('GIT CONFIG SAVED')
      && useAppText.includes('LINK VERIFIED'),
  },
  {
    id: 'git.useapp-refresh-dispatch-and-oidc-guard',
    pass: useAppText.includes('new CustomEvent(GIT_REPO_REFRESH_REQUEST_EVENT)')
      && useAppText.includes('OIDC SIGN-IN IS DISABLED WHEN AUTH MODE IS PAT'),
  },
  {
    id: 'data.settings.restore-ui',
    pass: dataSettingsPanelText.includes('RESTORE_IMAGE')
      && dataSettingsPanelText.includes('INIT_RESTORE')
      && dataSettingsPanelText.includes('restoreData(payload)'),
  },
  {
    id: 'data.settings.secondary-version-display',
    pass: dataSettingsPanelText.includes('APP_VERSION')
      && dataSettingsPanelText.includes('BUILD_ID')
      && dataSettingsPanelText.includes('PACKAGE'),
  },
  {
    id: 'data.file-manager.export-envelope',
    pass: useFileManagerText.includes("format: 'mdwrk/project-backup'")
      && useFileManagerText.includes('version: 2')
      && useFileManagerText.includes('exportedAt'),
  },
  {
    id: 'data.file-manager.restore-flow',
    pass: useFileManagerText.includes('const restoreProjectData = async')
      && useFileManagerText.includes('UNSUPPORTED BACKUP FORMAT')
      && useFileManagerText.includes('RESTORE COMPLETE'),
  },
  {
    id: 'data.useapp.restore-open-file-flow',
    pass: useAppText.includes('const restoreData = async')
      && useAppText.includes('tabs.resetTabs()')
      && useAppText.includes("'readme.md'")
      && useAppText.includes('restoreProjectData(payload)'),
  },
  {
    id: 'session.settings.autosave-toggle',
    pass: coreRegistrationsText.includes('autoSaveEnabled') && coreRegistrationsText.includes('setAutoSaveEnabled'),
  },
  {
    id: 'session.settings.persist-session-toggle',
    pass: coreRegistrationsText.includes('persistSessionEnabled') && coreRegistrationsText.includes('setPersistSessionEnabled'),
  },
  {
    id: 'session.settings.line-numbers-toggle',
    pass: coreRegistrationsText.includes('showLineNumbers') && coreRegistrationsText.includes('setShowLineNumbers'),
  },
  {
    id: 'extension.settings.store-backed-rendering',
    pass: settingsViewText.includes('extensionRuntime.getConfigurationStore(section.extensionId)')
      && settingsViewText.includes('store={store}')
      && settingsViewText.includes('formatLabel={services.i18n.format}'),
  },
  {
    id: 'extension.settings.renderer.multiline',
    pass: settingsSchemaRendererText.includes("field.multiline")
      && settingsSchemaRendererText.includes('<textarea')
      && settingsSchemaRendererText.includes("style={{ minHeight: 96, resize: 'vertical' }}"),
  },
  {
    id: 'extension.settings.renderer.multiselect',
    pass: settingsSchemaRendererText.includes("field.kind === 'multiselect'")
      && settingsSchemaRendererText.includes('multiple')
      && settingsSchemaRendererText.includes('selectedOptions'),
  },
  {
    id: 'extension.settings.renderer.numeric-constraints',
    pass: settingsSchemaRendererText.includes('numericField?.min')
      && settingsSchemaRendererText.includes('numericField?.max')
      && settingsSchemaRendererText.includes('numericField.step'),
  },
  {
    id: 'extension.settings.registration-sink',
    pass: registrationSinkText.includes('extensionId')
      && registrationSinkText.includes('schema,')
      && registrationSinkText.includes("panel: 'extensions'"),
  },
  {
    id: 'extension.manager.manifest-settings-capability-and-section',
    pass: extensionManagerManifestText.includes('settings.read')
      && extensionManagerManifestText.includes('settings.write')
      && extensionManagerManifestText.includes('settingsSections'),
  },
  {
    id: 'extension.manager.bundled-schema-registration',
    pass: extensionManagerEntryText.includes('schemaPath:') && extensionManagerEntryText.includes('extensionManagerManifest.settingsSchema'),
  },
  {
    id: 'extension.theme-studio.bundled-schema-registration',
    pass: themeStudioEntryText.includes('schemaPath: "manifest.settingsSchema"') && themeStudioEntryText.includes('themeStudioManifest.settingsSchema'),
  },
  {
    id: 'extension.gemini.bundled-schema-registration',
    pass: geminiEntryText.includes('schemaPath: "manifest.settingsSchema"') && geminiEntryText.includes('geminiAgentManifest.settingsSchema'),
  },
  {
    id: 'versions.client',
    pass: packageVersions.client.startsWith('1.4.0'),
  },
  {
    id: 'versions.extension-manager',
    pass: packageVersions.extensionManager.startsWith('1.1.0') && nodeModuleVersions.extensionManager.startsWith('1.1.0'),
  },
  {
    id: 'versions.extension-theme-studio',
    pass: packageVersions.extensionThemeStudio.startsWith('1.1.0') && nodeModuleVersions.extensionThemeStudio.startsWith('1.1.0'),
  },
  {
    id: 'versions.extension-gemini-agent',
    pass: packageVersions.extensionGeminiAgent.startsWith('1.1.0') && nodeModuleVersions.extensionGeminiAgent.startsWith('1.1.0'),
  },
  {
    id: 'versions.i18n',
    pass: packageVersions.i18n.startsWith('1.1.0') && nodeModuleVersions.i18n.startsWith('1.1.0'),
  },
  {
    id: 'node-modules.extension-manager.settings-updated',
    pass: nodeModuleExtensionManagerManifestText.includes('settings.read')
      && nodeModuleExtensionManagerManifestText.includes('settingsSections')
      && nodeModuleExtensionManagerEntryText.includes('schema: extensionManagerManifest.settingsSchema'),
  },
  {
    id: 'node-modules.theme-studio.settings-updated',
    pass: nodeModuleThemeStudioEntryText.includes('schema: themeStudioManifest.settingsSchema'),
  },
  {
    id: 'node-modules.gemini.settings-updated',
    pass: nodeModuleGeminiEntryText.includes('schema: geminiAgentManifest.settingsSchema'),
  },
];

const result = {
  phase: 8,
  generatedAt: new Date().toISOString(),
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
  packageVersions,
  nodeModuleVersions,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2));
} else {
  console.log(`phase8 settings/data/git parity: ${result.passed}/${result.total} passed`);
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
}
