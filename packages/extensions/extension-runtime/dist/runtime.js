import { EXTENSION_HOST_API_VERSION } from "@mdwrk/extension-host";
import { EXTENSION_RUNTIME_API_BASELINE, THEME_CONTRACT_BASELINE, } from "@mdwrk/extension-manifest";
import { createFetchExtensionArtifactTransport, evaluateCatalogEntryPolicy, fetchInstallableCatalogPayload, validateCatalogDocument, } from "./catalog.js";
import { evaluateExtensionCompatibility } from "./compatibility.js";
import { createExtensionLoader } from "./loader.js";
import { createExtensionRegistry } from "./registry.js";
import { createExtensionConfigurationStore, EXTENSION_INSTALL_INDEX_KEY, getExtensionActivationStateKey, getExtensionEnabledStateKey, getInstalledExtensionModuleKey, getInstalledExtensionRecordKey, } from "./storage.js";
import { EXTENSION_RUNTIME_VERSION } from "./version.js";
const createEmitter = () => {
    const listeners = new Set();
    return {
        emit() {
            for (const listener of Array.from(listeners)) {
                listener();
            }
        },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
};
const toErrorRecord = (phase, error) => {
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
const asDiagnostic = (code, severity, record) => {
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
function createDeniedProxy(extensionId, capability, apiName, api, allow) {
    const allowed = new Set(allow.map((key) => String(key)));
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
function createScopedHost(host, extensionId, capabilities) {
    const granted = new Set(capabilities);
    const commands = granted.has("command.invoke")
        ? host.commands
        : createDeniedProxy(extensionId, "command.invoke", "commands", host.commands, []);
    const views = granted.has("view.register")
        ? host.views
        : createDeniedProxy(extensionId, "view.register", "views", host.views, []);
    const actionRail = granted.has("actionRail.register")
        ? host.actionRail
        : createDeniedProxy(extensionId, "actionRail.register", "actionRail", host.actionRail, []);
    const settings = {
        get: granted.has("settings.read") ? host.settings.get : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.read'.`); },
        watch: granted.has("settings.read") ? host.settings.watch : () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.read'.`); },
        set: granted.has("settings.write") ? host.settings.set : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.write'.`); },
        remove: granted.has("settings.write") ? host.settings.remove : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'settings.write'.`); },
    };
    const notifications = {
        info: granted.has("notification.publish") ? host.notifications.info : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
        warn: granted.has("notification.publish") ? host.notifications.warn : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
        error: granted.has("notification.publish") ? host.notifications.error : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'notification.publish'.`); },
    };
    const theme = {
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
    const editor = {
        getActiveDocument: granted.has("editor.read") ? host.editor.getActiveDocument : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.read'.`); },
        getSelections: granted.has("selection.read") ? host.editor.getSelections : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'selection.read'.`); },
        insertText: granted.has("editor.write") ? host.editor.insertText : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
        replaceSelections: granted.has("editor.write") ? host.editor.replaceSelections : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
        setDocumentContent: granted.has("editor.write") ? host.editor.setDocumentContent : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'editor.write'.`); },
    };
    const workspace = {
        listProjects: granted.has("workspace.read") ? host.workspace.listProjects : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
        getActiveProject: granted.has("workspace.read") ? host.workspace.getActiveProject : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
        getActiveFile: granted.has("workspace.read") ? host.workspace.getActiveFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
        readFile: granted.has("workspace.read") ? host.workspace.readFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.read'.`); },
        writeFile: granted.has("workspace.write") ? host.workspace.writeFile : async () => { throw new Error(`Extension '${extensionId}' lacks capability 'workspace.write'.`); },
    };
    const diagnostics = host.diagnostics;
    const i18n = host.i18n;
    const logger = host.logger;
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
function toBase64(value) {
    const nodeBuffer = globalThis.Buffer;
    if (nodeBuffer) {
        return nodeBuffer.from(value, "utf8").toString("base64");
    }
    if (typeof btoa === "function") {
        return btoa(unescape(encodeURIComponent(value)));
    }
    throw new Error("Base64 encoding is unavailable in this runtime.");
}
function createExternalModuleFactory(record, moduleCode) {
    const source = `${moduleCode}\n//# sourceURL=${record.moduleUrl}`;
    return async () => {
        const url = `data:text/javascript;base64,${toBase64(source)}`;
        return await import(url);
    };
}
export function createExtensionRuntime(options) {
    const registry = createExtensionRegistry();
    const loader = createExtensionLoader();
    const emitter = createEmitter();
    const states = new Map();
    const externalCatalogEntries = new Map();
    const installedRegistrationDisposables = new Map();
    const now = options.now ?? (() => Date.now());
    const transport = options.transport ?? (typeof fetch === "function" ? createFetchExtensionArtifactTransport() : undefined);
    let started = false;
    let installedRehydrated = false;
    let snapshotCache = null;
    const emitSnapshotChange = () => {
        snapshotCache = null;
        emitter.emit();
    };
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
    const listStates = () => registry.list().map((entry) => {
        const state = states.get(entry.id);
        const hostGranted = new Set(options.host.environment.grantedCapabilities ?? entry.manifest.capabilities);
        const grantedCapabilities = entry.manifest.capabilities.filter((capability) => hostGranted.has(capability));
        const missingCapabilities = entry.manifest.capabilities.filter((capability) => !hostGranted.has(capability));
        const compatibility = evaluateExtensionCompatibility(entry.manifest, {
            hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
            hostVersion: options.host.environment.hostVersion,
            runtimeVersion: EXTENSION_RUNTIME_API_BASELINE,
            themeContractVersion: THEME_CONTRACT_BASELINE,
            rendererVersion: options.host.environment.rendererVersion,
            editorVersion: options.host.environment.editorVersion,
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
        };
    });
    const getSnapshot = () => {
        if (snapshotCache)
            return snapshotCache;
        snapshotCache = {
            started,
            extensions: listStates(),
            catalogEntries: listCatalogEntries(),
        };
        return snapshotCache;
    };
    const ensureState = (entry) => {
        const existing = states.get(entry.id);
        if (existing) {
            existing.entry = entry;
            return existing;
        }
        const initial = {
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
    const publishDiagnostic = async (extensionId, record) => {
        const state = states.get(extensionId);
        if (state) {
            state.diagnostics.push(record);
        }
        await options.host.diagnostics.publish(extensionId, record);
        emitSnapshotChange();
    };
    const clearDiagnostics = async (extensionId) => {
        const state = states.get(extensionId);
        if (state) {
            state.diagnostics = [];
        }
        await options.host.diagnostics.clear(extensionId);
        emitSnapshotChange();
    };
    const assertRegistrationCapability = (state, capability) => {
        const hostGranted = new Set(options.host.environment.grantedCapabilities ?? state.entry.manifest.capabilities);
        if (!hostGranted.has(capability) || !state.entry.manifest.capabilities.includes(capability)) {
            const error = toErrorRecord("activate", new Error(`Extension '${state.entry.id}' lacks required capability '${capability}' for this registration.`));
            state.lastError = error;
            state.diagnostics.push(asDiagnostic("EXT_RUNTIME_CAPABILITY_DENIED", "error", error));
            void options.host.diagnostics.publish(state.entry.id, asDiagnostic("EXT_RUNTIME_CAPABILITY_DENIED", "error", error));
            throw new Error(error.message);
        }
    };
    const buildContext = (state, scopedHost) => {
        const config = createExtensionConfigurationStore(state.entry.id, options.storage);
        const grantedSet = new Set(options.host.environment.grantedCapabilities ?? state.entry.manifest.capabilities);
        const grantedCapabilities = state.entry.manifest.capabilities.filter((capability) => grantedSet.has(capability));
        const registerDisposable = (disposable) => {
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
            registerLocaleCatalog(catalog) {
                return registerDisposable(scopedHost.i18n.registerCatalog(state.entry.id, catalog));
            },
            registerLocaleCatalogLoader(loader) {
                return registerDisposable(scopedHost.i18n.registerCatalogLoader(state.entry.id, loader));
            },
            registerService(token, service) {
                state.services.set(token, service);
                return registerDisposable({
                    dispose() {
                        state.services.delete(token);
                    },
                });
            },
        };
    };
    const applyStateFromEntry = async (state) => {
        const compatibility = evaluateExtensionCompatibility(state.entry.manifest, {
            hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
            hostVersion: options.host.environment.hostVersion,
            runtimeVersion: EXTENSION_RUNTIME_API_BASELINE,
            themeContractVersion: THEME_CONTRACT_BASELINE,
            rendererVersion: options.host.environment.rendererVersion,
            editorVersion: options.host.environment.editorVersion,
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
    const activateState = async (state) => {
        if (state.status === "active")
            return;
        if (state.activationTask)
            return await state.activationTask;
        const compatibility = evaluateExtensionCompatibility(state.entry.manifest, {
            hostApiVersion: options.host.apiVersion || EXTENSION_HOST_API_VERSION,
            hostVersion: options.host.environment.hostVersion,
            runtimeVersion: EXTENSION_RUNTIME_API_BASELINE,
            themeContractVersion: THEME_CONTRACT_BASELINE,
            rendererVersion: options.host.environment.rendererVersion,
            editorVersion: options.host.environment.editorVersion,
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
            emitSnapshotChange();
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
                    const maybeDisposable = activationResult;
                    if (typeof maybeDisposable.dispose === "function") {
                        state.runtimeDisposables.push(maybeDisposable);
                    }
                    else {
                        const nestedDisposable = activationResult.dispose;
                        if (nestedDisposable && typeof nestedDisposable.dispose === "function") {
                            state.runtimeDisposables.push(nestedDisposable);
                        }
                    }
                }
                state.status = "active";
                state.lastActivatedAt = now();
            }
            catch (error) {
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
            }
            finally {
                state.activationTask = null;
                emitSnapshotChange();
            }
        })();
        return await state.activationTask;
    };
    const deactivateState = async (state) => {
        if (state.status !== "active" && !state.activeContext) {
            state.status = state.enabled ? "registered" : "disabled";
            emitSnapshotChange();
            return;
        }
        if (state.deactivationTask)
            return await state.deactivationTask;
        state.deactivationTask = (async () => {
            state.status = "deactivating";
            emitSnapshotChange();
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
            }
            catch (error) {
                const record = toErrorRecord("deactivate", error);
                state.lastError = record;
                state.status = "error";
                await publishDiagnostic(state.entry.id, asDiagnostic("EXT_RUNTIME_DEACTIVATE_FAILED", "error", record));
            }
            finally {
                state.deactivationTask = null;
                emitSnapshotChange();
            }
        })();
        return await state.deactivationTask;
    };
    const readInstalledIndex = async () => {
        return await options.storage.get(EXTENSION_INSTALL_INDEX_KEY) ?? [];
    };
    const writeInstalledIndex = async (next) => {
        const unique = Array.from(new Set(next)).sort((left, right) => left.localeCompare(right));
        await options.storage.set(EXTENSION_INSTALL_INDEX_KEY, unique);
    };
    const registerInstalledRecord = async (record, moduleCode) => {
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
        const entry = {
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
        const persistedEnabled = await options.storage.get(getExtensionEnabledStateKey(record.manifest.id));
        state.enabled = persistedEnabled ?? record.manifest.enabledByDefault;
        await applyStateFromEntry(state);
        emitSnapshotChange();
    };
    const rehydrateInstalledExtensions = async () => {
        if (installedRehydrated) {
            return;
        }
        installedRehydrated = true;
        const installedIds = await readInstalledIndex();
        for (const extensionId of installedIds) {
            const record = await options.storage.get(getInstalledExtensionRecordKey(extensionId));
            const moduleCode = await options.storage.get(getInstalledExtensionModuleKey(extensionId));
            if (!record || !moduleCode) {
                await options.storage.remove(getInstalledExtensionRecordKey(extensionId));
                await options.storage.remove(getInstalledExtensionModuleKey(extensionId));
                continue;
            }
            try {
                await registerInstalledRecord(record, moduleCode);
            }
            catch (error) {
                await publishDiagnostic(extensionId, asDiagnostic("EXT_RUNTIME_REHYDRATE_FAILED", "error", toErrorRecord("install", error)));
            }
        }
    };
    return {
        version: EXTENSION_RUNTIME_VERSION,
        getSnapshot,
        subscribe(listener) {
            return emitter.subscribe(listener);
        },
        listCatalog() {
            return registry.list();
        },
        listAvailableCatalogEntries() {
            return listCatalogEntries();
        },
        get(id) {
            return getSnapshot().extensions.find((extension) => extension.id === id);
        },
        registerBundledExtension(entry) {
            const disposable = registry.registerBundled(entry);
            const registered = registry.get(entry.manifest.id);
            if (!registered) {
                throw new Error(`Failed to register bundled extension '${entry.manifest.id}'.`);
            }
            const state = ensureState(registered);
            state.enabled = registered.manifest.enabledByDefault;
            void applyStateFromEntry(state);
            emitSnapshotChange();
            if (started && state.enabled && registered.activation === "eager") {
                void activateState(state);
            }
            return {
                dispose() {
                    void deactivateState(state);
                    disposable.dispose();
                    states.delete(registered.id);
                    emitSnapshotChange();
                },
            };
        },
        registerCatalog(catalog, registrationOptions = {}) {
            const issues = validateCatalogDocument(catalog);
            if (issues.length > 0) {
                throw new Error(`Invalid extension catalog: ${issues.join(" ")}`);
            }
            const catalogId = registrationOptions.catalogId ?? catalog.publisher ?? `catalog:${externalCatalogEntries.size + 1}`;
            const addedEntryIds = [];
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
            emitSnapshotChange();
            return {
                dispose() {
                    for (const entryId of addedEntryIds) {
                        externalCatalogEntries.delete(entryId);
                    }
                    emitSnapshotChange();
                },
            };
        },
        async loadCatalog(url, registrationOptions = {}) {
            if (!transport) {
                throw new Error("No extension artifact transport is configured for catalog loading.");
            }
            const catalog = await transport.fetchJson(url);
            const baseUrl = new URL(".", url).toString();
            return this.registerCatalog(catalog, {
                catalogId: registrationOptions.catalogId ?? url,
                baseUrl,
            });
        },
        async start() {
            await rehydrateInstalledExtensions();
            started = true;
            for (const entry of registry.list()) {
                const state = ensureState(entry);
                const persisted = await options.storage.get(getExtensionEnabledStateKey(entry.id));
                state.enabled = persisted ?? entry.manifest.enabledByDefault;
                await applyStateFromEntry(state);
            }
            emitSnapshotChange();
            for (const entry of registry.list()) {
                const state = ensureState(entry);
                if (!state.enabled)
                    continue;
                if (state.status === "incompatible")
                    continue;
                const persistedActive = await options.storage.get(getExtensionActivationStateKey(entry.id));
                if (persistedActive || entry.activation === "eager") {
                    await activateState(state);
                }
            }
            emitSnapshotChange();
        },
        async stop() {
            const active = Array.from(states.values()).filter((state) => state.status === "active" || state.activeContext);
            for (const state of active) {
                await deactivateState(state);
            }
            started = false;
            emitSnapshotChange();
        },
        async activate(id) {
            const entry = registry.get(id);
            if (!entry) {
                throw new Error(`Unknown extension '${id}'.`);
            }
            const state = ensureState(entry);
            if (!state.enabled) {
                await this.setEnabled(id, true);
            }
            await options.storage.set(getExtensionActivationStateKey(id), true);
            await activateState(state);
        },
        async ensureActivated(id) {
            await this.activate(id);
        },
        async deactivate(id) {
            const entry = registry.get(id);
            if (!entry) {
                return;
            }
            const state = ensureState(entry);
            await options.storage.set(getExtensionActivationStateKey(id), false);
            await deactivateState(state);
        },
        async setEnabled(id, enabled) {
            const entry = registry.get(id);
            if (!entry) {
                throw new Error(`Unknown extension '${id}'.`);
            }
            const state = ensureState(entry);
            state.enabled = enabled;
            await options.storage.set(getExtensionEnabledStateKey(id), enabled);
            if (!enabled) {
                await options.storage.set(getExtensionActivationStateKey(id), false);
                await deactivateState(state);
                state.status = "disabled";
            }
            else {
                state.status = entry.activation === "eager" && started ? "activating" : "registered";
                if (started && entry.activation === "eager") {
                    await activateState(state);
                }
            }
            emitSnapshotChange();
        },
        isEnabled(id) {
            return states.get(id)?.enabled ?? registry.get(id)?.manifest.enabledByDefault ?? false;
        },
        async installFromCatalogEntry(entryId, installOptions = {}) {
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
                runtimeVersion: EXTENSION_RUNTIME_API_BASELINE,
                themeContractVersion: THEME_CONTRACT_BASELINE,
                rendererVersion: options.host.environment.rendererVersion,
                editorVersion: options.host.environment.editorVersion,
            });
            if (!compatibility.compatible) {
                throw new Error(`Extension '${payload.manifest.id}' is incompatible with this host: ${compatibility.issues.map((issue) => issue.message).join(" ")}`);
            }
            const timestamp = now();
            const priorRecord = await options.storage.get(getInstalledExtensionRecordKey(payload.manifest.id));
            const record = {
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
        async removeInstalledExtension(id) {
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
            await options.storage.remove(getExtensionEnabledStateKey(id));
            await options.storage.remove(getExtensionActivationStateKey(id));
            await writeInstalledIndex((await readInstalledIndex()).filter((value) => value !== id));
            emitSnapshotChange();
        },
        getConfigurationStore(extensionId) {
            return createExtensionConfigurationStore(extensionId, options.storage);
        },
        getService(extensionId, token) {
            return states.get(extensionId)?.services.get(token);
        },
    };
}
//# sourceMappingURL=runtime.js.map