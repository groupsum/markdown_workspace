import { MARKDOWN_WORKSPACE_THEME_CLASSES, } from "@markdown-workspace/theme-contract/classes";
export { MARKDOWN_WORKSPACE_THEME_CLASS_NAMES, MARKDOWN_WORKSPACE_THEME_CLASSES, } from "@markdown-workspace/theme-contract/classes";
export const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES = Object.freeze(MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.scope === "renderer")
    .map((definition) => definition.name));
function resolveGroup(name) {
    if (name === "markdown-body")
        return "scope";
    if (name.startsWith("md-h"))
        return "heading";
    if (["md-p", "md-strong", "md-em", "md-hr", "md-blockquote", "md-link"].includes(name))
        return "text";
    if (["md-ul", "md-ol", "md-li", "md-task-list-item"].includes(name))
        return "list";
    if (["md-checkbox"].includes(name))
        return "form";
    if (name.startsWith("md-table"))
        return "table";
    return "code";
}
export const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASSES = Object.freeze(MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.scope === "renderer")
    .map((definition) => ({ ...definition, group: resolveGroup(definition.name) })));
export const MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES = Object.freeze(MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.stability === "stable")
    .map((definition) => definition.name));
export const MARKDOWN_WORKSPACE_STABLE_THEME_CLASSES = Object.freeze(MARKDOWN_WORKSPACE_THEME_CLASSES.filter((definition) => definition.stability === "stable"));
//# sourceMappingURL=classes.js.map