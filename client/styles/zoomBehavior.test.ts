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

  it('continues scaling typography, icons, and controls with --ui-scale', () => {
    const rootCss = read('./base/root.css');
    const headerCss = read('./base/chassis/header.css');
    const tabsCss = read('./base/ui-tabs.css');
    const actionRailCss = read('./base/chassis/action-rail.css');

    expect(rootCss).toContain('font-size: calc(12px * var(--ui-scale));');
    expect(rootCss).toContain('--header-btn-size: clamp(');
    expect(rootCss).toContain('--zoom-btn-size: clamp(');
    expect(rootCss).toContain('svg.lucide[width="14"]');
    expect(headerCss).toContain('width: var(--header-btn-size);');
    expect(headerCss).toContain('height: var(--header-btn-size);');
    expect(tabsCss).toContain('font-size: calc(10px * var(--ui-scale));');
    expect(tabsCss).toContain('height: var(--zoom-control-height);');
    expect(tabsCss).toContain('width: var(--zoom-btn-size);');
    expect(actionRailCss).toContain('width: calc(18px * var(--ui-scale));');
  });
});
