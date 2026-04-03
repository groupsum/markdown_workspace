export interface LanguagePackStudioArtifact {
    readonly kind: 'mdwrk-language-pack';
    readonly version: 1;
    readonly locale: string;
    readonly label: string;
    readonly enabled: boolean;
    readonly messages: Readonly<Record<string, string>>;
    readonly source: 'built-in' | 'installed';
}
export interface LanguagePackTokenDefinition {
    readonly key: string;
    readonly defaultMessage: string;
    readonly source: string;
}
export interface LanguagePackStudioSnapshot {
    readonly activeLocale: string;
    readonly packs: readonly LanguagePackStudioArtifact[];
    readonly tokens: readonly LanguagePackTokenDefinition[];
    readonly loadingTokens: boolean;
}
export interface LanguagePackStudioController {
    getSnapshot(): LanguagePackStudioSnapshot;
    subscribe(listener: () => void): () => void;
    importArtifact(payload: string): Promise<LanguagePackStudioArtifact>;
    createArtifact(input: {
        locale: string;
        label: string;
        messages: Record<string, string>;
        enabled?: boolean;
    }): Promise<LanguagePackStudioArtifact>;
    activate(locale: string): Promise<void>;
    remove(locale: string): Promise<void>;
    setEnabled(locale: string, enabled: boolean): Promise<void>;
    setAllEnabled(enabled: boolean): Promise<void>;
    exportArtifact(locale: string): LanguagePackStudioArtifact | null;
}
export interface LanguagePackStudioEntryOptions {
    readonly controller: LanguagePackStudioController;
}
//# sourceMappingURL=types.d.ts.map