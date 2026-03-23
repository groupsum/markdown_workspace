import type { I18nLabel } from "@markdown-workspace/extension-manifest";
import type { ExtensionConfigurationStore, ExtensionContext } from "@markdown-workspace/extension-host";
import type {
  MarkdownWorkspaceThemeClassName,
  MarkdownWorkspaceThemeTokenMap,
  MarkdownWorkspaceThemeTokenName,
  ThemeBridgeTarget,
  ThemeBridgeVariableDefinition,
  ThemeClassDefinition,
  ThemePreset,
  ThemeTokenDefinition,
} from "@markdown-workspace/theme-contract";

export type ThemeStudioExportTarget = "host" | ThemeBridgeTarget;

export interface ThemeStudioResolvedSettings {
  readonly autoPreviewOnEdit: boolean;
  readonly defaultExportTarget: ThemeStudioExportTarget;
  readonly compactCss: boolean;
  readonly packageNamePrefix: string;
  readonly defaultAuthor: string;
}

export interface ThemeStudioMetadata {
  readonly themeId: string;
  readonly themeName: string;
  readonly packageName: string;
  readonly author: string;
  readonly description: string;
}

export interface ThemeStudioClassRelationship {
  readonly className: MarkdownWorkspaceThemeClassName;
  readonly selector: `.${string}`;
  readonly scope: ThemeClassDefinition["scope"];
  readonly stability: ThemeClassDefinition["stability"];
  readonly bridgeTarget: ThemeBridgeTarget | "host";
  readonly sourceTokens: readonly MarkdownWorkspaceThemeTokenName[];
}

export interface ThemeStudioPackageArtifactFile {
  readonly path: string;
  readonly content: string;
  readonly mimeType: string;
}

export interface ThemeStudioPackageArtifact {
  readonly packageName: string;
  readonly files: readonly ThemeStudioPackageArtifactFile[];
}

export interface ThemeStudioExportArtifacts {
  readonly preset: ThemePreset;
  readonly json: string;
  readonly hostCss: string;
  readonly rendererCss: string;
  readonly editorCss: string;
  readonly packageArtifact: ThemeStudioPackageArtifact;
}

export interface ThemeStudioServiceSnapshot {
  readonly busy: boolean;
  readonly tokenDefinitions: readonly ThemeTokenDefinition[];
  readonly classDefinitions: readonly ThemeClassDefinition[];
  readonly rendererBridge: readonly ThemeBridgeVariableDefinition[];
  readonly editorBridge: readonly ThemeBridgeVariableDefinition[];
  readonly currentTokens: MarkdownWorkspaceThemeTokenMap | null;
  readonly draftTokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>;
  readonly relationships: readonly ThemeStudioClassRelationship[];
  readonly metadata: ThemeStudioMetadata;
  readonly lastExports: ThemeStudioExportArtifacts | null;
  readonly infoMessage: string | null;
  readonly lastError: string | null;
}

export interface ThemeStudioService {
  getSnapshot(): ThemeStudioServiceSnapshot;
  subscribe(listener: () => void): () => void;
  refresh(): Promise<void>;
  readSettings(): Promise<ThemeStudioResolvedSettings>;
  setDraftToken(token: MarkdownWorkspaceThemeTokenName, value: string): Promise<void>;
  setDraftTokens(tokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): Promise<void>;
  preview(): Promise<void>;
  apply(): Promise<void>;
  revert(): Promise<void>;
  updateMetadata(patch: Partial<ThemeStudioMetadata>): Promise<void>;
  generateExports(target?: ThemeStudioExportTarget): Promise<ThemeStudioExportArtifacts>;
}

export interface ThemeStudioReadSettingsOptions {
  readonly config: ExtensionConfigurationStore;
}

export interface ThemeStudioServiceDependencies {
  readonly context: ExtensionContext;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly now?: () => number;
}
