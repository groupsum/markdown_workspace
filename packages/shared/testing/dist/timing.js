export function flushMicrotasks() {
    return Promise.resolve();
}
export function nextMacrotask() {
    return new Promise((resolve) => setTimeout(resolve, 0));
}
//# sourceMappingURL=timing.js.map