import type { ExtensionHost, SelectionRange } from "@markdown-workspace/extension-host";
import type { GeminiAgentContextSnapshot } from "./types.js";

function hasSelectionText(selection: SelectionRange): boolean {
  return selection.end > selection.start && typeof selection.text === "string" && selection.text.length > 0;
}

export async function collectGeminiAgentContext(host: ExtensionHost): Promise<GeminiAgentContextSnapshot> {
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

export function hasActiveDocumentContext(context: GeminiAgentContextSnapshot): boolean {
  return Boolean(context.document?.content && context.document.content.length > 0);
}

export function hasSelectedTextContext(context: GeminiAgentContextSnapshot): boolean {
  return context.selections.some(hasSelectionText);
}

export function getPrimarySelectionText(context: GeminiAgentContextSnapshot): string {
  const selection = context.selections.find(hasSelectionText);
  return selection?.text ?? "";
}
