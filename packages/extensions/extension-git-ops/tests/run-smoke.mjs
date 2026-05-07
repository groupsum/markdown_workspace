import assert from 'node:assert/strict';
import { createGitOpsBundledEntry } from '../dist/createGitOpsBundledEntry.js';
import { gitOpsManifest } from '../dist/manifest.js';

const fieldKeys = gitOpsManifest.settingsSchema.fields.map((field) => field.key);
assert.deepEqual(fieldKeys, ['persistRepositoryState', 'lastRepositoryUrl', 'oidcTokenBoundary']);

const entry = createGitOpsBundledEntry({
  toggleGitOps: async () => {},
  refreshGitOps: async () => {},
  renderWorkspace: () => null,
  renderExplorer: () => null,
  renderSettings: () => null,
  isActive: () => false,
});
const extension = await entry.load();
const diagnostics = [];
const registrations = {
  commands: [],
  modules: [],
  rails: [],
  settings: [],
};

await extension.activate({
  extensionId: gitOpsManifest.id,
  registerCommand(command) {
    registrations.commands.push(command);
  },
  registerWorkspaceModule(module) {
    registrations.modules.push(module);
  },
  registerActionRailItem(item) {
    registrations.rails.push(item);
  },
  registerSettingsSection(section) {
    registrations.settings.push(section);
  },
  host: {
    diagnostics: {
      async publish(extensionId, record) {
        diagnostics.push({ extensionId, ...record });
      },
    },
  },
});

assert.equal(registrations.commands.length, 2);
assert.equal(registrations.modules.length, 1);
assert.equal(registrations.rails.length, 1);
assert.equal(registrations.settings[0].schema.fields.length, 3);
assert.ok(diagnostics.some((record) => record.code === 'EXT_GIT_OPS_READY'));
assert.ok(diagnostics.some((record) => record.code === 'EXT_GIT_OPS_PERSISTENCE_READY' && record.detail.includes('oidcTokenBoundary=git-ops')));
