import type {
  ActionRailContributionDescriptor,
  ExtensionCapability,
  I18nLabel,
  ViewContributionDescriptor,
} from "@mdwrk/extension-manifest";
import type {
  MarkdownWorkspaceThemeClassName,
  MarkdownWorkspaceThemeTokenMap,
  MarkdownWorkspaceThemeTokenName,
  ThemeBridgeTarget,
  ThemeBridgeVariableDefinition,
  ThemeClassDefinition,
  ThemePreset,
  ThemeTokenDefinition,
} from "@mdwrk/theme-contract";
import type { Disposable, MaybePromise } from "./primitives.js";

export interface HostCommandApi {
  execute<T = unknown>(id: string, ...args: unknown[]): Promise<T>;
  list(): Promise<readonly string[]>;
}

export interface HostViewApi {
  open(id: string, input?: unknown): Promise<void>;
  close(id: string): Promise<void>;
  focus(id: string): Promise<void>;
  list(): Promise<readonly ViewContributionDescriptor[]>;
}

export interface HostActionRailApi {
  list(): Promise<readonly ActionRailContributionDescriptor[]>;
  reveal(id: string): Promise<void>;
  setBadge(id: string, value: number | null): Promise<void>;
}

export interface HostSettingsApi {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  watch<T = unknown>(key: string, listener: (value: T | null) => void): Disposable;
}

export interface HostNotificationOptions {
  readonly title?: string;
  readonly actions?: readonly { readonly id: string; readonly label: string }[];
  readonly sticky?: boolean;
}

export interface HostNotificationApi {
  info(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
  warn(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
  error(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
}

export interface HostThemeCssExportOptions {
  readonly selector?: string;
  readonly target?: "host" | ThemeBridgeTarget;
}

export interface HostThemeApi {
  getToken(token: MarkdownWorkspaceThemeTokenName): Promise<string | null>;
  getTokenMap(): Promise<MarkdownWorkspaceThemeTokenMap>;
  getTokens(): Promise<readonly ThemeTokenDefinition[]>;
  getClassNames(): Promise<readonly ThemeClassDefinition[]>;
  getThemeBridge(target: ThemeBridgeTarget): Promise<readonly ThemeBridgeVariableDefinition[]>;
  getThemeBridgeVariables(target: ThemeBridgeTarget): Promise<Readonly<Record<`--${string}`, string>>>;
  setDraftToken(token: MarkdownWorkspaceThemeTokenName, value: string): Promise<void>;
  setDraftTokens(tokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): Promise<void>;
  previewTheme(preset: ThemePreset | Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): Promise<void>;
  applyDraft(): Promise<void>;
  discardDraft(): Promise<void>;
  exportTheme(): Promise<ThemePreset>;
  exportThemeCss(options?: HostThemeCssExportOptions): Promise<string>;
  supportsClass(className: MarkdownWorkspaceThemeClassName): Promise<boolean>;
}

export interface ActiveDocument {
  readonly uri: string;
  readonly language: string;
  readonly content: string;
  readonly version?: string;
}

export interface SelectionRange {
  readonly start: number;
  readonly end: number;
  readonly text?: string;
}

export interface HostEditorApi {
  getActiveDocument(): Promise<ActiveDocument | null>;
  getSelections(): Promise<readonly SelectionRange[]>;
  insertText(text: string): Promise<void>;
  replaceSelections(next: string | readonly string[]): Promise<void>;
  setDocumentContent(content: string): Promise<void>;
}

export interface WorkspaceProjectSummary {
  readonly id: string;
  readonly name: string;
  readonly path?: string;
}

export interface WorkspaceFileSummary {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly kind: "file" | "folder";
}

export interface HostWorkspaceApi {
  listProjects(): Promise<readonly WorkspaceProjectSummary[]>;
  getActiveProject(): Promise<WorkspaceProjectSummary | null>;
  getActiveFile(): Promise<WorkspaceFileSummary | null>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
}

export interface ExtensionLocaleCatalog {
  readonly locale: string;
  readonly messages: Readonly<Record<string, string>>;
}

export interface ExtensionLocaleCatalogLoader {
  readonly defaultLocale?: string;
  readonly fallbackLocale?: string;
  readonly loaders: Readonly<Record<string, () => ExtensionLocaleCatalog | Promise<ExtensionLocaleCatalog>>>;
}

export interface HostI18nApi {
  getLocale(): Promise<string>;
  setLocale(locale: string): Promise<void>;
  ensureLocale(locale?: string): Promise<void>;
  format(label: I18nLabel | string): string;
  registerCatalog(extensionId: string, catalog: ExtensionLocaleCatalog): Disposable;
  registerCatalogLoader(extensionId: string, loader: ExtensionLocaleCatalogLoader): Disposable;
}

export interface DiagnosticRecord {
  readonly severity: "info" | "warning" | "error";
  readonly code: string;
  readonly message: string;
  readonly detail?: string;
}

export interface HostDiagnosticsApi {
  publish(extensionId: string, record: DiagnosticRecord): Promise<void>;
  clear(extensionId: string): Promise<void>;
}

export interface HostLoggerApi {
  debug(message: string, context?: unknown): MaybePromise<void>;
  info(message: string, context?: unknown): MaybePromise<void>;
  warn(message: string, context?: unknown): MaybePromise<void>;
  error(message: string, context?: unknown): MaybePromise<void>;
}

export interface HostEnvironment {
  readonly platform: "web" | "desktop" | "server";
  readonly mode: "development" | "production" | "test";
  readonly hostVersion: string;
  readonly runtimeVersion: string;
  readonly rendererVersion?: string;
  readonly editorVersion?: string;
  readonly grantedCapabilities?: readonly ExtensionCapability[];
}

export interface ExtensionHost {
  readonly apiVersion: string;
  readonly commands: HostCommandApi;
  readonly views: HostViewApi;
  readonly actionRail: HostActionRailApi;
  readonly settings: HostSettingsApi;
  readonly notifications: HostNotificationApi;
  readonly theme: HostThemeApi;
  readonly editor: HostEditorApi;
  readonly workspace: HostWorkspaceApi;
  readonly i18n: HostI18nApi;
  readonly diagnostics: HostDiagnosticsApi;
  readonly logger: HostLoggerApi;
  readonly environment: HostEnvironment;
}
