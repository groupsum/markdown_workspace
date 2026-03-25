import type React from "react";
import { type ThemeTokenOverrides } from "@mdwrk/ui-tokens/theme-map";
import type { MarkdownRendererThemeVariables } from "./types.js";
export declare function createMarkdownRendererThemeStyle(variables?: MarkdownRendererThemeVariables): React.CSSProperties;
export declare function createMarkdownRendererThemeVariablesFromThemeTokens(overrides?: ThemeTokenOverrides): Readonly<Record<`--${string}`, string>>;
export declare function createMarkdownRendererThemeStyleFromThemeTokens(overrides?: ThemeTokenOverrides): React.CSSProperties;
//# sourceMappingURL=theme.d.ts.map