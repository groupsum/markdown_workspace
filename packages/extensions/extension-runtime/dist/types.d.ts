import type { ExtensionCapability, ExtensionCatalogDocument, ExtensionCatalogEntry, ExtensionIntegrity, ExtensionManifest, I18nLabel, SignedExtensionManifest, TrustedExtensionSigner } from "@markdown-workspace/extension-manifest";
import type { DiagnosticRecord, Disposable, ExtensionConfigurationStore, ExtensionHost, MarkdownWorkspaceExtension, RegisteredActionRailItem, RegisteredCommand, RegisteredComponent, RegisteredSettingsSection, RegisteredView } from "@markdown-workspace/extension-host";
export type ExtensionActivationMode = "eager" | "lazy";
export type ExtensionCatalogSource = "bundled" | "installed";
export type ExtensionRuntimeStatus = "registered" | "disabled" | "activating" | "active" | "deactivating" | "error" | "incompatible";
export interface ExtensionRuntimeManifestValidationIssue {
    readonly path: string;
    readonly message: string;
}
export interface ExtensionRuntimeCompatibilityIssue {
    readonly target: "manifestVersion" | "hostApi" | "runtime" | "app" | "themeContract" | "renderer" | "editor";
    readonly expected: string | number;
    readonly actual: string | number;
    readonly message: string;
}
export interface ExtensionRuntimeCompatibilityResult {
    readonly compatible: boolean;
    readonly issues: readonly ExtensionRuntimeCompatibilityIssue[];
}
export interface ExtensionRuntimeErrorRecord {
    readonly phase: "registration" | "load" | "activate" | "deactivate" | "render" | "compatibility" | "install" | "uninstall" | "verification";
    readonly message: string;
    readonly detail?: string;
}
export interface ExtensionRuntimeStorage {
    get<T = unknown>(key: string): Promise<T | null>;
    set<T = unknown>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable;
}
export interface ExtensionRuntimeRegistrationSink {
    registerCommand(extensionId: string, command: RegisteredCommand): Disposable;
    registerView(extensionId: string, view: RegisteredView): Disposable;
    registerComponent?(extensionId: string, component: RegisteredComponent): Disposable;
    registerActionRailItem(extensionId: string, item: RegisteredActionRailItem): Disposable;
    registerSettingsSection(extensionId: string, section: RegisteredSettingsSection): Disposable;
}
export interface RuntimeExtensionCatalogEntry {
    readonly source?: ExtensionCatalogSource;
    readonly manifest: ExtensionManifest;
    readonly activation?: ExtensionActivationMode;
    readonly load: () => MarkdownWorkspaceExtension | Promise<MarkdownWorkspaceExtension>;
}
export interface BundledExtensionCatalogEntry extends RuntimeExtensionCatalogEntry {
    readonly source?: "bundled";
}
export interface InstalledExtensionVerificationRecord {
    readonly integrityVerified: boolean;
    readonly signatureVerified: boolean;
    readonly signerKeyId?: string;
}
export interface InstalledExtensionRecord {
    readonly source: "installed";
    readonly catalogId: string;
    readonly entryId: string;
    readonly manifest: ExtensionManifest;
    readonly signedManifest: SignedExtensionManifest | null;
    readonly manifestUrl: string;
    readonly signedManifestUrl: string;
    readonly moduleUrl: string;
    readonly moduleIntegrity: ExtensionIntegrity;
    readonly installedAt: number;
    readonly updatedAt: number;
    readonly verification: InstalledExtensionVerificationRecord;
}
export interface InstalledExtensionCatalogEntry extends RuntimeExtensionCatalogEntry {
    readonly source: "installed";
    readonly installedRecord: InstalledExtensionRecord;
}
export interface RegisteredRuntimeExtensionCatalogEntry extends RuntimeExtensionCatalogEntry {
    readonly id: string;
    readonly source: ExtensionCatalogSource;
    readonly activation: ExtensionActivationMode;
}
export interface RegisteredBundledExtensionCatalogEntry extends RegisteredRuntimeExtensionCatalogEntry {
    readonly source: "bundled";
}
export interface RegisteredInstalledExtensionCatalogEntry extends RegisteredRuntimeExtensionCatalogEntry {
    readonly source: "installed";
    readonly installedRecord: InstalledExtensionRecord;
}
export interface ExtensionRuntimeCatalogRegistrationOptions {
    readonly catalogId?: string;
    readonly baseUrl?: string;
}
export interface RegisteredExternalCatalogEntry {
    readonly entryId: string;
    readonly catalogId: string;
    readonly baseUrl?: string;
    readonly entry: ExtensionCatalogEntry;
}
export interface ExtensionRuntimeCatalogEntrySnapshot {
    readonly entryId: string;
    readonly catalogId: string;
    readonly extensionId: string;
    readonly packageName: string;
    readonly version: string;
    readonly displayName: I18nLabel;
    readonly description: I18nLabel;
    readonly publisher?: string;
    readonly installed: boolean;
    readonly policyTrusted: boolean;
    readonly policyIssues: readonly string[];
}
export interface ExtensionArtifactTransport {
    fetchJson<T = unknown>(url: string): Promise<T>;
    fetchText(url: string): Promise<string>;
}
export interface ExtensionRuntimeTrustPolicy {
    readonly allowUnsigned?: boolean;
    readonly allowIntegrityOnly?: boolean;
    readonly allowedPublishers?: readonly string[];
    readonly allowedPackageNames?: readonly string[];
    readonly allowedExtensionIds?: readonly string[];
    readonly trustedSigners?: readonly TrustedExtensionSigner[];
}
export interface ExtensionRuntimeExtensionSnapshot {
    readonly id: string;
    readonly manifest: ExtensionManifest;
    readonly source: ExtensionCatalogSource;
    readonly activation: ExtensionActivationMode;
    readonly enabled: boolean;
    readonly status: ExtensionRuntimeStatus;
    readonly compatibility: ExtensionRuntimeCompatibilityResult;
    readonly grantedCapabilities: readonly ExtensionCapability[];
    readonly missingCapabilities: readonly ExtensionCapability[];
    readonly diagnostics: readonly DiagnosticRecord[];
    readonly componentIds: readonly string[];
    readonly serviceTokens: readonly string[];
    readonly lastActivatedAt: number | null;
    readonly lastError: ExtensionRuntimeErrorRecord | null;
}
export interface ExtensionRuntimeSnapshot {
    readonly started: boolean;
    readonly extensions: readonly ExtensionRuntimeExtensionSnapshot[];
    readonly catalogEntries: readonly ExtensionRuntimeCatalogEntrySnapshot[];
}
export interface ExtensionRuntimeInstallOptions {
    readonly autoActivate?: boolean;
}
export interface ExtensionRuntimeOptions {
    readonly host: ExtensionHost;
    readonly registrationSink: ExtensionRuntimeRegistrationSink;
    readonly storage: ExtensionRuntimeStorage;
    readonly transport?: ExtensionArtifactTransport;
    readonly trustPolicy?: ExtensionRuntimeTrustPolicy;
    readonly now?: () => number;
}
export interface ExtensionRuntime {
    readonly version: string;
    getSnapshot(): ExtensionRuntimeSnapshot;
    subscribe(listener: () => void): () => void;
    listCatalog(): readonly RegisteredRuntimeExtensionCatalogEntry[];
    listAvailableCatalogEntries(): readonly ExtensionRuntimeCatalogEntrySnapshot[];
    get(id: string): ExtensionRuntimeExtensionSnapshot | undefined;
    registerBundledExtension(entry: BundledExtensionCatalogEntry): Disposable;
    registerCatalog(catalog: ExtensionCatalogDocument, options?: ExtensionRuntimeCatalogRegistrationOptions): Disposable;
    loadCatalog(url: string, options?: Omit<ExtensionRuntimeCatalogRegistrationOptions, "baseUrl">): Promise<Disposable>;
    start(): Promise<void>;
    stop(): Promise<void>;
    activate(id: string): Promise<void>;
    ensureActivated(id: string): Promise<void>;
    deactivate(id: string): Promise<void>;
    setEnabled(id: string, enabled: boolean): Promise<void>;
    isEnabled(id: string): boolean;
    installFromCatalogEntry(entryId: string, options?: ExtensionRuntimeInstallOptions): Promise<InstalledExtensionRecord>;
    updateFromCatalogEntry(entryId: string, options?: ExtensionRuntimeInstallOptions): Promise<InstalledExtensionRecord>;
    removeInstalledExtension(id: string): Promise<void>;
    getConfigurationStore(extensionId: string): ExtensionConfigurationStore;
    getService<T = unknown>(extensionId: string, token: string): T | undefined;
}
//# sourceMappingURL=types.d.ts.map