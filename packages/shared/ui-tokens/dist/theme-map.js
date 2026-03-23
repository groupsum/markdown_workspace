import { MARKDOWN_WORKSPACE_THEME_TOKENS, } from "@markdown-workspace/theme-contract/tokens";
import { getThemeBridgeDefinitions, } from "@markdown-workspace/theme-contract/bridges";
export function createMarkdownWorkspaceThemeTokenMap(overrides = {}) {
    return Object.freeze(Object.fromEntries(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [
        definition.name,
        overrides[definition.name] ?? definition.defaultValue,
    ])));
}
export function createThemeCssCustomPropertyRecord(overrides = {}) {
    const tokenMap = createMarkdownWorkspaceThemeTokenMap(overrides);
    return Object.freeze(Object.fromEntries(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [
        definition.cssCustomProperty,
        tokenMap[definition.name],
    ])));
}
export function createThemeBridgeVariableRecord(target, overrides = {}) {
    const tokenMap = createMarkdownWorkspaceThemeTokenMap(overrides);
    return Object.freeze(Object.fromEntries(getThemeBridgeDefinitions(target).map((definition) => [
        definition.cssCustomProperty,
        tokenMap[definition.sourceToken],
    ])));
}
export function createRendererThemeBridgeVariableRecord(overrides = {}) {
    return createThemeBridgeVariableRecord("renderer", overrides);
}
export function createEditorThemeBridgeVariableRecord(overrides = {}) {
    return createThemeBridgeVariableRecord("editor", overrides);
}
export function renderThemeCssVariables(overrides = {}, options = {}) {
    const selector = options.selector ?? ":root";
    const indent = options.indent ?? "  ";
    const compact = options.compact ?? false;
    const propertyRecord = createThemeCssCustomPropertyRecord(overrides);
    const lines = Object.entries(propertyRecord).map(([property, value]) => `${indent}${property}: ${value};`);
    if (compact) {
        return `${selector}{${lines.map((line) => line.trim()).join("")}}`;
    }
    return `${selector} {\n${lines.join("\n")}\n}`;
}
export function renderThemeBridgeCssVariables(target, overrides = {}, options = {}) {
    const selector = options.selector ?? ":root";
    const indent = options.indent ?? "  ";
    const compact = options.compact ?? false;
    const propertyRecord = createThemeBridgeVariableRecord(target, overrides);
    const lines = Object.entries(propertyRecord).map(([property, value]) => `${indent}${property}: ${value};`);
    if (compact) {
        return `${selector}{${lines.map((line) => line.trim()).join("")}}`;
    }
    return `${selector} {\n${lines.join("\n")}\n}`;
}
//# sourceMappingURL=theme-map.js.map