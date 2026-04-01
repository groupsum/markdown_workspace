import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY,
  readStoredMarkdownProfileConfigSync,
  writeStoredMarkdownProfileConfig,
  type MarkdownProfileConfig,
} from './profileConfig';

function createWindowStub() {
  const storage = new Map<string, string>();
  return {
    localStorage: {
      getItem: (key: string) => (storage.has(key) ? storage.get(key)! : null),
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    },
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

describe('markdown profile config snapshot identity', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      writable: true,
      value: createWindowStub(),
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      writable: true,
      value: originalWindow,
    });
  });

  it('returns the same snapshot reference when localStorage payload is unchanged', () => {
    const config: MarkdownProfileConfig = {
      baseProfile: 'gfm-default',
      enabledExtensions: ['footnotes'],
      trustedHtmlPreview: false,
    };

    writeStoredMarkdownProfileConfig(config);
    const first = readStoredMarkdownProfileConfigSync();
    const second = readStoredMarkdownProfileConfigSync();

    expect(second).toBe(first);
    expect(second.enabledExtensions).toEqual(['footnotes']);
  });

  it('returns a new snapshot reference when payload changes', () => {
    writeStoredMarkdownProfileConfig({
      baseProfile: 'gfm-default',
      enabledExtensions: ['footnotes'],
      trustedHtmlPreview: false,
    });
    const first = readStoredMarkdownProfileConfigSync();

    window.localStorage.setItem(
      MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY,
      JSON.stringify({
        baseProfile: 'gfm-default',
        enabledExtensions: ['footnotes'],
        trustedHtmlPreview: true,
      }),
    );

    const second = readStoredMarkdownProfileConfigSync();
    expect(second).not.toBe(first);
    expect(second.enabledExtensions).toEqual(['footnotes']);
    expect(second.trustedHtmlPreview).toBe(true);
  });
});
