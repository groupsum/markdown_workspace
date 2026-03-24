import { getPrimarySelectionText } from "./context.js";
const section = (title, body) => `## ${title}\n${body.trim()}`;
function serializeContextMetadata(context) {
    return [
        `project: ${context.project?.name ?? "none"}`,
        `file: ${context.file?.path ?? context.file?.name ?? "none"}`,
        `documentUri: ${context.document?.uri ?? "none"}`,
        `selectionCount: ${context.selections.length}`,
    ].join("\n");
}
export function buildGeminiPrompt(intent, prompt, context, settings) {
    const parts = [section("Workspace context", serializeContextMetadata(context))];
    const selectionText = getPrimarySelectionText(context);
    if (intent === "summarize-current-file") {
        parts.push(section("Task", "Summarize the active markdown document. Focus on main ideas, structure, and action items. Preserve markdown references where useful."));
        parts.push(section("Document", context.document?.content ?? ""));
        return parts.join("\n\n").trim();
    }
    if (intent === "rewrite-selection") {
        parts.push(section("Task", prompt.trim() || "Rewrite the current markdown selection for clarity while preserving meaning and markdown formatting unless a structural change is explicitly required."));
        parts.push(section("Selected markdown", selectionText));
        if (settings.autoAttachDocument && context.document?.content) {
            parts.push(section("Full document for surrounding context", context.document.content));
        }
        return parts.join("\n\n").trim();
    }
    parts.push(section("Task", prompt.trim() || "Respond to the user request using the attached markdown context."));
    if (settings.autoAttachDocument && context.document?.content) {
        parts.push(section("Active markdown document", context.document.content));
    }
    if (settings.autoAttachSelection && selectionText) {
        parts.push(section("Current selection", selectionText));
    }
    return parts.join("\n\n").trim();
}
//# sourceMappingURL=prompt.js.map