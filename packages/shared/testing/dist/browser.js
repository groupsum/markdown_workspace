export function createMemoryStorage(initialState = {}) {
    const store = new Map(Object.entries(initialState));
    return {
        getItem(key) {
            return store.has(key) ? store.get(key) ?? null : null;
        },
        setItem(key, value) {
            store.set(key, value);
        },
        removeItem(key) {
            store.delete(key);
        },
        clear() {
            store.clear();
        },
        key(index) {
            return Array.from(store.keys())[index] ?? null;
        },
        get length() {
            return store.size;
        },
    };
}
export function installMatchMediaStub(matches = false) {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: (query) => ({
            matches,
            media: query,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => false,
        }),
    });
    return () => {
        Object.defineProperty(window, "matchMedia", {
            configurable: true,
            writable: true,
            value: original,
        });
    };
}
//# sourceMappingURL=browser.js.map