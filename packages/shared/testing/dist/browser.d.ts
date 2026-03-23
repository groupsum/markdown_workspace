export interface MemoryStorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    readonly length: number;
}
export declare function createMemoryStorage(initialState?: Readonly<Record<string, string>>): MemoryStorageLike;
export declare function installMatchMediaStub(matches?: boolean): () => void;
//# sourceMappingURL=browser.d.ts.map