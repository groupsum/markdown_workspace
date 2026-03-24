function hasSelectionText(selection) {
    return selection.end > selection.start && typeof selection.text === "string" && selection.text.length > 0;
}
export async function collectGeminiAgentContext(host) {
    const [project, file, document, selections] = await Promise.all([
        host.workspace.getActiveProject(),
        host.workspace.getActiveFile(),
        host.editor.getActiveDocument(),
        host.editor.getSelections(),
    ]);
    return {
        project,
        file,
        document,
        selections: selections.filter((selection) => selection.end >= selection.start),
    };
}
export function hasActiveDocumentContext(context) {
    return Boolean(context.document?.content && context.document.content.length > 0);
}
export function hasSelectedTextContext(context) {
    return context.selections.some(hasSelectionText);
}
export function getPrimarySelectionText(context) {
    const selection = context.selections.find(hasSelectionText);
    return selection?.text ?? "";
}
//# sourceMappingURL=context.js.map