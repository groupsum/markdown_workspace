const unique = (values) => Array.from(new Set(values));
export function buildThemeStudioClassRelationships(classes, rendererBridge, editorBridge) {
    const rendererTokens = unique(rendererBridge.map((definition) => definition.sourceToken));
    const editorTokens = unique(editorBridge.map((definition) => definition.sourceToken));
    return classes.map((definition) => ({
        className: definition.name,
        selector: definition.selector,
        scope: definition.scope,
        stability: definition.stability,
        bridgeTarget: definition.scope === "renderer" ? "renderer" : definition.scope === "editor" ? "editor" : "host",
        sourceTokens: definition.scope === "renderer"
            ? rendererTokens
            : definition.scope === "editor"
                ? editorTokens
                : unique([...rendererTokens, ...editorTokens]),
    }));
}
//# sourceMappingURL=relationship.js.map