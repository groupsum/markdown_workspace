import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../../..');

const i18nModule = await import(pathToFileURL(path.join(repoRoot, 'packages/shared/i18n/dist/index.js')).href);
const {
  CORE_SHELL_SUPPORTED_LOCALES,
  CORE_SHELL_LOCALE_LOADER_DEFINITION,
  createLocaleRegistry,
  loadLocaleCatalogs,
} = i18nModule;

const read = (relativePath) => readFileSync(path.join(repoRoot, relativePath), 'utf8');

const clientI18nServiceText = read('apps/client/src/features/i18n/clientI18nService.ts');
const runtimeContextText = read('apps/client/src/app/runtime/ClientRuntimeContext.tsx');
const useCoreSurfaceText = read('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const projectSelectorText = read('apps/client/components/Project/ProjectSelector.tsx');
const headerText = read('apps/client/components/Chassis/Header/Header.tsx');
const footerText = read('apps/client/components/Chassis/Footer/Footer.tsx');
const settingsModalText = read('apps/client/components/Modals/SettingsModal.tsx');
const dataSettingsText = read('apps/client/src/features/settings/DataSettingsPanel.tsx');
const gitSettingsText = read('apps/client/src/features/settings/GitSettingsPanel.tsx');
const oidcSelectorText = read('apps/client/components/Modals/OidcSignInSelector.tsx');
const repoAutocompleteText = read('apps/client/components/Modals/RepositoryAutocomplete.tsx');
const markdownProfilesText = read('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx');
const actionRailHostText = read('apps/client/src/shell/ActionRailHost.tsx');
const registrationSinkText = read('apps/client/src/extensions/runtime/createClientExtensionRegistrationSink.tsx');
const settingsSchemaRendererText = read('apps/client/src/features/settings/SettingsSchemaRenderer.tsx');
const settingsViewText = read('apps/client/src/shell/SettingsView.tsx');

const checks = [];
function push(id, description, pass) {
  checks.push({ id, description, pass });
}

push('locale.count', 'Core shell restores five supported locales.', CORE_SHELL_SUPPORTED_LOCALES.map((entry) => entry.id).join('|') === 'en|es|fr|pt|ur');
push('locale.loaders', 'Shared i18n exports locale loaders for en/es/fr/pt/ur.', ['en', 'es', 'fr', 'pt', 'ur'].every((locale) => typeof CORE_SHELL_LOCALE_LOADER_DEFINITION.loaders[locale] === 'function'));

const registry = createLocaleRegistry({ defaultLocale: 'en', fallbackLocale: 'en' });
for (const locale of ['en', 'es', 'fr', 'pt', 'ur']) {
  const catalogs = await loadLocaleCatalogs({
    locale,
    defaultLocale: 'en',
    fallbackLocale: 'en',
    namespace: 'core',
    loaders: CORE_SHELL_LOCALE_LOADER_DEFINITION.loaders,
  });
  for (const catalog of catalogs) {
    registry.registerCatalog(catalog);
  }
}
registry.setLocale('es');
push('locale.es.translation', 'Spanish core shell translation resolves action-rail aria-label.', registry.resolve({ key: 'core.action-rail.aria-label', defaultMessage: 'Primary Actions' }) === 'Acciones principales');
registry.setLocale('fr');
push('locale.fr.translation', 'French core shell translation resolves settings title.', registry.resolve({ key: 'core.settings.language.title', defaultMessage: 'Language & Locale' }) === 'Langue et paramètres régionaux');
registry.setLocale('pt');
push('locale.pt.translation', 'Portuguese core shell translation resolves status runtime browser.', registry.resolve({ key: 'core.status.runtime.browser', defaultMessage: 'BROWSER' }) === 'NAVEGADOR');
registry.setLocale('ur');
push('locale.ur.translation', 'Urdu core shell translation resolves status runtime browser.', registry.resolve({ key: 'core.status.runtime.browser', defaultMessage: 'BROWSER' }) === 'براؤزر');

push('client.service.persistence.key', 'Client i18n service persists locale using a dedicated storage key.', clientI18nServiceText.includes("CORE_LOCALE_STORAGE_KEY = 'mdwrk.core.locale'"));
push('client.service.persistence.set', 'Client i18n service writes locale to localStorage on setLocale.', clientI18nServiceText.includes('persistLocale(registry.getLocale());'));
push('runtime.core-loader', 'Runtime provider registers shared core locale loaders and restores persisted locale from settings store.', runtimeContextText.includes("registerCatalogLoader('core', CORE_SHELL_LOCALE_LOADER_DEFINITION)") && runtimeContextText.includes("settingsStore.get<string>('core.locale')") || runtimeContextText.includes("settingsStore.get('core.locale')"));
push('settings.language.panel', 'Language settings panel is registered in core settings surfaces.', useCoreSurfaceText.includes("id: 'core.settings.language'") && useCoreSurfaceText.includes('<LanguageSettingsPanel />'));
push('project.selector.language.entry', 'Project selector exposes a visible language selector entry.', projectSelectorText.includes('<LanguageSelector compact />'));
push('header.uses-i18n', 'Header strings are catalog-driven through useClientI18n.', headerText.includes('useClientI18n') && headerText.includes("core.header.switch-project.title"));
push('footer.uses-i18n', 'Footer/status strings are catalog-driven through useClientI18n.', footerText.includes('useClientI18n') && footerText.includes("core.status.storage.persistent"));
push('settings.modal.uses-i18n', 'Settings modal surfaces catalog-driven strings.', settingsModalText.includes('useClientI18n') && settingsModalText.includes("core.settings.modal.exit"));
push('data.settings.uses-i18n', 'Data settings strings are catalog-driven.', dataSettingsText.includes('useClientI18n') && dataSettingsText.includes("core.settings.data.pwa.title"));
push('git.settings.uses-i18n', 'Git settings strings are catalog-driven.', gitSettingsText.includes('useClientI18n') && gitSettingsText.includes("core.settings.git.save-config"));
push('oidc.selector.uses-i18n', 'OIDC auth selector strings are catalog-driven.', oidcSelectorText.includes('useClientI18n') && oidcSelectorText.includes("core.settings.git.auth-mode"));
push('repo.autocomplete.uses-i18n', 'Repository autocomplete status strings are catalog-driven.', repoAutocompleteText.includes('useClientI18n') && repoAutocompleteText.includes("core.settings.git.loading-repositories"));
push('markdown.profiles.uses-i18n', 'Markdown profile settings strings are catalog-driven.', markdownProfilesText.includes('useClientI18n') && markdownProfilesText.includes("core.settings.markdown-profiles.default-profile"));
push('action.rail.localized.nav', 'Action-rail navigation aria-label is catalog-driven.', actionRailHostText.includes("core.action-rail.aria-label"));
push('settings.renderer.format-label', 'Schema-backed settings renderer and settings view support localized labels via formatLabel.', settingsSchemaRendererText.includes('formatLabel') && settingsViewText.includes('formatLabel={services.i18n.format}') && registrationSinkText.includes('schema'));
push('core.commands.keyed', 'Core command and settings titles use i18n keys for action-rail/settings coverage.', useCoreSurfaceText.includes("core.commands.new-file") && useCoreSurfaceText.includes("core.settings.sections.git.title") && useCoreSurfaceText.includes("core.views.settings.title"));
push('extension.catalogs.exist', 'Bundled extension packages keep extension-specific locale catalogs.', [
  'packages/extensions/extension-gemini-agent/src/locales/en.ts',
  'packages/extensions/extension-gemini-agent/src/locales/es.ts',
  'packages/extensions/extension-manager/src/locales/en.ts',
  'packages/extensions/extension-manager/src/locales/es.ts',
  'packages/extensions/extension-theme-studio/src/locales/en.ts',
  'packages/extensions/extension-theme-studio/src/locales/es.ts',
].every((relativePath) => existsSync(path.join(repoRoot, relativePath))));

const passed = checks.filter((entry) => entry.pass).length;
const result = {
  phase: 10,
  generatedAt: new Date().toISOString(),
  total: checks.length,
  passed,
  failed: checks.length - passed,
  locales: CORE_SHELL_SUPPORTED_LOCALES,
  checks,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2));
} else {
  assert.equal(result.failed, 0, `phase10 i18n parity failures: ${result.failed}`);
  console.log(`phase10 i18n parity: ${result.passed}/${result.total} passed`);
}
