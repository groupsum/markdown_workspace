import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { THEMES } from '../data/themes';

const read = (relativePath: string) =>
  readFileSync(resolve(__dirname, relativePath), 'utf8');

const toEm = (raw: string): number => {
  const value = raw.trim().toLowerCase();
  if (value.endsWith('em')) return Number.parseFloat(value);
  if (value.endsWith('rem')) return Number.parseFloat(value);
  if (value === '0') return 0;
  throw new Error(`Unsupported margin unit for heading token: ${raw}`);
};

describe('zoom scaling boundaries', () => {
  it('keeps chassis dimension tokens independent from --ui-scale', () => {
    const rootCss = read('./base/root.css');

    expect(rootCss).toContain('--header-height: 32px;');
    expect(rootCss).toContain('--rail-width: 44px;');
    expect(rootCss).toContain('--rail-height: 44px;');
    expect(rootCss).toContain('--sidebar-width: 200px;');
    expect(rootCss).toContain('--status-height: 20px;');
    expect(rootCss).toContain('--panel-header-height: 30px;');
    expect(rootCss).toContain('--app-gap: 4px;');
  });

  it('enforces zoom bounds at 70% minimum and 150% maximum', () => {
    const uiStateTs = read('../hooks/useUIState.ts');

    expect(uiStateTs).toContain('Math.max(0.7, Math.min(1.5, zoom + delta))');
  });

  it('applies zoom directly to --ui-scale in chassis effect', () => {
    const rootCss = read('./base/root.css');
    const chassisTsx = read('../components/Chassis/Chassis.tsx');

    expect(rootCss).toContain('--ui-scale: 1.3;');
    expect(chassisTsx).toContain("document.documentElement.style.setProperty('--ui-scale', String(zoom));");
  });

  it('continues scaling typography, icons, and controls with --ui-scale', () => {
    const rootCss = read('./base/root.css');
    const tabsCss = read('./base/ui-tabs.css');
    const actionRailCss = read('./base/chassis/action-rail.css');

    expect(rootCss).toContain('font-size: calc(12px * var(--ui-scale));');
    expect(rootCss).toContain('svg.lucide[width="14"]');
    expect(tabsCss).toContain('font-size: calc(12px * var(--ui-scale));');
    expect(actionRailCss).toContain('width: calc(18px * var(--ui-scale));');
  });

  it('keeps zoom behavior token contract available for every theme stylesheet', () => {
    const themeStylesIndexTsx = read('./index.tsx');

    for (const theme of THEMES) {
      const key = /-/.test(theme.id) ? `'${theme.id}'` : theme.id;
      expect(themeStylesIndexTsx).toContain(`${key}:`);
    }
  });
});

describe('markdown h1 margin-top contract across themes', () => {
  it('sets the default markdown h1 margin-top to 0.25em', () => {
    const markdownCss = read('./base/markdown.css');
    expect(markdownCss).toContain('margin-top: 0.25em;');
  });

  it('keeps every theme h1 margin-top greater than 0.0em and no more than 0.5em', () => {
    const markdownCss = read('./base/markdown.css');
    const baseMatch = markdownCss.match(/\.markdown-body h1[\s\S]*?margin-top:\s*([^;]+);/);

    expect(baseMatch).not.toBeNull();
    const baseMargin = toEm(baseMatch![1]);
    expect(baseMargin).toBeGreaterThan(0);
    expect(baseMargin).toBeLessThanOrEqual(0.5);

    for (const theme of THEMES) {
      const css = read(`./themes/theme-${theme.id}.css`);
      const h1Blocks = css.match(/\.markdown-body h1[\s\S]*?\}/g) ?? [];

      for (const block of h1Blocks) {
        const marginMatch = block.match(/margin-top:\s*([^;]+);/);
        if (!marginMatch) {
          continue;
        }

        const marginTop = toEm(marginMatch[1]);
        expect(marginTop, `Theme ${theme.id} margin-top should be > 0`).toBeGreaterThan(0);
        expect(marginTop, `Theme ${theme.id} margin-top should be <= 0.5`).toBeLessThanOrEqual(0.5);
      }
    }
  });
});
