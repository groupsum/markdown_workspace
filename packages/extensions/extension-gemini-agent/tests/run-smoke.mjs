import assert from 'node:assert/strict';
import { geminiAgentManifest } from '../dist/manifest.js';
import { buildGeminiPrompt } from '../dist/prompt.js';
import { createGeminiTextProvider, buildGeminiGenerateContentBody, extractGeminiText, resolveGeminiGenerateContentUrl } from '../dist/provider.js';
import { createGeminiAgentService } from '../dist/service.js';
import { readGeminiAgentSettings } from '../dist/settings.js';

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

const notifications = [];
const diagnostics = [];
let selectionReplacedWith = null;
let documentReplacedWith = null;

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
    async getToken() { return null; },
    async getTokenMap() { return {}; },
    async getTokens() { return []; },
    async getClassNames() { return []; },
    async getThemeBridge() { return []; },
    async getThemeBridgeVariables() { return {}; },
    async setDraftToken() {},
    async setDraftTokens() {},
    async previewTheme() {},
    async applyDraft() {},
    async discardDraft() {},
    async exportTheme() { return { metadata: { id: 'test', name: 'Test', description: 'Test' }, compatibility: { contract: '1.0.0' }, tokens: {} }; },
    async exportThemeCss() { return ':root {}'; },
    async supportsClass() { return true; },
  },
  editor: {
    async getActiveDocument() { return { uri: 'workspace://project/file', language: 'markdown', content: '# Title\n\nBody', version: '1' }; },
    async getSelections() { return [{ start: 0, end: 7, text: '# Title' }]; },
    async insertText() {},
    async replaceSelections(next) { selectionReplacedWith = Array.isArray(next) ? next[0] : next; },
    async setDocumentContent(next) { documentReplacedWith = next; },
  },
  workspace: {
    async listProjects() { return []; },
    async getActiveProject() { return { id: 'project', name: 'Project' }; },
    async getActiveFile() { return { id: 'file', name: 'README.md', path: '/README.md', kind: 'file' }; },
    async readFile() { return '# Title\n\nBody'; },
    async writeFile() {},
  },
  i18n: {
    async getLocale() { return 'en'; },
    async setLocale() {},
    async ensureLocale() {},
    format(label) { return typeof label === 'string' ? label : label.defaultMessage; },
    registerCatalog() { return { dispose() {} }; },
    registerCatalogLoader() { return { dispose() {} }; },
  },
  diagnostics: {
    async publish(_extensionId, record) { diagnostics.push(record); },
    async clear() {},
  },
  logger: { debug() {}, info() {}, warn() {}, error() {} },
  environment: {
    platform: 'web',
    mode: 'test',
    hostVersion: '1.3.49',
    runtimeVersion: '1.0.0',
    grantedCapabilities: ['workspace.read', 'editor.read', 'editor.write', 'selection.read', 'settings.read', 'settings.write', 'notification.publish', 'command.invoke', 'actionRail.register', 'view.register', 'network.fetch'],
  },
};

const context = {
  extensionId: geminiAgentManifest.id,
  manifest: geminiAgentManifest,
  capabilities: geminiAgentManifest.capabilities,
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

assert.equal(geminiAgentManifest.id, 'core.gemini-agent');
assert.ok(geminiAgentManifest.capabilities.includes('network.fetch'));
assert.ok(geminiAgentManifest.contributions.actionRail.some((item) => item.id === 'core.gemini-agent.rail'));

const resolvedSettings = await readGeminiAgentSettings(config);
assert.equal(resolvedSettings.model, 'gemini-2.5-flash');
assert.equal(resolvedSettings.allowWriteBack, false);

const prompt = buildGeminiPrompt('rewrite-selection', 'Tighten the language.', {
  project: { id: 'project', name: 'Project' },
  file: { id: 'file', name: 'README.md', path: '/README.md', kind: 'file' },
  document: { uri: 'workspace://project/file', language: 'markdown', content: '# Title\n\nBody', version: '1' },
  selections: [{ start: 0, end: 7, text: '# Title' }],
}, resolvedSettings);
assert.match(prompt, /Selected markdown/);
assert.match(prompt, /# Title/);

const provider = createGeminiTextProvider({
  fetchImpl: async (url, init) => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    async json() {
      return {
        candidates: [{ content: { parts: [{ text: 'Draft result' }] } }],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 4, totalTokenCount: 14 },
      };
    },
    async text() { return ''; },
  }),
});

const fakeRequest = {
  intent: 'custom-prompt',
  prompt: 'Hello',
  context: {
    project: null,
    file: null,
    document: null,
    selections: [],
  },
  settings: {
    ...resolvedSettings,
    apiKey: 'abc123',
  },
};

assert.match(resolveGeminiGenerateContentUrl(fakeRequest), /key=abc123/);
assert.deepEqual(buildGeminiGenerateContentBody(fakeRequest).generationConfig, { temperature: 0.2 });
assert.equal(extractGeminiText({ candidates: [{ content: { parts: [{ text: 'Answer' }] } }] }), 'Answer');

const service = createGeminiAgentService({
  context,
  provider,
  formatLabel: (label) => typeof label === 'string' ? label : label.defaultMessage,
});

await config.set('apiKey', 'secret-key');
const summary = await service.runIntent('summarize-current-file');
assert.equal(summary.text, 'Draft result');
await service.runIntent('rewrite-selection', 'Tighten the language.');
assert.equal(service.getSnapshot().pendingDraft, 'Draft result');

const blocked = await service.applyDraft('selection');
assert.equal(blocked, false);
assert.ok(notifications.some((message) => message.includes('not applied') || message.includes('disabled')));

await config.set('allowWriteBack', true);
const appliedSelection = await service.applyDraft('selection');
assert.equal(appliedSelection, true);
assert.equal(selectionReplacedWith, 'Draft result');

const appliedDocument = await service.applyDraft('document');
assert.equal(appliedDocument, true);
assert.equal(documentReplacedWith, 'Draft result');
assert.ok(diagnostics.some((record) => record.code === 'EXT_GEMINI_REQUEST_SUCCEEDED'));
console.log('extension-gemini-agent smoke checks passed');
