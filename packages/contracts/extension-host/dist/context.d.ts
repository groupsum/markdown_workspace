import type { ExtensionCapability, ExtensionManifest } from "@mdwrk/extension-manifest";
import type { ExtensionLocaleCatalog, ExtensionLocaleCatalogLoader, ExtensionHost, HostEnvironment } from "./host.js";
import type { Disposable, JsonValue } from "./primitives.js";
import type { RegisteredActionRailItem, RegisteredCommand, RegisteredComponent, RegisteredSettingsSection, RegisteredView, RegisteredWorkspaceModule } from "./registration.js";
export interface ExtensionConfigurationStore {
    get<T extends JsonValue = JsonValue>(key: string): Promise<T | null>;
    set<T extends JsonValue = JsonValue>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    watch<T extends JsonValue = JsonValue>(key: string, listener: (value: T | null) => void): Disposable;
}
export interface ExtensionContext {
    readonly extensionId: string;
    readonly manifest: ExtensionManifest;
    readonly capabilities: readonly ExtensionCapability[];
    readonly host: ExtensionHost;
    readonly environment: HostEnvironment;
    readonly config: ExtensionConfigurationStore;
    registerCommand(command: RegisteredCommand): Disposable;
    registerView(view: RegisteredView): Disposable;
    registerWorkspaceModule(module: RegisteredWorkspaceModule): Disposable;
    registerComponent(component: RegisteredComponent): Disposable;
    registerActionRailItem(item: RegisteredActionRailItem): Disposable;
    registerSettingsSection(section: RegisteredSettingsSection): Disposable;
    registerLocaleCatalog(catalog: ExtensionLocaleCatalog): Disposable;
    registerLocaleCatalogLoader(loader: ExtensionLocaleCatalogLoader): Disposable;
    registerService<T>(token: string, service: T): Disposable;
}
//# sourceMappingURL=context.d.ts.map