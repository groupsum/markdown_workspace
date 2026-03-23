function normalizeLocale(locale) {
    return locale.trim().replace(/_/g, "-").toLowerCase();
}
function qualifyMessageKey(namespace, key) {
    if (!namespace)
        return key;
    return key.startsWith(`${namespace}.`) ? key : `${namespace}.${key}`;
}
export function createLocaleFallbackChain(locale, options = {}) {
    const normalizedLocale = normalizeLocale(locale);
    const defaultLocale = normalizeLocale(options.defaultLocale ?? "en");
    const fallbackLocale = normalizeLocale(options.fallbackLocale ?? defaultLocale);
    const segments = normalizedLocale.split("-").filter(Boolean);
    const candidates = [];
    for (let index = segments.length; index > 0; index -= 1) {
        candidates.push(segments.slice(0, index).join("-"));
    }
    if (!candidates.includes(fallbackLocale)) {
        candidates.push(fallbackLocale);
    }
    if (!candidates.includes(defaultLocale)) {
        candidates.push(defaultLocale);
    }
    return Object.freeze(candidates.filter(Boolean));
}
export function createNamespacedLocaleCatalog(namespace, locale, messages) {
    return {
        locale,
        messages: Object.freeze(Object.fromEntries(Object.entries(messages).map(([key, value]) => [qualifyMessageKey(namespace, key), value]))),
    };
}
export async function loadLocaleCatalogs(options) {
    const chain = createLocaleFallbackChain(options.locale, {
        defaultLocale: options.defaultLocale,
        fallbackLocale: options.fallbackLocale,
    });
    const loaded = [];
    const seen = new Set();
    for (const candidate of chain) {
        const loader = options.loaders[candidate];
        if (!loader || seen.has(candidate))
            continue;
        const catalog = await loader();
        loaded.push(options.namespace
            ? createNamespacedLocaleCatalog(options.namespace, catalog.locale, catalog.messages)
            : catalog);
        seen.add(candidate);
    }
    return Object.freeze(loaded);
}
//# sourceMappingURL=loaders.js.map