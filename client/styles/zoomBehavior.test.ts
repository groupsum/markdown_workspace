import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) =>
  readFileSync(resolve(__dirname, relativePath), 'utf8');

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


  it('caps zoom controls at 175%', () => {
    const uiStateTs = read('../hooks/useUIState.ts');

    expect(uiStateTs).toContain('const MAX_ZOOM = 1.75;');
  });

  it('applies a 1.1 baseline scale at 100% zoom', () => {
    const chassisTsx = read('../components/Chassis/Chassis.tsx');

    expect(chassisTsx).toContain('const BASE_UI_SCALE_MULTIPLIER = 1.1;');
    expect(chassisTsx).toContain("document.documentElement.style.setProperty('--ui-scale', String(zoom * BASE_UI_SCALE_MULTIPLIER));");
  });

  it('continues scaling typography, icons, and controls with --ui-scale', () => {
    const rootCss = read('./base/root.css');
    const tabsCss = read('./base/ui-tabs.css');
    const actionRailCss = read('./base/chassis/action-rail.css');

    expect(rootCss).toContain('font-size: calc(12px * var(--ui-scale));');
    expect(rootCss).toContain('svg.lucide[width="14"]');
    expect(tabsCss).toContain('font-size: calc(10px * var(--ui-scale));');
    expect(actionRailCss).toContain('width: calc(18px * var(--ui-scale));');
  });
});
