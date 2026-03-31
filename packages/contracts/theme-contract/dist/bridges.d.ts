import type { MarkdownWorkspaceThemeTokenName } from "./tokens.js";
export type ThemeBridgeTarget = "renderer" | "editor";
export interface ThemeBridgeVariableDefinition {
    readonly target: ThemeBridgeTarget;
    readonly cssCustomProperty: `--${string}`;
    readonly sourceToken: MarkdownWorkspaceThemeTokenName;
    readonly description: string;
    readonly stability: "stable" | "provisional";
}
export declare const MARKDOWN_WORKSPACE_THEME_BRIDGES: readonly [{
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-fg-primary";
    readonly sourceToken: "fg-primary";
    readonly description: "Renderer primary foreground bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-fg-secondary";
    readonly sourceToken: "fg-secondary";
    readonly description: "Renderer secondary foreground bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-bg-surface";
    readonly sourceToken: "bg-panel";
    readonly description: "Renderer surface background bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-border-color";
    readonly sourceToken: "border-color";
    readonly description: "Renderer border bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-accent";
    readonly sourceToken: "accent";
    readonly description: "Renderer accent bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-code-bg";
    readonly sourceToken: "bg-inset";
    readonly description: "Renderer code background bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-code-fg";
    readonly sourceToken: "fg-primary";
    readonly description: "Renderer code foreground bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-code-border";
    readonly sourceToken: "border-color";
    readonly description: "Renderer code border bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-font-ui";
    readonly sourceToken: "font-ui";
    readonly description: "Renderer UI font bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-font-mono";
    readonly sourceToken: "font-mono";
    readonly description: "Renderer monospace font bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-line-height";
    readonly sourceToken: "markdown-line-height";
    readonly description: "Renderer body line-height bridge.";
    readonly stability: "stable";
}, {
    readonly target: "renderer";
    readonly cssCustomProperty: "--mw-heading-line-height";
    readonly sourceToken: "markdown-heading-line-height";
    readonly description: "Renderer heading line-height bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-bg-surface";
    readonly sourceToken: "bg-panel";
    readonly description: "Editor surface background bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-bg-gutter";
    readonly sourceToken: "bg-inset";
    readonly description: "Editor gutter background bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-border-color";
    readonly sourceToken: "border-color";
    readonly description: "Editor border bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-fg-primary";
    readonly sourceToken: "fg-primary";
    readonly description: "Editor primary foreground bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-fg-muted";
    readonly sourceToken: "fg-muted";
    readonly description: "Editor muted foreground bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-accent";
    readonly sourceToken: "accent";
    readonly description: "Editor accent bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-font-mono";
    readonly sourceToken: "font-mono";
    readonly description: "Editor monospace font bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-editor-padding";
    readonly sourceToken: "editor-padding";
    readonly description: "Editor padding bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-line-height";
    readonly sourceToken: "editor-line-rhythm";
    readonly description: "Editor line-height bridge.";
    readonly stability: "stable";
}, {
    readonly target: "editor";
    readonly cssCustomProperty: "--mwe-gutter-width";
    readonly sourceToken: "line-number-gutter-width";
    readonly description: "Editor line-number gutter-width bridge.";
    readonly stability: "stable";
}];
export declare const MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES: readonly ThemeBridgeVariableDefinition[];
export declare const MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES: readonly ThemeBridgeVariableDefinition[];
export declare function getThemeBridgeDefinitions(target: ThemeBridgeTarget): readonly ThemeBridgeVariableDefinition[];
//# sourceMappingURL=bridges.d.ts.map