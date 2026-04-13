import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) => readFileSync(resolve(__dirname, relativePath), 'utf8');

describe('chassis header and status bar fit-to-screen contract', () => {
  it('keeps the app header constrained to the chassis column width', () => {
    const layoutCss = read('./base/chassis/layout.css');
    const appHeaderBlock = layoutCss.match(/\.app-header[\s\S]*?\n\}/)?.[0] ?? '';

    expect(appHeaderBlock).toContain('width: 100%;');
    expect(appHeaderBlock).toContain('min-width: 0;');
    expect(appHeaderBlock).not.toContain('width: 100vw;');
  });

  it('prevents mobile status bar clipping by using horizontal overflow, not hidden clipping', () => {
    const responsiveCss = read('./base/chassis/responsive-small.css');

    expect(responsiveCss).toContain('overflow-x: auto;');
    expect(responsiveCss).toContain('overflow-y: hidden;');
    expect(responsiveCss).not.toContain('overflow: hidden;');
  });
});
