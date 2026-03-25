import type { CSSProperties } from "react";
import type { ThemeTokenOverrides } from "@mdwrk/ui-tokens/theme-map";
export interface MarkdownEditorThemeVariables {
    readonly background?: string;
    readonly gutterBackground?: string;
    readonly border?: string;
    readonly foreground?: string;
    readonly foregroundMuted?: string;
    readonly accent?: string;
    readonly fontMono?: string;
    readonly padding?: string;
    readonly lineHeight?: string;
    readonly fontSize?: string;
}
export declare function createMarkdownEditorThemeStyle(variables?: MarkdownEditorThemeVariables): CSSProperties;
export declare function createMarkdownEditorThemeVariablesFromThemeTokens(overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function createMarkdownEditorThemeStyleFromThemeTokens(overrides?: ThemeTokenOverrides): CSSProperties;
export declare function useMarkdownSourceEditorTheme(variables?: MarkdownEditorThemeVariables): CSSProperties;
//# sourceMappingURL=theme.d.ts.map
