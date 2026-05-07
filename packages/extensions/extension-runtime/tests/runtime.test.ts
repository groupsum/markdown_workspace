import { describe, expect, it } from "vitest";
import type {
  ExtensionHost,
  ExtensionLocaleCatalog,
  MarkdownWorkspaceExtension,
  RegisteredActionRailItem,
  RegisteredCommand,
  RegisteredSettingsSection,
  RegisteredView,
  RegisteredWorkspaceModule,
} from "@mdwrk/extension-host";
import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import { createExtensionRuntime } from "../src/runtime.js";
import { evaluateExtensionCompatibility } from "../src/compatibility.js";
import { canonicalizeJson, createInMemoryExtensionArtifactTransport, digestText } from "../src/catalog.js";
import { deriveExtensionIntent } from "../src/intent.js";
import {
  EXTENSION_INSTALL_INDEX_KEY,
  createInMemoryExtensionRuntimeStorage,
  getExtensionConfigKey,
  getExtensionEnabledStateKey,
  getInstalledExtensionModuleKey,
  getInstalledExtensionRecordKey,
} from "../src/storage.js";
import { validateExtensionManifest } from "../src/validation.js";
import type { ExtensionRuntimeRegistrationSink } from "../src/types.js";

const createManifest = (id: string, overrides: Partial<ExtensionManifest> = {}): ExtensionManifest => ({
  manifestVersion: 1,
  id,
  packageName: `@mdwrk/${id}`,
  version: "1.0.0",
  displayName: { defaultMessage: id },
  description: { defaultMessage: `${id} description` },
  kind: "bundled",
  icon: { kind: "lucide", name: "Plug" },
  enabledByDefault: true,
  capabilities: ["view.register", "actionRail.register", "settings.read", "settings.write", "notification.publish"],
  compatibility: {
    manifestVersion: 1,
    hostApi: "1.0.0",
    runtime: "1.0.0",
    app: ">=0.1.0",
    themeContract: "1.0.0",
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

const createHost = () => {
  const localeCatalogs: Array<{ extensionId: string; catalog: ExtensionLocaleCatalog }> = [];
  const diagnostics: Record<string, { code: string; message: string }[]> = {};

  const host: ExtensionHost = {
    apiVersion: "1.0.0",
    commands: {
      async execute() { return undefined; },
      async list() { return []; },
    },
    views: {
      async open() {},
      async close() {},
      async focus() {},
      async list() { return []; },
    },
    actionRail: {
      async list() { return []; },
      async reveal() {},
      async setBadge() {},
    },
    settings: {
      async get() { return null; },
      async set() {},
      async remove() {},
      watch() { return { dispose() {} }; },
    },
    notifications: {
      async info() {},
      async warn() {},
      async error() {},
    },
    theme: {
      async getToken() { return null; },
      async getTokens() { return []; },
      async getClassNames() { return []; },
      async setDraftToken() {},
      async applyDraft() {},
      async discardDraft() {},
      async exportTheme() { return { id: "default", name: "Default", tokens: {} }; },
      async supportsClass() { return true; },
    },
    editor: {
      async getActiveDocument() { return null; },
      async getSelections() { return []; },
      async insertText() {},
      async replaceSelections() {},
      async setDocumentContent() {},
    },
    workspace: {
      async listProjects() { return []; },
      async listFiles() { return []; },
      async getActiveProject() { return null; },
      async getActiveFile() { return null; },
      async readFile() { return ""; },
      async writeFile() {},
    },
    i18n: {
      async getLocale() { return "en"; },
      async setLocale() {},
      async ensureLocale() {},
      format(label) { return typeof label === "string" ? label : label.defaultMessage; },
      registerCatalog(extensionId, catalog) {
        localeCatalogs.push({ extensionId, catalog });
        return { dispose() {} };
      },
    },
    diagnostics: {
      async publish(extensionId, record) {
        diagnostics[extensionId] = diagnostics[extensionId] ?? [];
        diagnostics[extensionId].push({ code: record.code, message: record.message });
      },
      async clear(extensionId) {
        diagnostics[extensionId] = [];
      },
    },
    logger: {
      async debug() {},
      async info() {},
      async warn() {},
      async error() {},
    },
    environment: {
      platform: "web",
      mode: "test",
      hostVersion: "0.1.0",
      runtimeVersion: "1.0.0",
      grantedCapabilities: [
        "view.register",
        "actionRail.register",
        "settings.read",
        "settings.write",
        "notification.publish",
      ],
    },
  };

  return { host, localeCatalogs, diagnostics };
};

const createSink = () => {
  const commands: RegisteredCommand[] = [];
  const views: RegisteredView[] = [];
  const rail: RegisteredActionRailItem[] = [];
  const settings: RegisteredSettingsSection[] = [];
  const workspaceModules: RegisteredWorkspaceModule[] = [];

  const sink: ExtensionRuntimeRegistrationSink = {
    registerCommand(_extensionId, command) {
      commands.push(command);
      return { dispose() {} };
    },
    registerView(_extensionId, view) {
      views.push(view);
      return { dispose() {} };
    },
    registerWorkspaceModule(_extensionId, module) {
      workspaceModules.push(module);
      return { dispose() {} };
    },
    registerActionRailItem(_extensionId, item) {
      rail.push(item);
      return { dispose() {} };
    },
    registerSettingsSection(_extensionId, section) {
      settings.push(section);
      return { dispose() {} };
    },
  };

  return { sink, commands, views, rail, settings, workspaceModules };
};

const createInstallableCatalogFixture = async () => {
  const manifest = createManifest("external.catalog-hello", {
    kind: "external",
    packageName: "@mdwrk/extension-catalog-hello",
    displayName: { defaultMessage: "Catalog Hello" },
    description: { defaultMessage: "Sample external catalog extension." },
    publisher: "demo-catalog",
    capabilities: ["view.register", "actionRail.register", "notification.publish", "settings.read"],
    distribution: {
      channel: "catalog",
      format: "esm",
    },
  });
  const moduleCode = `
const manifest = ${JSON.stringify(manifest)};
export default {
  manifest,
  async activate(context) {
    context.registerView({
      id: "external.catalog-hello.view",
      title: { defaultMessage: "Catalog Hello" },
      description: { defaultMessage: "Catalog hello view" },
      location: "panel",
      allowMultiple: false,
      render: () => "Catalog Hello"
    });
  }
};
`;
  const signedManifest = {
    schemaVersion: 1,
    manifest,
    signature: {
      keyId: "unsigned-test",
      algorithm: "ecdsa-p256-sha256",
      signature: "",
      signedAt: new Date(0).toISOString(),
    },
  };
  const manifestText = JSON.stringify(manifest);
  const signedManifestText = JSON.stringify(signedManifest);
  const catalog = {
    schemaVersion: 1 as const,
    generatedAt: new Date(0).toISOString(),
    publisher: "demo-catalog",
    extensions: [
      {
        entryId: "external.catalog-hello@1.0.0",
        extensionId: manifest.id,
        packageName: manifest.packageName,
        version: manifest.version,
        displayName: manifest.displayName,
        description: manifest.description,
        publisher: manifest.publisher,
        categories: ["sample"],
        keywords: ["hello", "catalog"],
        capabilities: manifest.capabilities,
        compatibility: manifest.compatibility,
        supportedLocales: [],
        urls: {
          manifest: "https://extensions.example/catalog-hello/manifest.json",
          signedManifest: "https://extensions.example/catalog-hello/signed-manifest.json",
          module: "https://extensions.example/catalog-hello/index.js",
          integrity: "https://extensions.example/catalog-hello/integrity.json",
        },
        integrity: {
          manifest: {
            algorithm: "sha256" as const,
            digest: await digestText(canonicalizeJson(manifest)),
          },
          module: {
            algorithm: "sha256" as const,
            digest: await digestText(moduleCode),
          },
        },
      },
    ],
  };
  return {
    catalog,
    manifest,
    transport: createInMemoryExtensionArtifactTransport({
      "https://extensions.example/catalog-hello/manifest.json": manifestText,
      "https://extensions.example/catalog-hello/signed-manifest.json": signedManifestText,
      "https://extensions.example/catalog-hello/index.js": moduleCode,
    }),
  };
};

describe("extension-runtime", () => {
  it("validates manifests", () => {
    const invalid = createManifest("invalid", { displayName: { defaultMessage: "" } });
    const issues = validateExtensionManifest(invalid);
    expect(issues.some((issue) => issue.path === "displayName.defaultMessage")).toBe(true);
  });

  it("requires workspace modules to declare settings and supported layouts", () => {
    const invalid = createManifest("invalid-workspace-module", {
      contributions: {
        commands: [],
        views: [
          {
            id: "invalid-workspace-module.view",
            title: { defaultMessage: "Invalid" },
            location: "main",
          },
        ],
        components: [],
        actionRail: [],
        settingsSections: [],
        workspaceModules: [
          {
            id: "invalid-workspace-module.module",
            title: { defaultMessage: "Invalid" },
            primaryViewId: "invalid-workspace-module.view",
            explorerViewId: "",
            supportedLayouts: ["grid" as never],
            defaultLayout: "grid" as never,
            settingsSectionId: "missing",
            capabilityProfiles: ["workspace.module.base"],
            actions: [],
          },
        ],
      },
    });
    const issues = validateExtensionManifest(invalid);
    expect(issues.some((issue) => issue.path.endsWith("settingsSectionId"))).toBe(true);
    expect(issues.some((issue) => issue.path.endsWith("explorerViewId"))).toBe(true);
    expect(issues.some((issue) => issue.path.endsWith("supportedLayouts"))).toBe(true);
  });

  it("activates and deactivates extensions", async () => {
    const { host } = createHost();
    const { sink, views, rail } = createSink();
    const storage = createInMemoryExtensionRuntimeStorage();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage });

    const manifest = createManifest("runtime-smoke");
    const extension: MarkdownWorkspaceExtension = {
      manifest,
      async activate(context) {
        context.registerView({
          id: `${manifest.id}.view`,
          title: { defaultMessage: "Runtime Smoke" },
          description: { defaultMessage: "Smoke view" },
          location: "modal",
          allowMultiple: false,
          render: () => null,
        });
        context.registerActionRailItem({
          id: `${manifest.id}.rail`,
          title: { defaultMessage: "Runtime Smoke" },
          icon: { kind: "lucide", name: "Plug" },
          target: { kind: "view", viewId: `${manifest.id}.view` },
        });
      },
    };

    runtime.registerBundledExtension({ manifest, activation: "eager", load: async () => extension });
    await runtime.start();

    expect(runtime.get(manifest.id)?.status).toBe("active");
    expect(views.map((view) => view.id)).toContain(`${manifest.id}.view`);
    expect(rail.map((item) => item.id)).toContain(`${manifest.id}.rail`);

    await runtime.deactivate(manifest.id);
    expect(runtime.get(manifest.id)?.status).toBe("registered");
  });

  it("registers workspace modules through the runtime sink", async () => {
    const { host } = createHost();
    const { sink, workspaceModules } = createSink();
    const storage = createInMemoryExtensionRuntimeStorage();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage });
    const manifest = createManifest("workspace-module", {
      contributions: {
        commands: [],
        views: [
          {
            id: "workspace-module.view",
            title: { defaultMessage: "Workspace Module" },
            location: "main",
          },
          {
            id: "workspace-module.explorer",
            title: { defaultMessage: "Workspace Module Explorer" },
            location: "sidebar",
          },
        ],
        components: [],
        actionRail: [],
        settingsSections: [
          {
            id: "workspace-module.settings",
            title: { defaultMessage: "Workspace Module Settings" },
          },
        ],
        workspaceModules: [
          {
            id: "workspace-module.module",
            title: { defaultMessage: "Workspace Module" },
            primaryViewId: "workspace-module.view",
            explorerViewId: "workspace-module.explorer",
            supportedLayouts: ["single", "split"],
            defaultLayout: "split",
            settingsSectionId: "workspace-module.settings",
            capabilityProfiles: ["workspace.module.base"],
            actions: [],
          },
        ],
      },
    });

    runtime.registerBundledExtension({
      manifest,
      activation: "eager",
      load: async () => ({
        manifest,
        async activate(context) {
          context.registerWorkspaceModule({
            ...manifest.contributions.workspaceModules![0],
            render: () => null,
            renderExplorer: () => null,
          });
        },
      }),
    });

    await runtime.start();
    expect(workspaceModules.map((module) => module.id)).toContain("workspace-module.module");
  });

  it("persists extension config with namespaced keys", async () => {
    const { host } = createHost();
    const { sink } = createSink();
    const storage = createInMemoryExtensionRuntimeStorage();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage });
    const manifest = createManifest("configurable");

    runtime.registerBundledExtension({
      manifest,
      activation: "eager",
      load: async () => ({
        manifest,
        async activate(context) {
          await context.config.set("token", "abc123");
        },
      }),
    });

    await runtime.start();
    expect(await storage.get(getExtensionConfigKey(manifest.id, "token"))).toBe("abc123");
  });

  it("rejects incompatible extensions", async () => {
    const { host, diagnostics } = createHost();
    const { sink } = createSink();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
    const manifest = createManifest("incompatible", {
      compatibility: {
        manifestVersion: 1,
        hostApi: "2.0.0",
        runtime: "1.0.0",
        app: ">=0.1.0",
        themeContract: "1.0.0",
      },
    });
    runtime.registerBundledExtension({ manifest, activation: "eager", load: async () => ({ manifest, activate() {} }) });

    await runtime.start();
    expect(runtime.get(manifest.id)?.status).toBe("incompatible");
    expect(diagnostics[manifest.id]?.length ?? 0).toBeGreaterThan(0);
    expect(evaluateExtensionCompatibility(manifest, {
      hostApiVersion: host.apiVersion,
      hostVersion: host.environment.hostVersion,
      runtimeVersion: "1.0.0",
      themeContractVersion: "1.0.0",
    }).compatible).toBe(false);
  });

  it("contains runtime errors so other extensions can still activate", async () => {
    const { host } = createHost();
    const { sink, views } = createSink();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
    const failingManifest = createManifest("failing");
    const healthyManifest = createManifest("healthy");

    runtime.registerBundledExtension({
      manifest: failingManifest,
      activation: "eager",
      load: async () => ({
        manifest: failingManifest,
        async activate() {
          throw new Error("boom");
        },
      }),
    });

    runtime.registerBundledExtension({
      manifest: healthyManifest,
      activation: "eager",
      load: async () => ({
        manifest: healthyManifest,
        async activate(context) {
          context.registerView({
            id: `${healthyManifest.id}.view`,
            title: { defaultMessage: "Healthy" },
            description: { defaultMessage: "Healthy view" },
            location: "modal",
            allowMultiple: false,
            render: () => null,
          });
        },
      }),
    });

    await runtime.start();
    expect(runtime.get(failingManifest.id)?.status).toBe("error");
    expect(runtime.get(healthyManifest.id)?.status).toBe("active");
    expect(views.map((view) => view.id)).toContain(`${healthyManifest.id}.view`);
  });

  it("supports lazy activation", async () => {
    const { host } = createHost();
    const { sink } = createSink();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
    const manifest = createManifest("lazy");
    let activated = 0;

    runtime.registerBundledExtension({
      manifest,
      activation: "lazy",
      load: async () => ({
        manifest,
        async activate() {
          activated += 1;
        },
      }),
    });

    await runtime.start();
    expect(runtime.get(manifest.id)?.status).toBe("registered");
    expect(activated).toBe(0);
    await runtime.activate(manifest.id);
    expect(runtime.get(manifest.id)?.status).toBe("active");
    expect(activated).toBe(1);
  });

  it("retains catalog-installed packages across restarts until explicit removal", async () => {
    const storage = createInMemoryExtensionRuntimeStorage();
    const fixture = await createInstallableCatalogFixture();
    const firstHost = createHost();
    const firstSink = createSink();
    const firstRuntime = createExtensionRuntime({
      host: firstHost.host,
      registrationSink: firstSink.sink,
      storage,
      transport: fixture.transport,
      trustPolicy: {
        allowUnsigned: true,
        allowIntegrityOnly: true,
        allowedExtensionIds: [fixture.manifest.id],
        allowedPackageNames: [fixture.manifest.packageName],
        allowedPublishers: ["demo-catalog"],
      },
      now: () => 1000,
    });

    firstRuntime.registerCatalog(fixture.catalog, { catalogId: "demo-catalog" });
    await firstRuntime.start();
    const record = await firstRuntime.installFromCatalogEntry("external.catalog-hello@1.0.0", { autoActivate: true });

    expect(record.installedAt).toBe(1000);
    expect(firstRuntime.get(fixture.manifest.id)?.source).toBe("installed");
    expect(firstRuntime.get(fixture.manifest.id)?.status).toBe("active");
    expect(firstSink.views.map((view) => view.id)).toContain("external.catalog-hello.view");
    expect(await storage.get(EXTENSION_INSTALL_INDEX_KEY)).toEqual([fixture.manifest.id]);

    await firstRuntime.setEnabled(fixture.manifest.id, false);
    expect(await storage.get(getExtensionEnabledStateKey(fixture.manifest.id))).toBe(false);
    await firstRuntime.stop();

    const secondHost = createHost();
    const secondSink = createSink();
    const secondRuntime = createExtensionRuntime({
      host: secondHost.host,
      registrationSink: secondSink.sink,
      storage,
      transport: fixture.transport,
      trustPolicy: {
        allowUnsigned: true,
        allowIntegrityOnly: true,
        allowedExtensionIds: [fixture.manifest.id],
        allowedPackageNames: [fixture.manifest.packageName],
        allowedPublishers: ["demo-catalog"],
      },
      now: () => 2000,
    });

    await secondRuntime.start();
    expect(secondRuntime.get(fixture.manifest.id)?.source).toBe("installed");
    expect(secondRuntime.get(fixture.manifest.id)?.enabled).toBe(false);
    expect(secondRuntime.get(fixture.manifest.id)?.status).toBe("disabled");

    await secondRuntime.activate(fixture.manifest.id);
    expect(secondRuntime.get(fixture.manifest.id)?.status).toBe("active");
    expect(secondSink.views.map((view) => view.id)).toContain("external.catalog-hello.view");

    await secondRuntime.removeInstalledExtension(fixture.manifest.id);
    expect(secondRuntime.get(fixture.manifest.id)).toBeUndefined();
    expect(await storage.get(EXTENSION_INSTALL_INDEX_KEY)).toEqual([]);
    expect(await storage.get(getInstalledExtensionRecordKey(fixture.manifest.id))).toBeNull();
    expect(await storage.get(getInstalledExtensionModuleKey(fixture.manifest.id))).toBeNull();
    expect(await storage.get(getExtensionEnabledStateKey(fixture.manifest.id))).toBeNull();
  });

  it("derives extension intent from manifest capabilities and runtime state", async () => {
    const { host } = createHost();
    const { sink } = createSink();
    const runtime = createExtensionRuntime({ host, registrationSink: sink, storage: createInMemoryExtensionRuntimeStorage() });
    const manifest = createManifest("core.gemini-agent", {
      capabilities: ["view.register", "settings.read", "settings.write", "editor.read", "editor.write", "selection.read", "network.fetch"],
      settingsSchema: {
        version: 1,
        sections: [],
        fields: [],
      },
    });

    runtime.registerBundledExtension({
      manifest,
      activation: "lazy",
      load: async () => ({ manifest, activate() {} }),
    });
    await runtime.start();

    const snapshot = runtime.get(manifest.id);
    expect(snapshot).toBeDefined();
    const intent = deriveExtensionIntent(snapshot!);

    expect(intent.primaryWorkflow).toEqual(["Configure provider", "Generate a draft", "Review before writeback"]);
    expect(intent.contentAccess.readsEditor).toBe(true);
    expect(intent.contentAccess.writesEditor).toBe(true);
    expect(intent.networkAccess).toBe(true);
    expect(intent.persistenceAccess).toBe(true);
    expect(intent.dangerousAction).toContain("write");
    expect(intent.trust.label).toBe("Bundled");
    expect(intent.recoveryActions).toContain("Open extension settings");
  });
});
