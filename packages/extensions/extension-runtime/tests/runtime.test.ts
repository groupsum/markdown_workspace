import { describe, expect, it } from "vitest";
import type {
  ExtensionHost,
  ExtensionLocaleCatalog,
  MarkdownWorkspaceExtension,
  RegisteredActionRailItem,
  RegisteredCommand,
  RegisteredSettingsSection,
  RegisteredView,
} from "@mdwrk/extension-host";
import type { ExtensionManifest } from "@mdwrk/extension-manifest";
import { createExtensionRuntime } from "../src/runtime.js";
import { evaluateExtensionCompatibility } from "../src/compatibility.js";
import { createInMemoryExtensionRuntimeStorage, getExtensionActivationStateKey, getExtensionConfigKey } from "../src/storage.js";
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
  icon: { kind: "lucide", name: "Puzzle" },
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
      async getActiveProject() { return null; },
      async getActiveFile() { return null; },
      async readFile() { return ""; },
      async writeFile() {},
    },
    i18n: {
      async getLocale() { return "en"; },
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

  const sink: ExtensionRuntimeRegistrationSink = {
    registerCommand(_extensionId, command) {
      commands.push(command);
      return { dispose() {} };
    },
    registerView(_extensionId, view) {
      views.push(view);
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

  return { sink, commands, views, rail, settings };
};

describe("extension-runtime", () => {
  it("validates manifests", () => {
    const invalid = createManifest("invalid", { displayName: { defaultMessage: "" } });
    const issues = validateExtensionManifest(invalid);
    expect(issues.some((issue) => issue.path === "displayName.defaultMessage")).toBe(true);
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
          icon: { kind: "lucide", name: "Puzzle" },
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

  it("rehydrates lazy activation intent from storage", async () => {
    const { host } = createHost();
    const { sink } = createSink();
    const storage = createInMemoryExtensionRuntimeStorage();
    const manifest = createManifest("lazy-persisted");
    let activated = 0;

    const registerRuntime = () => {
      const runtime = createExtensionRuntime({ host, registrationSink: sink, storage });
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
      return runtime;
    };

    const firstRuntime = registerRuntime();
    await firstRuntime.start();
    await firstRuntime.activate(manifest.id);
    expect(await storage.get(getExtensionActivationStateKey(manifest.id))).toBe(true);
    expect(activated).toBe(1);

    const secondRuntime = registerRuntime();
    await secondRuntime.start();
    expect(secondRuntime.get(manifest.id)?.status).toBe("active");
    expect(activated).toBe(2);
  });
});
