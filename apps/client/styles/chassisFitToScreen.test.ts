import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
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

  it('keeps status bar content on a single controlled row with runtime ellipsis', () => {
    const layoutCss = read('./base/chassis/layout.css');
    const statusCss = read('./base/chassis/status-bar.css');

    const statusBarBlock = layoutCss.match(/\.status-bar[\s\S]*?\n\}/)?.[0] ?? '';
    expect(statusBarBlock).toContain('width: 100%;');
    expect(statusBarBlock).toContain('min-width: 0;');
    expect(statusBarBlock).toContain('overflow: hidden;');

    const statusGroupsBlock = statusCss.match(/\.status-left,\n\.status-right[\s\S]*?\n\}/)?.[0] ?? '';
    expect(statusGroupsBlock).toContain('flex-wrap: nowrap;');
    expect(statusGroupsBlock).toContain('overflow: hidden;');
    expect(statusCss).toContain('.status-runtime .status-text-bold');
    expect(statusCss).toContain('text-overflow: ellipsis;');
  });

  it('keeps theme CSS out of chassis grid ownership for all bundled themes', () => {
    const themeFiles = readdirSync(resolve(__dirname, './themes'))
      .filter((entry) => entry.endsWith('.css'))
      .map((entry) => `./themes/${entry}`);

    for (const themeFile of themeFiles) {
      const themeCss = read(themeFile);
      expect(themeCss).not.toContain('grid-template-areas:');
      expect(themeCss).not.toContain('grid-column: 1 / -1;');
      expect(themeCss).not.toContain('width: 100vw;');
    }
  });
});
