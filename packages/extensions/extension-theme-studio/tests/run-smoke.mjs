import assert from 'node:assert/strict';
import { themeStudioManifest } from '../dist/manifest.js';
import { readThemeStudioSettings } from '../dist/settings.js';
import { buildThemeStudioClassRelationships } from '../dist/relationship.js';
import { buildThemeStudioExports, sanitizePackageName, sanitizeThemeIdentifier } from '../dist/export.js';
import { createThemeStudioService } from '../dist/service.js';
import { MARKDOWN_WORKSPACE_THEME_TOKENS } from '../../../contracts/theme-contract/dist/tokens.js';
import { MARKDOWN_WORKSPACE_THEME_CLASSES } from '../../../contracts/theme-contract/dist/classes.js';
import { MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES, MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES } from '../../../contracts/theme-contract/dist/bridges.js';
import { createMarkdownRendererThemeVariablesFromThemeTokens } from '../../../renderer/markdown-renderer-react/dist/theme.js';
import { createMarkdownEditorThemeVariablesFromThemeTokens } from '../../../editor/markdown-editor-react/dist/theme.js';

const listeners = new Map();
const storage = new Map();

const config = {
  async get(key) { return storage.has(key) ? storage.get(key) : null; },
  async set(key, value) { storage.set(key, value); for (const listener of listeners.get(key) ?? []) listener(value); },
  async remove(key) { storage.delete(key); for (const listener of listeners.get(key) ?? []) listener(null); },
  watch(key, listener) {
    const bucket = listeners.get(key) ?? new Set();
    bucket.add(listener);
    listeners.set(key, bucket);
    return { dispose() { bucket.delete(listener); } };
  },
};

const tokenMap = Object.fromEntries(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [definition.name, definition.defaultValue]));

const publishedDiagnostics = [];
const notifications = [];
const themeCalls = [];

const host = {
  apiVersion: '1.0.0',
  commands: { async execute() {}, async list() { return []; } },
  views: { async open() {}, async close() {}, async focus() {}, async list() { return []; } },
  actionRail: { async list() { return []; }, async reveal() {}, async setBadge() {} },
  settings: { async get() { return null; }, async set() {}, async remove() {}, watch() { return { dispose() {} }; } },
  notifications: {
    async info(message) { notifications.push(typeof message === 'string' ? message : message.defaultMessage); },
    async warn(message) { notifications.push(typeof message === 'string' ? message : message.defaultMessage); },
    async error(message) { notifications.push(typeof message === 'string' ? message : message.defaultMessage); },
  },
  theme: {
    async getToken(token) { return tokenMap[token] ?? null; },
    async getTokenMap() { return { ...tokenMap }; },
    async getTokens() { return MARKDOWN_WORKSPACE_THEME_TOKENS; },
    async getClassNames() { return MARKDOWN_WORKSPACE_THEME_CLASSES; },
    async getThemeBridge(target) { return target === 'renderer' ? MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES : MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES; },
    async getThemeBridgeVariables(target) { return target === 'renderer' ? createMarkdownRendererThemeVariablesFromThemeTokens(tokenMap) : createMarkdownEditorThemeVariablesFromThemeTokens(tokenMap); },
    async setDraftToken(token, value) { themeCalls.push(['setDraftToken', token, value]); tokenMap[token] = value; },
    async setDraftTokens(tokens) { themeCalls.push(['setDraftTokens', tokens]); Object.assign(tokenMap, tokens); },
    async previewTheme(tokens) { themeCalls.push(['previewTheme', tokens]); Object.assign(tokenMap, tokens.tokens ? tokens.tokens : tokens); },
    async applyDraft() { themeCalls.push(['applyDraft']); },
    async discardDraft() { themeCalls.push(['discardDraft']); },
    async exportTheme() { return { metadata: { id: 'micropress', name: 'Micropress', description: 'Test theme', author: 'Markdown Workspace' }, compatibility: { contract: '1.0.0' }, tokens: { ...tokenMap } }; },
    async exportThemeCss() { return ':root {}'; },
    async supportsClass() { return true; },
  },
  editor: { async getActiveDocument() { return null; }, async getSelections() { return []; }, async insertText() {}, async replaceSelections() {}, async setDocumentContent() {} },
  workspace: { async listProjects() { return []; }, async getActiveProject() { return { id: 'project', name: 'Project' }; }, async getActiveFile() { return null; }, async readFile() { return ''; }, async writeFile() {} },
  i18n: {
    async getLocale() { return 'en'; },
    async setLocale() {},
    async ensureLocale() {},
    format(label) { return typeof label === 'string' ? label : label.defaultMessage; },
    registerCatalog() { return { dispose() {} }; },
    registerCatalogLoader() { return { dispose() {} }; },
  },
  diagnostics: {
    async publish(_extensionId, record) { publishedDiagnostics.push(record); },
    async clear() {},
  },
  logger: { async debug() {}, async info() {}, async warn() {}, async error() {} },
  environment: {
    platform: 'web',
    mode: 'test',
    hostVersion: '1.3.49',
    runtimeVersion: '1.0.0',
    grantedCapabilities: ['theme.read', 'theme.write', 'settings.read', 'settings.write', 'notification.publish', 'view.register', 'actionRail.register'],
  },
};

const context = {
  extensionId: themeStudioManifest.id,
  manifest: themeStudioManifest,
  capabilities: themeStudioManifest.capabilities,
  host,
  environment: host.environment,
  config,
  registerCommand() { return { dispose() {} }; },
  registerView() { return { dispose() {} }; },
  registerComponent() { return { dispose() {} }; },
  registerActionRailItem() { return { dispose() {} }; },
  registerSettingsSection() { return { dispose() {} }; },
  registerLocaleCatalog() { return { dispose() {} }; },
  registerLocaleCatalogLoader() { return { dispose() {} }; },
  registerService() { return { dispose() {} }; },
};

assert.equal(themeStudioManifest.id, 'core.theme-studio');
assert.ok(themeStudioManifest.capabilities.includes('theme.write'));
assert.ok(themeStudioManifest.contributions.actionRail.some((item) => item.id === 'core.theme-studio.rail'));

const defaultSettings = await readThemeStudioSettings(config);
assert.equal(defaultSettings.autoPreviewOnEdit, true);
assert.equal(defaultSettings.defaultExportTarget, 'host');

const relationships = buildThemeStudioClassRelationships(MARKDOWN_WORKSPACE_THEME_CLASSES, MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES, MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES);
assert.ok(relationships.some((entry) => entry.bridgeTarget === 'renderer'));
assert.ok(relationships.some((entry) => entry.bridgeTarget === 'editor'));

const exportsBundle = buildThemeStudioExports({
  themeId: 'custom-theme',
  themeName: 'Custom Theme',
  packageName: '@markdown-workspace/theme-custom-theme',
  author: 'Markdown Workspace',
  description: 'Generated theme',
}, tokenMap, defaultSettings);
assert.match(exportsBundle.json, /"metadata"/);
assert.match(exportsBundle.hostCss, /--bg-app/);
assert.match(exportsBundle.rendererCss, /--mw-fg-primary/);
assert.match(exportsBundle.editorCss, /--mwe-bg-surface/);
assert.ok(exportsBundle.packageArtifact.files.some((file) => file.path === 'dist/index.css'));
assert.ok(exportsBundle.packageArtifact.files.some((file) => file.path === 'dist/renderer.css'));
assert.ok(exportsBundle.packageArtifact.files.some((file) => file.path === 'dist/editor.css'));

assert.equal(sanitizeThemeIdentifier('  My Theme  '), 'my-theme');
assert.equal(sanitizePackageName('@scope/theme custom'), '@scope/theme-custom');

const service = createThemeStudioService({
  context,
  formatLabel: (label) => typeof label === 'string' ? label : label.defaultMessage,
});
await service.refresh();
assert.ok(service.getSnapshot().tokenDefinitions.length > 0);
await service.setDraftToken('accent', '#123456');
assert.equal(service.getSnapshot().draftTokens.accent, '#123456');
assert.ok(themeCalls.some((call) => call[0] === 'previewTheme'));
await service.preview();
await service.apply();
await service.revert();
const serviceExports = await service.generateExports('renderer');
assert.match(serviceExports.rendererCss, /--mw-fg-primary/);
assert.ok(notifications.some((message) => /applied|reverted|generated/i.test(message)));
assert.ok(publishedDiagnostics.some((record) => record.code === 'EXT_THEME_STUDIO_EXPORTED'));

const rendererBridge = createMarkdownRendererThemeVariablesFromThemeTokens({ accent: '#abcdef' });
const editorBridge = createMarkdownEditorThemeVariablesFromThemeTokens({ accent: '#abcdef' });
assert.equal(rendererBridge['--mw-accent'], '#abcdef');
assert.equal(editorBridge['--mwe-accent'], '#abcdef');

console.log('extension-theme-studio smoke checks passed');
