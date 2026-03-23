export const MARKDOWN_WORKSPACE_THEME_BRIDGES = [
    { target: "renderer", cssCustomProperty: "--mw-fg-primary", sourceToken: "fg-primary", description: "Renderer primary foreground bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-fg-secondary", sourceToken: "fg-secondary", description: "Renderer secondary foreground bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-bg-surface", sourceToken: "bg-panel", description: "Renderer surface background bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-border-color", sourceToken: "border-color", description: "Renderer border bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-accent", sourceToken: "accent", description: "Renderer accent bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-code-bg", sourceToken: "bg-inset", description: "Renderer code background bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-code-fg", sourceToken: "fg-primary", description: "Renderer code foreground bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-code-border", sourceToken: "border-color", description: "Renderer code border bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-font-ui", sourceToken: "font-ui", description: "Renderer UI font bridge.", stability: "stable" },
    { target: "renderer", cssCustomProperty: "--mw-font-mono", sourceToken: "font-mono", description: "Renderer monospace font bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-bg-surface", sourceToken: "bg-panel", description: "Editor surface background bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-bg-gutter", sourceToken: "bg-inset", description: "Editor gutter background bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-border-color", sourceToken: "border-color", description: "Editor border bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-fg-primary", sourceToken: "fg-primary", description: "Editor primary foreground bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-fg-muted", sourceToken: "fg-muted", description: "Editor muted foreground bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-accent", sourceToken: "accent", description: "Editor accent bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-font-mono", sourceToken: "font-mono", description: "Editor monospace font bridge.", stability: "stable" },
    { target: "editor", cssCustomProperty: "--mwe-editor-padding", sourceToken: "editor-padding", description: "Editor padding bridge.", stability: "stable" },
];
export const MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES = MARKDOWN_WORKSPACE_THEME_BRIDGES.filter((definition) => definition.target === "renderer");
export const MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES = MARKDOWN_WORKSPACE_THEME_BRIDGES.filter((definition) => definition.target === "editor");
export function getThemeBridgeDefinitions(target) {
    return target === "renderer"
        ? MARKDOWN_WORKSPACE_RENDERER_THEME_BRIDGES
        : MARKDOWN_WORKSPACE_EDITOR_THEME_BRIDGES;
}
//# sourceMappingURL=bridges.js.map