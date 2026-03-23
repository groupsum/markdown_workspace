import type { GeminiAgentRequest, GeminiProviderCreateOptions, GeminiTextProvider } from "./types.js";
interface GeminiGenerateContentResponse {
    readonly candidates?: ReadonlyArray<{
        readonly content?: {
            readonly parts?: ReadonlyArray<{
                readonly text?: string;
            }>;
        };
    }>;
    readonly usageMetadata?: {
        readonly promptTokenCount?: number;
        readonly candidatesTokenCount?: number;
        readonly totalTokenCount?: number;
    };
}
export declare function resolveGeminiGenerateContentUrl(request: GeminiAgentRequest): string;
export declare function buildGeminiGenerateContentBody(request: GeminiAgentRequest): Record<string, unknown>;
export declare function extractGeminiText(response: GeminiGenerateContentResponse): string;
export declare function createGeminiTextProvider(options?: GeminiProviderCreateOptions): GeminiTextProvider;
export {};
//# sourceMappingURL=provider.d.ts.map