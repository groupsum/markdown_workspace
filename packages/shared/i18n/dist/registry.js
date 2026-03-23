import { formatMessage, normalizeMessageDescriptor } from "./format.js";
function normalizeLocale(locale) {
    return locale.trim().replace(/_/g, "-").toLowerCase();
}
function createLocaleChain(locale, fallbackLocale, defaultLocale) {
    const normalizedLocale = normalizeLocale(locale);
    const normalizedFallback = normalizeLocale(fallbackLocale);
    const normalizedDefault = normalizeLocale(defaultLocale);
    const segments = normalizedLocale.split("-").filter(Boolean);
    const candidates = [];
    for (let index = segments.length; index > 0; index -= 1) {
        candidates.push(segments.slice(0, index).join("-"));
    }
    if (!candidates.includes(normalizedFallback)) {
        candidates.push(normalizedFallback);
    }
    if (!candidates.includes(normalizedDefault)) {
        candidates.push(normalizedDefault);
    }
    return Object.freeze(candidates.filter(Boolean));
}
export function createLocaleRegistry(options = {}) {
    const defaultLocale = normalizeLocale(options.defaultLocale ?? "en");
    const fallbackLocale = normalizeLocale(options.fallbackLocale ?? defaultLocale);
    const catalogs = new Map();
    let activeLocale = defaultLocale;
    const getCatalog = (locale) => {
        const normalizedLocale = normalizeLocale(locale);
        const existing = catalogs.get(normalizedLocale);
        if (existing)
            return existing;
        const created = new Map();
        catalogs.set(normalizedLocale, created);
        return created;
    };
    const findMessage = (key, locale) => {
        for (const candidate of createLocaleChain(locale, fallbackLocale, defaultLocale)) {
            const message = getCatalog(candidate).get(key);
            if (message)
                return message;
        }
        return undefined;
    };
    return {
        getLocale() {
            return activeLocale;
        },
        setLocale(locale) {
            activeLocale = normalizeLocale(locale);
        },
        registerCatalog(catalog) {
            const target = getCatalog(catalog.locale);
            for (const [key, descriptor] of Object.entries(catalog.messages)) {
                target.set(key, normalizeMessageDescriptor(descriptor, key));
            }
        },
        hasMessage(key, locale = activeLocale) {
            return Boolean(findMessage(key, locale));
        },
        resolve(descriptor, values) {
            const normalized = normalizeMessageDescriptor(descriptor);
            const key = normalized.key;
            if (key) {
                const translated = findMessage(key, activeLocale);
                if (translated) {
                    return formatMessage({ ...translated, key }, values);
                }
            }
            return formatMessage(normalized, values);
        },
    };
}
//# sourceMappingURL=registry.js.map