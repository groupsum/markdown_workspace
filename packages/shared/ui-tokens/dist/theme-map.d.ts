import { type MarkdownWorkspaceThemeTokenMap, type MarkdownWorkspaceThemeTokenName } from "@mdwrk/theme-contract/tokens";
import { type ThemeBridgeTarget } from "@mdwrk/theme-contract/bridges";
export type ThemeTokenOverrides = Partial<Record<MarkdownWorkspaceThemeTokenName, string>>;
export interface ThemeCssVariableRenderOptions {
    readonly selector?: string;
    readonly indent?: string;
    readonly compact?: boolean;
}
export declare function createMarkdownWorkspaceThemeTokenMap(overrides?: ThemeTokenOverrides): MarkdownWorkspaceThemeTokenMap;
export declare function createThemeCssCustomPropertyRecord(overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function createThemeBridgeVariableRecord(target: ThemeBridgeTarget, overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function createRendererThemeBridgeVariableRecord(overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function createEditorThemeBridgeVariableRecord(overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function renderThemeCssVariables(overrides?: ThemeTokenOverrides, options?: ThemeCssVariableRenderOptions): string;
export declare function renderThemeBridgeCssVariables(target: ThemeBridgeTarget, overrides?: ThemeTokenOverrides, options?: ThemeCssVariableRenderOptions): string;
//# sourceMappingURL=theme-map.d.ts.map