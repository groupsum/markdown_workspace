import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { ensureDir, repoRoot, writeJson, writeText } from '../lib/workspace.mjs';

const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');

function runCommand(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

async function main() {
  await ensureDir(artifactRoot);

  const i18nTestOutput = runCommand('npm', ['run', 'test', '-w', '@mdwrk/i18n']);
  await writeText(path.join(artifactRoot, 'phase-10-i18n-test-output.txt'), i18nTestOutput);

  const nodeOutput = runCommand(process.execPath, ['apps/client/tests/phase10-i18n-parity.mjs']);
  await writeText(path.join(artifactRoot, 'phase-10-i18n-parity-output.txt'), nodeOutput);

  const nodeJson = runCommand(process.execPath, ['apps/client/tests/phase10-i18n-parity.mjs', '--json']);
  const phase10NodeResults = JSON.parse(nodeJson);
  await writeJson(path.join(artifactRoot, 'phase-10-i18n-parity-node-results.json'), phase10NodeResults);

  const coreShellText = read('packages/shared/i18n/src/core-shell.ts');
  const clientI18nServiceText = read('apps/client/src/features/i18n/clientI18nService.ts');
  const runtimeContextText = read('apps/client/src/app/runtime/ClientRuntimeContext.tsx');
  const languageSelectorText = read('apps/client/src/features/i18n/LanguageSelector.tsx');
  const languagePanelText = read('apps/client/src/features/i18n/LanguageSettingsPanel.tsx');
  const projectSelectorText = read('apps/client/components/Project/ProjectSelector.tsx');
  const headerText = read('apps/client/components/Chassis/Header/Header.tsx');
  const footerText = read('apps/client/components/Chassis/Footer/Footer.tsx');
  const settingsModalText = read('apps/client/components/Modals/SettingsModal.tsx');
  const actionRailHostText = read('apps/client/src/shell/ActionRailHost.tsx');
  const useCoreSurfaceText = read('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
  const dataSettingsText = read('apps/client/src/features/settings/DataSettingsPanel.tsx');
  const gitSettingsText = read('apps/client/src/features/settings/GitSettingsPanel.tsx');
  const repoAutocompleteText = read('apps/client/components/Modals/RepositoryAutocomplete.tsx');
  const oidcSelectorText = read('apps/client/components/Modals/OidcSignInSelector.tsx');
  const markdownProfilesText = read('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx');
  const registrationSinkText = read('apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx');
  const settingsSchemaRendererText = read('apps/client/src/features/settings/SettingsSchemaRenderer.tsx');
  const settingsViewText = read('apps/client/src/shell/SettingsView.tsx');
  const i18nPackageJson = JSON.parse(read('packages/shared/i18n/package.json'));
  const clientPackageJson = JSON.parse(read('apps/client/package.json'));
  const extensionManagerPackageJson = JSON.parse(read('packages/extensions/extension-manager/package.json'));
  const geminiPackageJson = JSON.parse(read('packages/extensions/extension-gemini-agent/package.json'));
  const themeStudioPackageJson = JSON.parse(read('packages/extensions/extension-theme-studio/package.json'));

  const structuralAudit = {
    sharedI18n: {
      coreLocalesRestored: coreShellText.includes("id: 'es'") && coreShellText.includes("id: 'fr'") && coreShellText.includes("id: 'pt'") && coreShellText.includes("id: 'ur'"),
      coreLoaderExported: coreShellText.includes('CORE_SHELL_LOCALE_LOADER_DEFINITION'),
      packageVersionPinned: i18nPackageJson.version === '1.1.0',
    },
    clientLocaleService: {
      persistenceKeyPresent: clientI18nServiceText.includes("CORE_LOCALE_STORAGE_KEY = 'mdwrk.core.locale'"),
      persistedSetLocale: clientI18nServiceText.includes('persistLocale(registry.getLocale());'),
      runtimeCoreLoaderRegistered: runtimeContextText.includes("registerCatalogLoader('core', CORE_SHELL_LOCALE_LOADER_DEFINITION)"),
      runtimeRestoresStoredLocale: runtimeContextText.includes("settingsStore.get<string>('core.locale')") || runtimeContextText.includes("settingsStore.get('core.locale')"),
    },
    visibleLanguageUx: {
      languageSelectorComponentPresent: languageSelectorText.includes('CORE_SHELL_SUPPORTED_LOCALES') && languageSelectorText.includes("services.settingsStore.set('core.locale'"),
      settingsPanelPresent: languagePanelText.includes('Select the interface language') && languagePanelText.includes('<LanguageSelector />'),
      projectSelectorEntryPresent: projectSelectorText.includes('<LanguageSelector compact />'),
      appVersionPinned: clientPackageJson.version === '1.4.0',
    },
    catalogDrivenShellStrings: {
      headerUsesI18n: headerText.includes('useClientI18n') && headerText.includes('core.header.switch-project.title'),
      footerUsesI18n: footerText.includes('useClientI18n') && footerText.includes('core.status.storage.persistent'),
      settingsModalUsesI18n: settingsModalText.includes('useClientI18n') && settingsModalText.includes('core.settings.modal.exit'),
      actionRailNavLocalized: actionRailHostText.includes('core.action-rail.aria-label'),
      coreSettingsRegistryLanguageSection: useCoreSurfaceText.includes("id: 'core.settings.language'") && useCoreSurfaceText.includes('<LanguageSettingsPanel />'),
    },
    settingsPanelsCoverage: {
      dataSettingsLocalized: dataSettingsText.includes('useClientI18n') && dataSettingsText.includes('core.settings.data.pwa.title'),
      gitSettingsLocalized: gitSettingsText.includes('useClientI18n') && gitSettingsText.includes('core.settings.git.save-config'),
      oidcSelectorLocalized: oidcSelectorText.includes('useClientI18n') && oidcSelectorText.includes('core.settings.git.auth-mode'),
      repoAutocompleteLocalized: repoAutocompleteText.includes('useClientI18n') && repoAutocompleteText.includes('core.settings.git.loading-repositories'),
      markdownProfilesLocalized: markdownProfilesText.includes('useClientI18n') && markdownProfilesText.includes('core.settings.markdown-profiles.default-profile'),
    },
    extensionSettingsCoverage: {
      rendererSupportsLocalizedLabels: settingsSchemaRendererText.includes('formatLabel'),
      settingsViewPassesFormatLabel: settingsViewText.includes('formatLabel={services.i18n.format}'),
      runtimeRegistrationSupportsSchemaSections: registrationSinkText.includes('schema') && registrationSinkText.includes('render: schema ? undefined'),
      bundledExtensionCatalogsPresent:
        read('packages/extensions/extension-manager/src/locales/en.ts').length > 0 &&
        read('packages/extensions/extension-manager/src/locales/es.ts').length > 0 &&
        read('packages/extensions/extension-gemini-agent/src/locales/en.ts').length > 0 &&
        read('packages/extensions/extension-gemini-agent/src/locales/es.ts').length > 0 &&
        read('packages/extensions/extension-theme-studio/src/locales/en.ts').length > 0 &&
        read('packages/extensions/extension-theme-studio/src/locales/es.ts').length > 0,
      bundledExtensionVersionsStable:
        extensionManagerPackageJson.version === '1.1.0' &&
        geminiPackageJson.version === '1.1.0' &&
        themeStudioPackageJson.version === '1.1.0',
    },
  };

  const structuralChecks = Object.values(structuralAudit).flatMap((group) =>
    Object.entries(group).map(([key, value]) => ({ key, value })),
  );

  const structuralPassed = structuralChecks.filter((entry) => entry.value === true).length;
  const structuralFailed = structuralChecks.length - structuralPassed;

  const resultsArtifact = {
    phase: 10,
    generatedAt: new Date().toISOString(),
    boundary: 'i18n-language-ux-and-catalog-coverage',
    commands: {
      sharedI18nTest: 'npm run test -w @mdwrk/i18n',
      phase10I18nParity: 'node apps/client/tests/phase10-i18n-parity.mjs --json',
      checkpointGenerator: 'node tools/conformance/generate-phase10-i18n-checkpoint.mjs',
    },
    results: {
      sharedI18nTest: {
        ok: i18nTestOutput.includes('shared-i18n smoke: ok'),
        artifactPath: 'artifacts/conformance/latest/phase-10-i18n-test-output.txt',
      },
      phase10NodeResults,
    },
    aggregate: {
      totalChecks: phase10NodeResults.total,
      totalPassed: phase10NodeResults.passed,
      totalFailed: phase10NodeResults.failed,
      structuralAudit: {
        total: structuralChecks.length,
        passed: structuralPassed,
        failed: structuralFailed,
      },
    },
    packageVersions: {
      i18n: i18nPackageJson.version,
      client: clientPackageJson.version,
      extensionManager: extensionManagerPackageJson.version,
      geminiAgent: geminiPackageJson.version,
      themeStudio: themeStudioPackageJson.version,
    },
    structuralAudit,
  };

  const checkpointArtifact = {
    phase: 10,
    generatedAt: resultsArtifact.generatedAt,
    checkpointType: 'i18n-language-ux-and-catalog-coverage-checkpoint',
    packages: {
      i18n: {
        name: i18nPackageJson.name,
        version: i18nPackageJson.version,
        path: 'packages/shared/i18n',
      },
      client: {
        name: clientPackageJson.name,
        version: clientPackageJson.version,
        path: 'apps/client',
      },
    },
    evidence: {
      resultsArtifactPath: 'artifacts/conformance/latest/phase-10-i18n-results.json',
      nodeResultsArtifactPath: 'artifacts/conformance/latest/phase-10-i18n-parity-node-results.json',
      humanReadableOutputPath: 'artifacts/conformance/latest/phase-10-i18n-parity-output.txt',
      i18nTestOutputPath: 'artifacts/conformance/latest/phase-10-i18n-test-output.txt',
      auditedPaths: [
        'packages/shared/i18n/src/core-shell.ts',
        'apps/client/src/features/i18n/clientI18nService.ts',
        'apps/client/src/features/i18n/LanguageSelector.tsx',
        'apps/client/src/features/i18n/LanguageSettingsPanel.tsx',
        'apps/client/src/app/runtime/ClientRuntimeContext.tsx',
        'apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx',
        'apps/client/components/Project/ProjectSelector.tsx',
        'apps/client/components/Chassis/Header/Header.tsx',
        'apps/client/components/Chassis/Footer/Footer.tsx',
        'apps/client/components/Modals/SettingsModal.tsx',
      ],
    },
    summary: {
      totalChecks: phase10NodeResults.total,
      passedChecks: phase10NodeResults.passed,
      failedChecks: phase10NodeResults.failed,
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
      'restored core shell locale inventory for en/es/fr/pt/ur in the shared i18n package',
      'added a visible language selector in settings and an optional compact selector in the project selector surface',
      'wired locale choice to persistence through the client i18n service plus the settings store',
      'broadened catalog-driven shell coverage for header, footer/status, settings, action-rail, and core settings panels',
      'kept extension-specific locale catalogs inside extension packages while ensuring schema-backed settings labels can flow through the host formatter',
    ],
    knownLimits: [
      'Visible language selection is now restored, but full translation breadth across every project-selector and modal string is still broader than the explicitly audited shell/settings/action-rail/header/status boundary for this checkpoint.',
      'The repository still does not yet close full frozen-target CommonMark/GFM corpus evidence, browser-driven visual regression, or promotion/release closure.',
    ],
  };

  await writeJson(path.join(artifactRoot, 'phase-10-i18n-results.json'), resultsArtifact);
  await writeJson(path.join(artifactRoot, 'phase-10-i18n-checkpoint.json'), checkpointArtifact);

  process.stdout.write(`${JSON.stringify(resultsArtifact, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
