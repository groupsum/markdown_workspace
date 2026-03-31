export function resolveGeminiGenerateContentUrl(request) {
    const rawEndpoint = request.settings.endpoint.replace(/\/+$/, "");
    const withPath = rawEndpoint.includes(":generateContent")
        ? rawEndpoint
        : `${rawEndpoint}/models/${request.settings.model}:generateContent`;
    if (request.settings.authMode !== "api-key" || !request.settings.apiKey) {
        return withPath;
    }
    const url = new URL(withPath);
    url.searchParams.set("key", request.settings.apiKey);
    return url.toString();
}
export function buildGeminiGenerateContentBody(request) {
    return {
        system_instruction: request.settings.systemPrompt
            ? {
                parts: [{ text: request.settings.systemPrompt }],
            }
            : undefined,
        generationConfig: {
            temperature: request.settings.temperature,
        },
        contents: [
            {
                role: "user",
                parts: [{ text: request.prompt }],
            },
        ],
    };
}
export function extractGeminiText(response) {
    const text = response.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    return text ?? "";
}
export function createGeminiTextProvider(options = {}) {
    const fetchImpl = options.fetchImpl ?? (typeof fetch === "function" ? fetch.bind(globalThis) : undefined);
    return {
        id: "gemini",
        async generate(request) {
            if (!fetchImpl) {
                throw new Error("No fetch implementation is available for Gemini requests.");
            }
            const controller = typeof AbortController === "function" ? new AbortController() : undefined;
            const timeout = controller ? setTimeout(() => controller.abort(), request.settings.requestTimeoutMs) : null;
            try {
                const response = await fetchImpl(resolveGeminiGenerateContentUrl(request), {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(buildGeminiGenerateContentBody(request)),
                    signal: controller?.signal,
                });
                if (!response.ok) {
                    const detail = await response.text();
                    throw new Error(`Gemini request failed (${response.status} ${response.statusText}): ${detail}`);
                }
                const json = await response.json();
                const text = extractGeminiText(json);
                if (!text) {
                    throw new Error("Gemini response did not include any text candidates.");
                }
                return {
                    text,
                    model: request.settings.model,
                    raw: json,
                    usage: {
                        promptTokens: json.usageMetadata?.promptTokenCount,
                        responseTokens: json.usageMetadata?.candidatesTokenCount,
                        totalTokens: json.usageMetadata?.totalTokenCount,
                    },
                };
            }
            finally {
                if (timeout)
                    clearTimeout(timeout);
            }
        },
    };
}
//# sourceMappingURL=provider.js.map