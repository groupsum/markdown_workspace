import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const themesDir = resolve(__dirname, './themes');
const themeCssFiles = readdirSync(themesDir).filter((name) => name.startsWith('theme-') && name.endsWith('.css')).sort();

const readTheme = (fileName: string) => readFileSync(resolve(themesDir, fileName), 'utf8');

const fixedChassisTokens = [
  '--header-height: 32px;',
  '--rail-width: 44px;',
  '--rail-height: 44px;',
  '--sidebar-width: 200px;',
  '--status-height: 20px;',
  '--panel-header-height: 30px;'
];

describe('theme zoom behavior contract', () => {
  it('keeps a zoom-safe chassis token contract in every theme', () => {
    expect(themeCssFiles.length).toBeGreaterThan(0);

    for (const fileName of themeCssFiles) {
      const css = readTheme(fileName);
      for (const token of fixedChassisTokens) {
        expect(css, `${fileName} is missing ${token}`).toContain(token);
      }
    }
  });

  it('prevents theme-level chassis scaling rules in every theme', () => {
    for (const fileName of themeCssFiles) {
      const css = readTheme(fileName);

      expect(css, `${fileName} must not scale chassis-scaler`).not.toMatch(/\.chassis-scaler\s*\{[^}]*transform\s*:/s);
      expect(css, `${fileName} must not use zoom property`).not.toMatch(/\bzoom\s*:/);
      expect(css, `${fileName} must not override chassis tokens with var\(--ui-scale\)`).not.toMatch(/--(?:header-height|rail-width|rail-height|sidebar-width|status-height|panel-header-height)\s*:\s*[^;]*var\(--ui-scale\)/);
    }
  });
});
