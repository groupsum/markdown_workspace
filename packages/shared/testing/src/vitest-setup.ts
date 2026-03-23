import { installMatchMediaStub } from "./browser.js";

function installScrollToStub(): () => void {
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

function installResizeObserverStub(): () => void {
  const original = (globalThis as typeof globalThis & { ResizeObserver?: unknown }).ResizeObserver;

  class ResizeObserverStub {
    observe(): void {
      // no-op for tests
    }

    unobserve(): void {
      // no-op for tests
    }

    disconnect(): void {
      // no-op for tests
    }
  }

  (globalThis as typeof globalThis & { ResizeObserver: typeof ResizeObserverStub }).ResizeObserver = ResizeObserverStub;

  return () => {
    if (original === undefined) {
      delete (globalThis as typeof globalThis & { ResizeObserver?: unknown }).ResizeObserver;
      return;
    }
    (globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver = original;
  };
}

export interface MarkdownWorkspaceVitestSetupCleanup {
  restore(): void;
}

export function installMarkdownWorkspaceVitestSetup(): MarkdownWorkspaceVitestSetupCleanup {
  const restorers = [installMatchMediaStub(), installScrollToStub(), installResizeObserverStub()];

  return {
    restore(): void {
      while (restorers.length > 0) {
        const restore = restorers.pop();
        restore?.();
      }
    },
  };
}

installMarkdownWorkspaceVitestSetup();
