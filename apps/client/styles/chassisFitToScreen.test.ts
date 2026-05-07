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

  it('keeps the xs portrait preview pane and command rails inside the viewport width', () => {
    const responsiveCss = read('./base/chassis/responsive-small.css');
    const editorCss = read('./base/ui-editor.css');

    expect(responsiveCss).toContain('@media (max-width: 479px) and (max-aspect-ratio: 3/4)');
    expect(responsiveCss).toContain('--rail-height: 34px;');
    expect(responsiveCss).toContain('--status-height: 0px;');
    expect(responsiveCss).toContain('.action-rail {');
    expect(responsiveCss).toContain('max-width: 100vw;');
    expect(responsiveCss).toContain('.rail-btn {');
    expect(responsiveCss).toContain('flex: 0 0 var(--rail-btn-size);');
    expect(responsiveCss).toContain('grid-template-columns: minmax(0, 1fr) max-content;');
    expect(responsiveCss).toContain('.zoom-display {');
    expect(responsiveCss).toContain('min-width: 34px;');
    expect(responsiveCss).toContain('.header-btn {');
    expect(responsiveCss).toContain('flex: 0 0 24px;');
    expect(responsiveCss).toContain('display: none !important;');

    expect(editorCss).toContain('@media (max-width: 479px) and (max-aspect-ratio: 3/4)');
    expect(editorCss).toContain('--preview-pane-inline-padding: clamp(8px, 2.5vw, 12px);');
    expect(editorCss).toContain('.view-toolbar-group {');
    expect(editorCss).toContain('flex-wrap: wrap;');
    expect(editorCss).toContain('max-width: 100%;');
  });

  it('keeps mobile rails, tabs, scroll panes, and keyboard viewport inside the chassis contract', () => {
    const responsiveCss = read('./base/chassis/responsive-small.css');
    const shellCss = read('./base/shell-structure.css');

    expect(responsiveCss).toContain('--mobile-action-rail-flow: row-reverse;');
    expect(responsiveCss).toContain('flex-direction: var(--mobile-action-rail-flow);');
    expect(responsiveCss).toContain('.header-center .tab-bar');
    expect(responsiveCss).toContain('scroll-snap-type: x proximity;');
    expect(responsiveCss).toContain('.workspace-sidebar,\n  .git-sidebar {\n    width: 100%;');
    expect(responsiveCss).toContain('.workspace-sidebar-resizer {\n    display: none;');
    expect(responsiveCss).toContain('overscroll-behavior: contain;');
    expect(responsiveCss).toContain('--mobile-visual-keyboard-working-height: 50dvh;');
    expect(responsiveCss).toContain('body.keyboard-open .chassis-scaler');
    expect(responsiveCss).toContain('max-height: var(--mobile-visual-keyboard-max-pane-height);');
    expect(responsiveCss).toContain('grid-template-areas:\n      "top"\n      "main"\n      "rail";');
    expect(responsiveCss).toContain('grid-template-areas:\n      "rail top"\n      "rail main";');
    expect(responsiveCss.match(/\.status-bar \{\n    display: none !important;/g)?.length ?? 0).toBeGreaterThanOrEqual(2);

    expect(shellCss).toContain('grid-template-areas:\n      "top"\n      "main"\n      "rail";');
    expect(shellCss).toContain(':root[data-theme] body.keyboard-open .chassis-scaler');
    expect(shellCss).toContain(':root[data-theme] body.keyboard-open .status-bar');
    expect(shellCss).not.toContain('body.keyboard-open :root[data-theme]');
  });

  it('uses a mobile gesture settings tab while hiding the keyboard map tab on mobile', () => {
    const modalResponsiveCss = read('./base/modals/responsive.css');
    const surfaceRegistrations = read('../src/app/runtime/useCoreSurfaceRegistrations.tsx');

    expect(modalResponsiveCss).toContain('.settings-sidebar-btn[data-section-id="core.settings.keys"]');
    expect(modalResponsiveCss).toContain('display: none;');
    expect(surfaceRegistrations).toContain("id: 'core.settings.gestures'");
    expect(surfaceRegistrations).toContain("panel: 'keys'");
    expect(surfaceRegistrations).toContain("icon: { kind: 'lucide', name: 'Hand' }");
    expect(surfaceRegistrations).toContain('core.settings.gestures.keyboard.mapping');
    expect(surfaceRegistrations).toContain('Half-screen viewport');
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
