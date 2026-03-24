import type { ExtensionHost } from "@markdown-workspace/extension-host";
import type { GeminiAgentContextSnapshot } from "./types.js";
export declare function collectGeminiAgentContext(host: ExtensionHost): Promise<GeminiAgentContextSnapshot>;
export declare function hasActiveDocumentContext(context: GeminiAgentContextSnapshot): boolean;
export declare function hasSelectedTextContext(context: GeminiAgentContextSnapshot): boolean;
export declare function getPrimarySelectionText(context: GeminiAgentContextSnapshot): string;
//# sourceMappingURL=context.d.ts.map