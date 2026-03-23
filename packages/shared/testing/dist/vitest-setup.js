import { installMatchMediaStub } from "./browser.js";
function installScrollToStub() {
    const original = window.scrollTo;
    Object.defineProperty(window, "scrollTo", {
        configurable: true,
        writable: true,
        value: () => undefined,
    });
    return () => {
        Object.defineProperty(window, "scrollTo", {
            configurable: true,
            writable: true,
            value: original,
        });
    };
}
function installResizeObserverStub() {
    const original = globalThis.ResizeObserver;
    class ResizeObserverStub {
        observe() {
            // no-op for tests
        }
        unobserve() {
            // no-op for tests
        }
        disconnect() {
            // no-op for tests
        }
    }
    globalThis.ResizeObserver = ResizeObserverStub;
    return () => {
        if (original === undefined) {
            delete globalThis.ResizeObserver;
            return;
        }
        globalThis.ResizeObserver = original;
    };
}
export function installMarkdownWorkspaceVitestSetup() {
    const restorers = [installMatchMediaStub(), installScrollToStub(), installResizeObserverStub()];
    return {
        restore() {
            while (restorers.length > 0) {
                const restore = restorers.pop();
                restore?.();
            }
        },
    };
}
installMarkdownWorkspaceVitestSetup();
//# sourceMappingURL=vitest-setup.js.map