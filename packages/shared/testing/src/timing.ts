export function flushMicrotasks(): Promise<void> {
  return Promise.resolve();
}

export function nextMacrotask(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
