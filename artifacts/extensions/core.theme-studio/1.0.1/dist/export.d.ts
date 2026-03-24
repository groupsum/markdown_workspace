import { type MarkdownWorkspaceThemeTokenMap, type ThemePreset } from "@markdown-workspace/theme-contract";
import type { ThemeStudioExportArtifacts, ThemeStudioMetadata, ThemeStudioPackageArtifact, ThemeStudioResolvedSettings } from "./types.js";
export declare function sanitizeThemeIdentifier(value: string): string;
export declare function sanitizePackageName(value: string): string;
export declare function buildThemePreset(metadata: ThemeStudioMetadata, tokens: MarkdownWorkspaceThemeTokenMap): ThemePreset;
export declare function createThemePackageArtifact(preset: ThemePreset, css: {
    readonly host: string;
    readonly renderer: string;
    readonly editor: string;
}, metadata: ThemeStudioMetadata): ThemeStudioPackageArtifact;
export declare function buildThemeStudioExports(metadata: ThemeStudioMetadata, tokens: MarkdownWorkspaceThemeTokenMap, settings: ThemeStudioResolvedSettings): ThemeStudioExportArtifacts;
//# sourceMappingURL=export.d.ts.map