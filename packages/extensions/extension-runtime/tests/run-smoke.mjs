import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  bytesToBase64Url,
  canonicalizeJson,
  createExtensionCatalogEntryId,
  createExtensionRuntime,
  createInMemoryExtensionArtifactTransport,
} from '../dist/index.js';
import {
  createInMemoryExtensionRuntimeStorage,
  getExtensionConfigKey,
} from '../dist/storage.js';
import { validateExtensionManifest } from '../dist/validation.js';
import { evaluateExtensionCompatibility } from '../dist/compatibility.js';
import { EXTENSION_RUNTIME_VERSION } from '../dist/version.js';
import { EXTENSION_HOST_API_VERSION } from '../../../contracts/extension-host/dist/version.js';

const createManifest = (id, overrides = {}) => ({
  manifestVersion: 1,
  id,
  packageName: `@markdown-workspace/${id}`,
  version: '1.0.0',
  displayName: { defaultMessage: id },
  description: { defaultMessage: `${id} description` },
  kind: 'bundled',
  icon: { kind: 'lucide', name: 'Puzzle' },
  enabledByDefault: true,
  capabilities: ['view.register', 'actionRail.register', 'settings.read', 'settings.write', 'notification.publish'],
  compatibility: {
    manifestVersion: 1,
    hostApi: EXTENSION_HOST_API_VERSION,
    runtime: EXTENSION_RUNTIME_VERSION,
    app: '>=0.1.0',
    themeContract: '1.0.0',
  },
  entry: {
    module: `./${id}.js`,
    export: id,
  },
  contributions: {
    commands: [],
    views: [],
    components: [],
    actionRail: [],
    settingsSections: [],
  },
  ...overrides,
});

const createExternalManifest = (id, version = '1.0.0', overrides = {}) => createManifest(id, {
  version,
  kind: 'external',
  packageName: `@external/${id}`,
  publisher: 'trusted-publisher',
  enabledByDefault: true,
  entry: { module: './index.js', export: 'externalExtension' },
  capabilities: ['view.register', 'actionRail.register', 'notification.publish'],
  distribution: { channel: 'catalog', format: 'esm' },
  ...overrides,
});

const createHost = () => {
  const diagnostics = {};
  return {
    diagnostics,
    host: {
      apiVersion: EXTENSION_HOST_API_VERSION,
      commands: { async execute() {}, async list() { return []; } },
      views: { async open() {}, async close() {}, async focus() {}, async list() { return []; } },
      actionRail: { async list() { return []; }, async reveal() {}, async setBadge() {} },
      settings: { async get() { return null; }, async set() {}, async remove() {}, watch() { return { dispose() {} }; } },
      notifications: { async info() {}, async warn() {}, async error() {} },
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
        async exportTheme() { return { id: 'default', name: 'Default', tokens: {} }; },
        async exportThemeCss() { return ''; },
        async supportsClass() { return true; },
      },
      editor: { async getActiveDocument() { return null; }, async getSelections() { return []; }, async insertText() {}, async replaceSelections() {}, async setDocumentContent() {} },
      workspace: { async listProjects() { return []; }, async getActiveProject() { return null; }, async getActiveFile() { return null; }, async readFile() { return ''; }, async writeFile() {} },
      i18n: {
        async getLocale() { return 'en'; },
        async setLocale() {},
        async ensureLocale() {},
        format(label) { return typeof label === 'string' ? label : label.defaultMessage; },
        registerCatalog() { return { dispose() {} }; },
        registerCatalogLoader() { return { dispose() {} }; },
      },
      diagnostics: {
        async publish(extensionId, record) {
          diagnostics[extensionId] = diagnostics[extensionId] ?? [];
          diagnostics[extensionId].push(record);
        },
        async clear(extensionId) {
          diagnostics[extensionId] = [];
        },
      },
      logger: { async debug() {}, async info() {}, async warn() {}, async error() {} },
      environment: {
        platform: 'web',
        mode: 'test',
        hostVersion: '0.1.0',
        runtimeVersion: EXTENSION_RUNTIME_VERSION,
        grantedCapabilities: ['view.register', 'actionRail.register', 'settings.read', 'settings.write', 'notification.publish'],
      },
    },
  };
};

const createSink = () => {
  const commands = [];
  const views = [];
  const rail = [];
  const settings = [];
  return {
    commands,
    views,
    rail,
    settings,
    sink: {
      registerCommand(_extensionId, command) { commands.push(command); return { dispose() {} }; },
      registerView(_extensionId, view) { views.push(view); return { dispose() {} }; },
      registerActionRailItem(_extensionId, item) { rail.push(item); return { dispose() {} }; },
      registerSettingsSection(_extensionId, section) { settings.push(section); return { dispose() {} }; },
    },
  };
};

async function createSigner() {
  const keyPair = await webcrypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  return {
    privateKey: keyPair.privateKey,
    publicKeyJwk: await webcrypto.subtle.exportKey('jwk', keyPair.publicKey),
    keyId: 'test-signer',
  };
}

async function signManifest(manifest, signer) {
  const signature = await webcrypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    signer.privateKey,
    new TextEncoder().encode(canonicalizeJson(manifest)),
  );
  return {
    schemaVersion: 1,
    manifest,
    signature: {
      keyId: signer.keyId,
      algorithm: 'ecdsa-p256-sha256',
      signature: bytesToBase64Url(new Uint8Array(signature)),
      signedAt: new Date().toISOString(),
    },
  };
}

async function sha256Hex(value) {
  const digest = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Buffer.from(digest).toString('hex');
}

async function createExternalCatalogFixture({ manifest, moduleCode, baseUrl = 'https://catalog.example/', signer: providedSigner }) {
  const signer = providedSigner ?? await createSigner();
  const signedManifest = await signManifest(manifest, signer);
  const entryId = createExtensionCatalogEntryId(manifest.id, manifest.version);
  const catalog = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    baseUrl,
    extensions: [
      {
        entryId,
        extensionId: manifest.id,
        packageName: manifest.packageName,
        version: manifest.version,
        displayName: manifest.displayName,
        description: manifest.description,
        publisher: manifest.publisher,
        capabilities: manifest.capabilities,
        compatibility: manifest.compatibility,
        urls: {
          manifest: `${entryId}/manifest.json`,
          signedManifest: `${entryId}/signed-manifest.json`,
          module: `${entryId}/dist/index.js`,
          integrity: `${entryId}/integrity.json`,
        },
        integrity: {
          manifest: { algorithm: 'sha256', digest: await sha256Hex(canonicalizeJson(manifest)) },
          module: { algorithm: 'sha256', digest: await sha256Hex(moduleCode) },
        },
      },
    ],
  };
  const transport = createInMemoryExtensionArtifactTransport({
    [`${baseUrl}${entryId}/manifest.json`]: manifest,
    [`${baseUrl}${entryId}/signed-manifest.json`]: signedManifest,
    [`${baseUrl}${entryId}/dist/index.js`]: moduleCode,
  });
  return {
    signer,
    signedManifest,
    entryId,
    catalog,
    transport,
    trustPolicy: {
      allowUnsigned: false,
      allowIntegrityOnly: false,
      allowedPublishers: [manifest.publisher],
      allowedPackageNames: [manifest.packageName],
      allowedExtensionIds: [manifest.id],
      trustedSigners: [
        {
          keyId: signer.keyId,
          algorithm: 'ecdsa-p256-sha256',
          publicKeyJwk: signer.publicKeyJwk,
          publisher: manifest.publisher,
        },
      ],
    },
  };
}

function createExternalModuleCode(manifest, message = 'Hello from external extension') {
  return [
    `const manifest = ${JSON.stringify(manifest)};`,
    'export const externalExtension = {',
    '  manifest,',
    '  async activate(context) {',
    `    context.registerView({ id: '${manifest.id}.view', title: { defaultMessage: 'External View' }, description: { defaultMessage: 'External view' }, location: 'panel', allowMultiple: false, render: () => ${JSON.stringify(message)} });`,
    `    context.registerActionRailItem({ id: '${manifest.id}.rail', title: { defaultMessage: 'External Rail' }, icon: { kind: 'lucide', name: 'Puzzle' }, target: { kind: 'view', viewId: '${manifest.id}.view' }, group: 'extensions' });`,
    `    await context.host.notifications.info(${JSON.stringify(message)});`,
    '  },',
    '};',
    'export default externalExtension;',
  ].join('\n');
}

// manifest validation
const invalidIssues = validateExtensionManifest(createManifest('invalid', { displayName: { defaultMessage: '' } }));
assert.ok(invalidIssues.some((issue) => issue.path === 'displayName.defaultMessage'));

// activation/deactivation lifecycle
{
  const { host } = createHost();
  const { sink, views, rail } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
  const manifest = createManifest('runtime-smoke');
  runtime.registerBundledExtension({
    manifest,
    activation: 'eager',
    load: async () => ({
      manifest,
      async activate(context) {
        context.registerView({ id: `${manifest.id}.view`, title: { defaultMessage: 'Runtime Smoke' }, description: { defaultMessage: 'Smoke view' }, location: 'modal', allowMultiple: false, render: () => null });
        context.registerActionRailItem({ id: `${manifest.id}.rail`, title: { defaultMessage: 'Runtime Smoke' }, icon: { kind: 'lucide', name: 'Puzzle' }, target: { kind: 'view', viewId: `${manifest.id}.view` } });
      },
    }),
  });
  await runtime.start();
  assert.equal(runtime.get(manifest.id)?.status, 'active');
  assert.ok(views.some((view) => view.id === `${manifest.id}.view`));
  assert.ok(rail.some((item) => item.id === `${manifest.id}.rail`));
  await runtime.deactivate(manifest.id);
  assert.equal(runtime.get(manifest.id)?.status, 'registered');
}

// config persistence
{
  const { host } = createHost();
  const { sink } = createSink();
  const storage = createInMemoryExtensionRuntimeStorage();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage });
  const manifest = createManifest('configurable');
  runtime.registerBundledExtension({
    manifest,
    activation: 'eager',
    load: async () => ({ manifest, async activate(context) { await context.config.set('token', 'abc123'); } }),
  });
  await runtime.start();
  assert.equal(await storage.get(getExtensionConfigKey(manifest.id, 'token')), 'abc123');
}

// compatibility rejection
{
  const { host, diagnostics } = createHost();
  const { sink } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
  const manifest = createManifest('incompatible', { compatibility: { manifestVersion: 1, hostApi: '2.0.0', runtime: EXTENSION_RUNTIME_VERSION, app: '>=0.1.0', themeContract: '1.0.0' } });
  runtime.registerBundledExtension({ manifest, activation: 'eager', load: async () => ({ manifest, activate() {} }) });
  await runtime.start();
  assert.equal(runtime.get(manifest.id)?.status, 'incompatible');
  assert.equal(evaluateExtensionCompatibility(manifest, { hostApiVersion: host.apiVersion, hostVersion: host.environment.hostVersion, runtimeVersion: EXTENSION_RUNTIME_VERSION, themeContractVersion: '1.0.0' }).compatible, false);
  assert.ok((diagnostics[manifest.id] ?? []).length > 0);
}

// runtime error containment
{
  const { host } = createHost();
  const { sink, views } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
  const failingManifest = createManifest('failing');
  const healthyManifest = createManifest('healthy');
  runtime.registerBundledExtension({ manifest: failingManifest, activation: 'eager', load: async () => ({ manifest: failingManifest, async activate() { throw new Error('boom'); } }) });
  runtime.registerBundledExtension({ manifest: healthyManifest, activation: 'eager', load: async () => ({ manifest: healthyManifest, async activate(context) { context.registerView({ id: `${healthyManifest.id}.view`, title: { defaultMessage: 'Healthy' }, description: { defaultMessage: 'Healthy view' }, location: 'modal', allowMultiple: false, render: () => null }); } }) });
  await runtime.start();
  assert.equal(runtime.get(failingManifest.id)?.status, 'error');
  assert.equal(runtime.get(healthyManifest.id)?.status, 'active');
  assert.ok(views.some((view) => view.id === `${healthyManifest.id}.view`));
}

// lazy activation
{
  const { host } = createHost();
  const { sink } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
  const manifest = createManifest('lazy');
  let activated = 0;
  runtime.registerBundledExtension({ manifest, activation: 'lazy', load: async () => ({ manifest, async activate() { activated += 1; } }) });
  await runtime.start();
  assert.equal(runtime.get(manifest.id)?.status, 'registered');
  assert.equal(activated, 0);
  await runtime.activate(manifest.id);
  assert.equal(runtime.get(manifest.id)?.status, 'active');
  assert.equal(activated, 1);
}

// external install/update/remove and cache rehydration
{
  const manifestV1 = createExternalManifest('external-smoke');
  const moduleV1 = createExternalModuleCode(manifestV1, 'Hello V1');
  const fixtureV1 = await createExternalCatalogFixture({ manifest: manifestV1, moduleCode: moduleV1 });
  const manifestV2 = createExternalManifest('external-smoke', '1.1.0');
  const moduleV2 = createExternalModuleCode(manifestV2, 'Hello V2');
  const fixtureV2 = await createExternalCatalogFixture({ manifest: manifestV2, moduleCode: moduleV2, baseUrl: fixtureV1.catalog.baseUrl, signer: fixtureV1.signer });

  const { host } = createHost();
  const { sink, views, rail } = createSink();
  const storage = createInMemoryExtensionRuntimeStorage();
  const transport = createInMemoryExtensionArtifactTransport({
    [`${fixtureV1.catalog.baseUrl}${fixtureV1.entryId}/manifest.json`]: manifestV1,
    [`${fixtureV1.catalog.baseUrl}${fixtureV1.entryId}/signed-manifest.json`]: fixtureV1.signedManifest,
    [`${fixtureV1.catalog.baseUrl}${fixtureV1.entryId}/dist/index.js`]: moduleV1,
    [`${fixtureV2.catalog.baseUrl}${fixtureV2.entryId}/manifest.json`]: manifestV2,
    [`${fixtureV2.catalog.baseUrl}${fixtureV2.entryId}/signed-manifest.json`]: fixtureV2.signedManifest,
    [`${fixtureV2.catalog.baseUrl}${fixtureV2.entryId}/dist/index.js`]: moduleV2,
  });
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage, transport, trustPolicy: fixtureV1.trustPolicy });
  runtime.registerCatalog({ ...fixtureV1.catalog, extensions: [fixtureV1.catalog.extensions[0], fixtureV2.catalog.extensions[0]] }, { catalogId: 'sample-catalog', baseUrl: fixtureV1.catalog.baseUrl });
  await runtime.start();
  assert.equal(runtime.listAvailableCatalogEntries().length, 2);
  const installRecord = await runtime.installFromCatalogEntry(fixtureV1.entryId, { autoActivate: true });
  assert.equal(installRecord.manifest.version, '1.0.0');
  assert.equal(runtime.get(manifestV1.id)?.source, 'installed');
  assert.equal(runtime.get(manifestV1.id)?.status, 'active');
  assert.ok(views.some((view) => view.id === `${manifestV1.id}.view`));
  assert.ok(rail.some((item) => item.id === `${manifestV1.id}.rail`));

  const updatedRecord = await runtime.updateFromCatalogEntry(fixtureV2.entryId, { autoActivate: true });
  assert.equal(updatedRecord.manifest.version, '1.1.0');
  assert.equal(runtime.get(manifestV2.id)?.manifest.version, '1.1.0');

  const { host: host2 } = createHost();
  const { sink: sink2 } = createSink();
  const runtime2 = createExtensionRuntime({ host: host2, registrationSink: sink2, storage, transport, trustPolicy: fixtureV1.trustPolicy });
  await runtime2.start();
  assert.equal(runtime2.get(manifestV1.id)?.source, 'installed');
  await runtime2.activate(manifestV1.id);
  assert.equal(runtime2.get(manifestV1.id)?.status, 'active');

  await runtime2.removeInstalledExtension(manifestV1.id);
  assert.equal(runtime2.get(manifestV1.id), undefined);
}

// untrusted extension rejection
{
  const manifest = createExternalManifest('external-untrusted');
  const moduleCode = createExternalModuleCode(manifest, 'Untrusted');
  const fixture = await createExternalCatalogFixture({ manifest, moduleCode });
  const { host } = createHost();
  const { sink } = createSink();
  const runtime = createExtensionRuntime({
    host,
    registrationSink: sink,
    storage: createInMemoryExtensionRuntimeStorage(),
    transport: fixture.transport,
    trustPolicy: {
      allowUnsigned: false,
      allowIntegrityOnly: false,
      allowedPublishers: ['different-publisher'],
      allowedPackageNames: [manifest.packageName],
      allowedExtensionIds: [manifest.id],
      trustedSigners: fixture.trustPolicy.trustedSigners,
    },
  });
  runtime.registerCatalog(fixture.catalog, { catalogId: 'untrusted', baseUrl: fixture.catalog.baseUrl });
  await runtime.start();
  await assert.rejects(() => runtime.installFromCatalogEntry(fixture.entryId), /allowlisted/i);
}

// compatibility mismatch rejection for external installs
{
  const manifest = createExternalManifest('external-incompatible', '1.0.0', {
    compatibility: {
      manifestVersion: 1,
      hostApi: '9.0.0',
      runtime: EXTENSION_RUNTIME_VERSION,
      app: '>=0.1.0',
      themeContract: '1.0.0',
    },
  });
  const moduleCode = createExternalModuleCode(manifest, 'Incompatible');
  const fixture = await createExternalCatalogFixture({ manifest, moduleCode });
  const { host } = createHost();
  const { sink } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage(), transport: fixture.transport, trustPolicy: fixture.trustPolicy });
  runtime.registerCatalog(fixture.catalog, { catalogId: 'incompatible', baseUrl: fixture.catalog.baseUrl });
  await runtime.start();
  await assert.rejects(() => runtime.installFromCatalogEntry(fixture.entryId), /incompatible/i);
}

// integrity verification rejection
{
  const manifest = createExternalManifest('external-integrity-fail');
  const moduleCode = createExternalModuleCode(manifest, 'Integrity failure');
  const fixture = await createExternalCatalogFixture({ manifest, moduleCode });
  const tamperedTransport = createInMemoryExtensionArtifactTransport({
    [`${fixture.catalog.baseUrl}${fixture.entryId}/manifest.json`]: manifest,
    [`${fixture.catalog.baseUrl}${fixture.entryId}/signed-manifest.json`]: fixture.signedManifest,
    [`${fixture.catalog.baseUrl}${fixture.entryId}/dist/index.js`]: `${moduleCode}\n// tampered`,
  });
  const { host } = createHost();
  const { sink } = createSink();
  const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage(), transport: tamperedTransport, trustPolicy: fixture.trustPolicy });
  runtime.registerCatalog(fixture.catalog, { catalogId: 'integrity', baseUrl: fixture.catalog.baseUrl });
  await runtime.start();
  await assert.rejects(() => runtime.installFromCatalogEntry(fixture.entryId), /integrity/i);
}

console.log('extension-runtime smoke tests passed');
