export function defineMessages(messages) {
    return messages;
}
export function normalizeMessageDescriptor(descriptor, key) {
    if (typeof descriptor === "string") {
        return {
            key,
            defaultMessage: descriptor,
        };
    }
    return descriptor;
}
export function interpolateMessage(template, values = {}) {
    return template.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, name) => {
        const value = values[name];
        return value === null || value === undefined ? "" : String(value);
    });
}
export function formatMessage(descriptor, values) {
    const normalized = normalizeMessageDescriptor(descriptor);
    return interpolateMessage(normalized.defaultMessage, {
        ...(normalized.values ?? {}),
        ...(values ?? {}),
    });
}
//# sourceMappingURL=format.js.map