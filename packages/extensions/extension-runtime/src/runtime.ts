import type { ExtensionCapability } from "@markdown-workspace/extension-manifest";
import type {
  DiagnosticRecord,
  Disposable,
  ExtensionConfigurationStore,
  ExtensionContext,
  ExtensionHost,
  ExtensionLocaleCatalog,
  HostActionRailApi,
  HostCommandApi,
  HostDiagnosticsApi,
  HostEditorApi,
  HostI18nApi,
  HostLoggerApi,
  HostNotificationApi,
  HostSettingsApi,
  HostThemeApi,
  HostViewApi,
  HostWorkspaceApi,
  MarkdownWorkspaceExtension,
  RegisteredComponent,
} from "@markdown-workspace/extension-host";
import { EXTENSION_HOST_API_VERSION } from "@markdown-workspace/extension-host";
import { THEME_CONTRACT_VERSION } from "@markdown-workspace/theme-contract";
import {
  createFetchExtensionArtifactTransport,
  evaluateCatalogEntryPolicy,
  fetchInstallableCatalogPayload,
  validateCatalogDocument,
} from "./catalog.js";
import { evaluateExtensionCompatibility } from "./compatibility.js";
import { createExtensionLoader } from "./loader.js";
import { createExtensionRegistry } from "./registry.js";
import {
  createExtensionConfigurationStore,
  EXTENSION_INSTALL_INDEX_KEY,
  getExtensionEnabledStateKey,
  getInstalledExtensionModuleKey,
  getInstalledExtensionRecordKey,
} from "./storage.js";
import { EXTENSION_RUNTIME_VERSION } from "./version.js";
import type {
  BundledExtensionCatalogEntry,
  ExtensionRuntime,
  ExtensionRuntimeErrorRecord,
  ExtensionRuntimeExtensionSnapshot,
  ExtensionRuntimeOptions,
  ExtensionRuntimeSnapshot,
  ExtensionRuntimeStatus,
  InstalledExtensionCatalogEntry,
  InstalledExtensionRecord,
  RegisteredExternalCatalogEntry,
  RegisteredRuntimeExtensionCatalogEntry,
} from "./types.js";

interface RuntimeExtensionState {
  entry: RegisteredRuntimeExtensionCatalogEntry;
  enabled: boolean;
  status: ExtensionRuntimeStatus;
  diagnostics: DiagnosticRecord[];
  lastError: ExtensionRuntimeErrorRecord | null;
  lastActivatedAt: number | null;
  loadedModule: MarkdownWorkspaceExtension | null;
  activeContext: ExtensionContext | null;
  activationTask: Promise<void> | null;
  deactivationTask: Promise<void> | null;
  runtimeDisposables: Disposable[];
  components: Map<string, RegisteredComponent>;
  services: Map<string, unknown>;
}

const createEmitter = () => {
  const listeners = new Set<() => void>();
  return {
    emit(): void {
      for (const listener of Array.from(listeners)) {
        listener();
      }
    },
    subscribe(listener: () => void): () => void {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

const toErrorRecord = (phase: ExtensionRuntimeErrorRecord["phase"], error: unknown): ExtensionRuntimeErrorRecord => {
  if (error instanceof Error) {
    return {
      phase,
      message: error.message,
      detail: error.stack,
    };
  }
  return {
    phase,
    message: String(error),
  };
};

const asDiagnostic = (code: string, severity: DiagnosticRecord["severity"], record: ExtensionRuntimeErrorRecord | string): DiagnosticRecord => {
  if (typeof record === "string") {
    return { code, severity, message: record };
  }
  return {
    code,
    severity,
    message: record.message,
    detail: record.detail,
  };
};

function createDeniedProxy<T extends object>(
  extensionId: string,
  capability: ExtensionCapability,
  apiName: string,
  api: T,
  allow: readonly (keyof T)[],
): T {
  const allowed = new Set<string>(allow.map((key) => String(key)));
  return new Proxy(api, {
    get(target, property, receiver) {
      if (typeof property === "string" && !allowed.has(property)) {
        return async () => {
          throw new Error(`Extension '${extensionId}' lacks capability '${capability}' required for ${apiName}.${property}().`);
        };
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

function createScopedHost(host: ExtensionHost, extensionId: string, capabilities: readonly ExtensionCapability[]): ExtensionHost {
  const granted = new Set(capabilities);

  const commands: HostCommandApi = granted.has("command.invoke")
    ? host.commands
    : createDeniedProxy(extensionId, "command.invoke", "commands", host.commands, []);

  const views: HostViewApi = granted.has("view.register")
    ? host.views
    : createDeniedProxy(extensionId, "view.register", "views", host.views, []);

  const actionRail: HostActionRailApi = granted.has("actionRail.register")
    ? host.actionRail
    : createDeniedProxy(extensionId, "actionRail.register", "actionRail", host.actionRail, []);

  const settings: HostSettingsApi = {
    get: granted.has("settings.read") ? host.settings.get : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.read'.`); },
    watch: granted.has("settings.read") ? host.settings.watch : () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.read'.`); },
    set: granted.has("settings.write") ? host.settings.set : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.write'.`); },
    remove: granted.has("settings.write") ? host.settings.remove : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.write'.`); },
  };

  const notifications: HostNotificationApi = {
    info: granted.has("notification.publish") ? host.notifications.info : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
    warn: granted.has("notification.publish") ? host.notifications.warn : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
    error: granted.has("notification.publish") ? host.notifications.error : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
  };

  const theme: HostThemeApi = {
    getToken: granted.has("theme.read") ? host.theme.getToken : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    getTokenMap: granted.has("theme.read") ? host.theme.getTokenMap : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    getTokens: granted.has("theme.read") ? host.theme.getTokens : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    getClassNames: granted.has("theme.read") ? host.theme.getClassNames : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    getThemeBridge: granted.has("theme.read") ? host.theme.getThemeBridge : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    getThemeBridgeVariables: granted.has("theme.read") ? host.theme.getThemeBridgeVariables : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    exportTheme: granted.has("theme.read") ? host.theme.exportTheme : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    exportThemeCss: granted.has("theme.read") ? host.theme.exportThemeCss : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    supportsClass: granted.has("theme.read") ? host.theme.supportsClass : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.read'.`); },
    setDraftToken: granted.has("theme.write") ? host.theme.setDraftToken : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.write'.`); },
    setDraftTokens: granted.has("theme.write") ? host.theme.setDraftTokens : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.write'.`); },
    previewTheme: granted.has("theme.write") ? host.theme.previewTheme : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.write'.`); },
    applyDraft: granted.has("theme.write") ? host.theme.applyDraft : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.write'.`); },
    discardDraft: granted.has("theme.write") ? host.theme.discardDraft : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'theme.write'.`); },
  };

  const editor: HostEditorApi = {
    getActiveDocument: granted.has("editor.read") ? host.editor.getActiveDocument : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.read'.`); },
    getSelections: granted.has("selection.read") ? host.editor.getSelections : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'selection.read'.`); },
    insertText: granted.has("editor.write") ? host.editor.insertText : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
    replaceSelections: granted.has("editor.write") ? host.editor.replaceSelections : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
    setDocumentContent: granted.has("editor.write") ? host.editor.setDocumentContent : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
  };

  const workspace: HostWorkspaceApi = {
    listProjects: granted.has("workspace.read") ? host.workspace.listProjects : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
    getActiveProject: granted.has("workspace.read") ? host.workspace.getActiveProject : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
    getActiveFile: granted.has("workspace.read") ? host.workspace.getActiveFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
    readFile: granted.has("workspace.read") ? host.workspace.readFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
    writeFile: granted.has("workspace.write") ? host.workspace.writeFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.write'.`); },
  };

  const diagnostics: HostDiagnosticsApi = host.diagnostics;
  const i18n: HostI18nApi = host.i18n;
  const logger: HostLoggerApi = host.logger;

  return {
    apiVersion: host.apiVersion,
    commands,
    views,
    actionRail,
    settings,
    notifications,
    theme,
    editor,
    workspace,
    i18n,
    diagnostics,
    logger,
    environment: {
      ...host.environment,
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      grantedCapabilities: capabilities,
    },
  };
}

function toBase64(value: string): string {
  const nodeBuffer = (globalThis as typeof globalThis & { Buffer?: { from(input: string, encoding?: string): { toString(encoding: string): string } } }).Buffer;
  if (nodeBuffer) {
    return nodeBuffer.from(value, "utf8").toString("base64");
  }
  if (typeof btoa === "function") {
    return btoa(unescape(encodeURIComponent(value)));
  }
  throw new Error("Base64 encoding is unavailable in this runtime.");
}

function createExternalModuleFactory(record: InstalledExtensionRecord, moduleCode: string) {
  const source = `${moduleCode}\n//# sourceURL=${record.moduleUrl}`;
  return async (): Promise<MarkdownWorkspaceExtension> => {
    const url = `data:text/javascript;base64,${toBase64(source)}`;
    return await import(url) as unknown as MarkdownWorkspaceExtension;
  };
}

export function createExtensionRuntime(options: ExtensionRuntimeOptions): ExtensionRuntime {
  const registry = createExtensionRegistry();
  const loader = createExtensionLoader();
  const emitter = createEmitter();
  const states = new Map<string, RuntimeExtensionState>();
  const externalCatalogEntries = new Map<string, RegisteredExternalCatalogEntry>();
  const installedRegistrationDisposables = new Map<string, Disposable>();
  const now = options.now ?? (() => Date.now());
  const transport = options.transport ?? (typeof fetch === "function" ? createFetchExtensionArtifactTransport() : undefined);
  let started = false;
  let installedRehydrated = false;

  const listCatalogEntries = () => Array.from(externalCatalogEntries.values())
    .map((registered) => {
      const policyIssues = evaluateCatalogEntryPolicy(registered.entry, options.trustPolicy);
      return {
        entryId: registered.entryId,
        catalogId: registered.catalogId,
        extensionId: registered.entry.extensionId,
        packageName: registered.entry.packageName,
        version: registered.entry.version,
        displayName: registered.entry.displayName,
        description: registered.entry.description,
        publisher: registered.entry.publisher,
        installed: registry.get(registered.entry.extensionId)?.source === "installed",
        policyTrusted: policyIssues.length === 0,
        policyIssues,
      };
    })
    .sort((left, right) => left.displayName.defaultMessage.localeCompare(right.displayName.defaultMessage));

  const listStates = (): readonly ExtensionRuntimeExtensionSnapshot[] => registry.list().map((entry) => {
    const state = states.get(entry.id);
    const hostGranted = new Set(options.host.environment.grantedCapabilities ?? entry.manifest.capabilities);
    const grantedCapabilities = entry.manifest.capabilities.filter((capability) => hostGranted.has(capability));
    const missingCapabilities = entry.manifest.capabilities.filter((capability) => !hostGranted.has(capability));
    const compatibility = evaluateExtensionCompatibility(entry.manifest, {
      hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
      hostVersion: options.host.environment.hostVersion,
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      themeContractVersion: THEME_CONTRACT_VERSION,
    });
    return {
      id: entry.id,
      manifest: entry.manifest,
      source: entry.source,
      activation: entry.activation,
      enabled: state?.enabled ?? entry.manifest.enabledByDefault,
      status: state?.status ?? (compatibility.compatible ? (entry.manifest.enabledByDefault ? "registered" : "disabled") : "incompatible"),
      compatibility,
      grantedCapabilities,
      missingCapabilities,
      diagnostics: Object.freeze([...(state?.diagnostics ?? [])]),
      componentIds: Object.freeze(Array.from(state?.components.keys() ?? [])),
      serviceTokens: Object.freeze(Array.from(state?.services.keys() ?? [])),
      lastActivatedAt: state?.lastActivatedAt ?? null,
      lastError: state?.lastError ?? null,
    } satisfies ExtensionRuntimeExtensionSnapshot;
  });

  const getSnapshot = (): ExtensionRuntimeSnapshot => ({
    started,
    extensions: listStates(),
    catalogEntries: listCatalogEntries(),
  });

  const ensureState = (entry: RegisteredRuntimeExtensionCatalogEntry): RuntimeExtensionState => {
    const existing = states.get(entry.id);
    if (existing) {
      existing.entry = entry;
      return existing;
    }
    const initial: RuntimeExtensionState = {
      entry,
      enabled: entry.manifest.enabledByDefault,
      status: "registered",
      diagnostics: [],
      lastError: null,
      lastActivatedAt: null,
      loadedModule: null,
      activeContext: null,
      activationTask: null,
      deactivationTask: null,
      runtimeDisposables: [],
      components: new Map(),
      services: new Map(),
    };
    states.set(entry.id, initial);
    return initial;
  };

  const publishDiagnostic = async (extensionId: string, record: DiagnosticRecord): Promise<void> => {
    const state = states.get(extensionId);
    if (state) {
      state.diagnostics.push(record);
    }
    await options.host.diagnostics.publish(extensionId, record);
    emitter.emit();
  };

  const clearDiagnostics = async (extensionId: string): Promise<void> => {
    const state = states.get(extensionId);
    if (state) {
      state.diagnostics = [];
    }
    await options.host.diagnostics.clear(extensionId);
    emitter.emit();
  };

  const assertRegistrationCapability = (state: RuntimeExtensionState, capability: ExtensionCapability): void => {
    const hostGranted = new Set(options.host.environment.grantedCapabilities ?? state.entry.manifest.capabilities);
    if (!hostGranted.has(capability) || !state.entry.manifest.capabilities.includes(capability)) {
      const error = toErrorRecord("activate", new Error(`Extension '${state.entry.id}' lacks required capability '${capability}' for this registration.`));
      state.lastError = error;
      state.diagnostics.push(asDiagnostic("EXT_RUNTIME_CAPABILITY_DENIED", "error", error));
      void options.host.diagnostics.publish(state.entry.id, asDiagnostic("EXT_RUNTIME_CAPABILITY_DENIED", "error", error));
      throw new Error(error.message);
    }
  };

  const buildContext = (state: RuntimeExtensionState, scopedHost: ExtensionHost): ExtensionContext => {
    const config = createExtensionConfigurationStore(state.entry.id, options.storage);
    const grantedSet = new Set(options.host.environment.grantedCapabilities ?? state.entry.manifest.capabilities);
    const grantedCapabilities = state.entry.manifest.capabilities.filter((capability) => grantedSet.has(capability));

    const registerDisposable = (disposable: Disposable): Disposable => {
      state.runtimeDisposables.push(disposable);
      return disposable;
    };

    return {
      extensionId: state.entry.id,
      manifest: state.entry.manifest,
      capabilities: grantedCapabilities,
      host: scopedHost,
      environment: scopedHost.environment,
      config,
      registerCommand(command) {
        return registerDisposable(options.registrationSink.registerCommand(state.entry.id, command));
      },
      registerView(view) {
        assertRegistrationCapability(state, "view.register");
        return registerDisposable(options.registrationSink.registerView(state.entry.id, view));
      },
      registerComponent(component) {
        assertRegistrationCapability(state, "component.register");
        state.components.set(component.id, component);
        const disposable = options.registrationSink.registerComponent?.(state.entry.id, component) ?? {
          dispose() {
            state.components.delete(component.id);
          },
        };
        return registerDisposable({
          dispose() {
            disposable.dispose();
            state.components.delete(component.id);
          },
        });
      },
      registerActionRailItem(item) {
        assertRegistrationCapability(state, "actionRail.register");
        return registerDisposable(options.registrationSink.registerActionRailItem(state.entry.id, item));
      },
      registerSettingsSection(section) {
        return registerDisposable(options.registrationSink.registerSettingsSection(state.entry.id, section));
      },
      registerLocaleCatalog(catalog: ExtensionLocaleCatalog) {
        return registerDisposable(scopedHost.i18n.registerCatalog(state.entry.id, catalog));
      },
      registerLocaleCatalogLoader(loader) {
        return registerDisposable(scopedHost.i18n.registerCatalogLoader(state.entry.id, loader));
      },
      registerService<T>(token: string, service: T) {
        state.services.set(token, service);
        return registerDisposable({
          dispose() {
            state.services.delete(token);
          },
        });
      },
    } satisfies ExtensionContext;
  };

  const applyStateFromEntry = async (state: RuntimeExtensionState): Promise<void> => {
    const compatibility = evaluateExtensionCompatibility(state.entry.manifest, {
      hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
      hostVersion: options.host.environment.hostVersion,
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      themeContractVersion: THEME_CONTRACT_VERSION,
    });
    state.status = !compatibility.compatible
      ? "incompatible"
      : state.enabled
        ? (state.entry.activation === "eager" && started ? "activating" : "registered")
        : "disabled";
    if (!compatibility.compatible) {
      const issueText = compatibility.issues.map((issue) => issue.message).join(" ");
      const record = toErrorRecord("compatibility", new Error(issueText));
      state.lastError = record;
      await publishDiagnostic(state.entry.id, asDiagnostic("EXT_RUNTIME_COMPATIBILITY", "error", record));
    }
  };

  const activateState = async (state: RuntimeExtensionState): Promise<void> => {
    if (state.status === "active") return;
    if (state.activationTask) return await state.activationTask;

    const compatibility = evaluateExtensionCompatibility(state.entry.manifest, {
      hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
      hostVersion: options.host.environment.hostVersion,
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      themeContractVersion: THEME_CONTRACT_VERSION,
    });
    if (!compatibility.compatible) {
      state.status = "incompatible";
      const issueText = compatibility.issues.map((issue) => issue.message).join(" ");
      const error = toErrorRecord("compatibility", new Error(issueText));
      state.lastError = error;
      await publishDiagnostic(state.entry.id, asDiagnostic("EXT_RUNTIME_COMPATIBILITY", "error", error));
      return;
    }

    state.activationTask = (async () => {
      state.enabled = true;
      state.status = "activating";
      emitter.emit();
      await clearDiagnostics(state.entry.id);

      const hostGranted = new Set(options.host.environment.grantedCapabilities ?? state.entry.manifest.capabilities);
      const grantedCapabilities = state.entry.manifest.capabilities.filter((capability) => hostGranted.has(capability));
      const missingCapabilities = state.entry.manifest.capabilities.filter((capability) => !hostGranted.has(capability));

      try {
        if (missingCapabilities.length > 0) {
          await publishDiagnostic(state.entry.id, {
            severity: "warning",
            code: "EXT_RUNTIME_CAPABILITY_TRIMMED",
            message: `Host did not grant all requested capabilities: ${missingCapabilities.join(", ")}`,
          });
        }

        const module = await loader.load(state.entry);
        const scopedHost = createScopedHost(options.host, state.entry.id, grantedCapabilities);
        const context = buildContext(state, scopedHost);
        state.loadedModule = module;
        state.activeContext = context;

        const activationResult = await module.activate(context);
        if (activationResult && typeof activationResult === "object") {
          const maybeDisposable = activationResult as Partial<Disposable>;
          if (typeof maybeDisposable.dispose === "function") {
            state.runtimeDisposables.push(maybeDisposable as Disposable);
          } else {
            const nestedDisposable = (activationResult as { readonly dispose?: Disposable }).dispose;
            if (nestedDisposable && typeof nestedDisposable.dispose === "function") {
              state.runtimeDisposables.push(nestedDisposable);
            }
          }
        }

        state.status = "active";
        state.lastActivatedAt = now();
      } catch (error) {
        const record = toErrorRecord("activate", error);
        state.lastError = record;
        state.status = "error";
        for (const disposable of [...state.runtimeDisposables].reverse()) {
          disposable.dispose();
        }
        state.runtimeDisposables = [];
        state.components.clear();
        state.services.clear();
        state.activeContext = null;
        state.loadedModule = null;
        await publishDiagnostic(state.entry.id, asDiagnostic("EXT_RUNTIME_ACTIVATE_FAILED", "error", record));
      } finally {
        state.activationTask = null;
        emitter.emit();
      }
    })();

    return await state.activationTask;
  };

  const deactivateState = async (state: RuntimeExtensionState): Promise<void> => {
    if (state.status !== "active" && !state.activeContext) {
      state.status = state.enabled ? "registered" : "disabled";
      emitter.emit();
      return;
    }
    if (state.deactivationTask) return await state.deactivationTask;

    state.deactivationTask = (async () => {
      state.status = "deactivating";
      emitter.emit();
      try {
        if (state.loadedModule?.deactivate && state.activeContext) {
          await state.loadedModule.deactivate(state.activeContext);
        }
        for (const disposable of [...state.runtimeDisposables].reverse()) {
          disposable.dispose();
        }
        state.runtimeDisposables = [];
        state.components.clear();
        state.services.clear();
        state.activeContext = null;
        state.loadedModule = null;
        state.status = state.enabled ? "registered" : "disabled";
      } catch (error) {
        const record = toErrorRecord("deactivate", error);
        state.lastError = record;
        state.status = "error";
        await publishDiagnostic(state.entry.id, asDiagnostic("EXT_RUNTIME_DEACTIVATE_FAILED", "error", record));
      } finally {
        state.deactivationTask = null;
        emitter.emit();
      }
    })();

    return await state.deactivationTask;
  };

  const readInstalledIndex = async (): Promise<string[]> => {
    return await options.storage.get<string[]>(EXTENSION_INSTALL_INDEX_KEY) ?? [];
  };

  const writeInstalledIndex = async (next: readonly string[]): Promise<void> => {
    const unique = Array.from(new Set(next)).sort((left, right) => left.localeCompare(right));
    await options.storage.set(EXTENSION_INSTALL_INDEX_KEY, unique);
  };

  const registerInstalledRecord = async (record: InstalledExtensionRecord, moduleCode: string): Promise<void> => {
    const existing = registry.get(record.manifest.id);
    if (existing?.source === "bundled") {
      throw new Error(`Cannot install external extension '${record.manifest.id}' because a bundled extension with the same id is already registered.`);
    }
    if (existing?.source === "installed") {
      const existingState = states.get(record.manifest.id);
      if (existingState) {
        await deactivateState(existingState);
      }
      installedRegistrationDisposables.get(record.manifest.id)?.dispose();
      installedRegistrationDisposables.delete(record.manifest.id);
      registry.unregister(record.manifest.id);
      states.delete(record.manifest.id);
    }

    const entry: InstalledExtensionCatalogEntry = {
      source: "installed",
      manifest: record.manifest,
      activation: "lazy",
      installedRecord: record,
      load: createExternalModuleFactory(record, moduleCode),
    };
    const disposable = registry.registerInstalled(entry);
    installedRegistrationDisposables.set(record.manifest.id, disposable);
    const registered = registry.get(record.manifest.id);
    if (!registered) {
      throw new Error(`Failed to register installed extension '${record.manifest.id}'.`);
    }
    const state = ensureState(registered);
    const persistedEnabled = await options.storage.get<boolean>(getExtensionEnabledStateKey(record.manifest.id));
    state.enabled = persistedEnabled ?? record.manifest.enabledByDefault;
    await applyStateFromEntry(state);
    emitter.emit();
  };

  const rehydrateInstalledExtensions = async (): Promise<void> => {
    if (installedRehydrated) {
      return;
    }
    installedRehydrated = true;
    const installedIds = await readInstalledIndex();
    for (const extensionId of installedIds) {
      const record = await options.storage.get<InstalledExtensionRecord>(getInstalledExtensionRecordKey(extensionId));
      const moduleCode = await options.storage.get<string>(getInstalledExtensionModuleKey(extensionId));
      if (!record || !moduleCode) {
        await options.storage.remove(getInstalledExtensionRecordKey(extensionId));
        await options.storage.remove(getInstalledExtensionModuleKey(extensionId));
        continue;
      }
      try {
        await registerInstalledRecord(record, moduleCode);
      } catch (error) {
        await publishDiagnostic(extensionId, asDiagnostic("EXT_RUNTIME_REHYDRATE_FAILED", "error", toErrorRecord("install", error)));
      }
    }
  };

  return {
    version: EXTENSION_RUNTIME_VERSION,
    getSnapshot,
    subscribe(listener: () => void): () => void {
      return emitter.subscribe(listener);
    },
    listCatalog(): readonly RegisteredRuntimeExtensionCatalogEntry[] {
      return registry.list();
    },
    listAvailableCatalogEntries() {
      return listCatalogEntries();
    },
    get(id: string): ExtensionRuntimeExtensionSnapshot | undefined {
      return getSnapshot().extensions.find((extension) => extension.id === id);
    },
    registerBundledExtension(entry: BundledExtensionCatalogEntry): Disposable {
      const disposable = registry.registerBundled(entry);
      const registered = registry.get(entry.manifest.id);
      if (!registered) {
        throw new Error(`Failed to register bundled extension '${entry.manifest.id}'.`);
      }
      const state = ensureState(registered);
      state.enabled = registered.manifest.enabledByDefault;
      void applyStateFromEntry(state);
      emitter.emit();
      if (started && state.enabled && registered.activation === "eager") {
        void activateState(state);
      }
      return {
        dispose(): void {
          void deactivateState(state);
          disposable.dispose();
          states.delete(registered.id);
          emitter.emit();
        },
      };
    },
    registerCatalog(catalog, registrationOptions = {}) {
      const issues = validateCatalogDocument(catalog);
      if (issues.length > 0) {
        throw new Error(`Invalid extension catalog: ${issues.join(" ")}`);
      }
      const catalogId = registrationOptions.catalogId ?? catalog.publisher ?? `catalog:${externalCatalogEntries.size + 1}`;
      const addedEntryIds: string[] = [];
      for (const entry of catalog.extensions) {
        if (externalCatalogEntries.has(entry.entryId)) {
          throw new Error(`External extension catalog entry '${entry.entryId}' is already registered.`);
        }
        externalCatalogEntries.set(entry.entryId, {
          entryId: entry.entryId,
          catalogId,
          baseUrl: registrationOptions.baseUrl ?? catalog.baseUrl,
          entry,
        });
        addedEntryIds.push(entry.entryId);
      }
      emitter.emit();
      return {
        dispose(): void {
          for (const entryId of addedEntryIds) {
            externalCatalogEntries.delete(entryId);
          }
          emitter.emit();
        },
      };
    },
    async loadCatalog(url: string, registrationOptions = {}) {
      if (!transport) {
        throw new Error("No extension artifact transport is configured for catalog loading.");
      }
      const catalog = await transport.fetchJson(url);
      const baseUrl = new URL(".", url).toString();
      return this.registerCatalog(catalog as never, {
        catalogId: registrationOptions.catalogId ?? url,
        baseUrl,
      });
    },
    async start(): Promise<void> {
      await rehydrateInstalledExtensions();
      started = true;
      for (const entry of registry.list()) {
        const state = ensureState(entry);
        const persisted = await options.storage.get<boolean>(getExtensionEnabledStateKey(entry.id));
        state.enabled = persisted ?? entry.manifest.enabledByDefault;
        await applyStateFromEntry(state);
      }
      emitter.emit();

      for (const entry of registry.list()) {
        const state = ensureState(entry);
        if (!state.enabled) continue;
        if (state.status === "incompatible") continue;
        if (entry.activation === "eager") {
          await activateState(state);
        }
      }
      emitter.emit();
    },
    async stop(): Promise<void> {
      const active = Array.from(states.values()).filter((state) => state.status === "active" || state.activeContext);
      for (const state of active) {
        await deactivateState(state);
      }
      started = false;
      emitter.emit();
    },
    async activate(id: string): Promise<void> {
      const entry = registry.get(id);
      if (!entry) {
        throw new Error(`Unknown extension '${id}'.`);
      }
      const state = ensureState(entry);
      if (!state.enabled) {
        await this.setEnabled(id, true);
      }
      await activateState(state);
    },
    async ensureActivated(id: string): Promise<void> {
      await this.activate(id);
    },
    async deactivate(id: string): Promise<void> {
      const entry = registry.get(id);
      if (!entry) {
        return;
      }
      const state = ensureState(entry);
      await deactivateState(state);
    },
    async setEnabled(id: string, enabled: boolean): Promise<void> {
      const entry = registry.get(id);
      if (!entry) {
        throw new Error(`Unknown extension '${id}'.`);
      }
      const state = ensureState(entry);
      state.enabled = enabled;
      await options.storage.set(getExtensionEnabledStateKey(id), enabled);
      if (!enabled) {
        await deactivateState(state);
        state.status = "disabled";
      } else {
        state.status = entry.activation === "eager" && started ? "activating" : "registered";
        if (started && entry.activation === "eager") {
          await activateState(state);
        }
      }
      emitter.emit();
    },
    isEnabled(id: string): boolean {
      return states.get(id)?.enabled ?? registry.get(id)?.manifest.enabledByDefault ?? false;
    },
    async installFromCatalogEntry(entryId, installOptions = {}): Promise<InstalledExtensionRecord> {
      if (!transport) {
        throw new Error("No extension artifact transport is configured for external extension installation.");
      }
      if (!options.trustPolicy) {
        throw new Error("External extension installation requires an explicit trust policy.");
      }
      const catalogEntry = externalCatalogEntries.get(entryId);
      if (!catalogEntry) {
        throw new Error(`Unknown external catalog entry '${entryId}'.`);
      }
      const payload = await fetchInstallableCatalogPayload(catalogEntry, transport, options.trustPolicy);
      if (payload.manifest.kind !== "external") {
        throw new Error(`Extension '${payload.manifest.id}' is not marked as an external installable package.`);
      }
      const compatibility = evaluateExtensionCompatibility(payload.manifest, {
        hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
        hostVersion: options.host.environment.hostVersion,
        runtimeVersion: EXTENSION_RUNTIME_VERSION,
        themeContractVersion: THEME_CONTRACT_VERSION,
      });
      if (!compatibility.compatible) {
        throw new Error(`Extension '${payload.manifest.id}' is incompatible with this host: ${compatibility.issues.map((issue) => issue.message).join(" ")}`);
      }

      const timestamp = now();
      const priorRecord = await options.storage.get<InstalledExtensionRecord>(getInstalledExtensionRecordKey(payload.manifest.id));
      const record: InstalledExtensionRecord = {
        source: "installed",
        catalogId: payload.catalogEntry.catalogId,
        entryId: payload.catalogEntry.entryId,
        manifest: payload.manifest,
        signedManifest: payload.signedManifest,
        manifestUrl: payload.catalogEntry.entry.urls.manifest,
        signedManifestUrl: payload.catalogEntry.entry.urls.signedManifest,
        moduleUrl: payload.catalogEntry.entry.urls.module,
        moduleIntegrity: payload.catalogEntry.entry.integrity.module,
        installedAt: priorRecord?.installedAt ?? timestamp,
        updatedAt: timestamp,
        verification: {
          integrityVerified: true,
          signatureVerified: payload.signatureVerified,
          signerKeyId: payload.signer?.keyId,
        },
      };
      await options.storage.set(getInstalledExtensionRecordKey(payload.manifest.id), record);
      await options.storage.set(getInstalledExtensionModuleKey(payload.manifest.id), payload.moduleCode);
      await writeInstalledIndex([...(await readInstalledIndex()).filter((value) => value !== payload.manifest.id), payload.manifest.id]);
      await registerInstalledRecord(record, payload.moduleCode);
      if (installOptions.autoActivate) {
        await this.activate(payload.manifest.id);
      }
      return record;
    },
    async updateFromCatalogEntry(entryId, installOptions = {}) {
      return await this.installFromCatalogEntry(entryId, installOptions);
    },
    async removeInstalledExtension(id: string): Promise<void> {
      const entry = registry.get(id);
      if (entry?.source === "bundled") {
        throw new Error(`Cannot remove bundled extension '${id}'.`);
      }
      const state = states.get(id);
      if (state) {
        await deactivateState(state);
      }
      installedRegistrationDisposables.get(id)?.dispose();
      installedRegistrationDisposables.delete(id);
      registry.unregister(id);
      states.delete(id);
      await options.storage.remove(getInstalledExtensionRecordKey(id));
      await options.storage.remove(getInstalledExtensionModuleKey(id));
      await writeInstalledIndex((await readInstalledIndex()).filter((value) => value !== id));
      emitter.emit();
    },
    getConfigurationStore(extensionId: string): ExtensionConfigurationStore {
      return createExtensionConfigurationStore(extensionId, options.storage);
    },
    getService<T = unknown>(extensionId: string, token: string): T | undefined {
      return states.get(extensionId)?.services.get(token) as T | undefined;
    },
  } satisfies ExtensionRuntime;
}
