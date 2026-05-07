import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) => readFileSync(resolve(__dirname, relativePath), 'utf8');

describe('UIX icon, toolbar, palette, and default theme contracts', () => {
  it('uses Anodized Billet as the default client theme', () => {
    const constants = read('../constants.ts');

    expect(constants).toContain("DEFAULT_THEME_ID = 'anodized-billet'");
  });

  it('keeps header settings icon spacing explicit and stable', () => {
    const headerCss = read('./base/chassis/header.css');

    expect(headerCss).toContain('.header-btn--settings svg');
    expect(headerCss).toContain('margin-top: 2px;');
    expect(headerCss).toContain('margin-right: 2px;');
    expect(headerCss).toContain('flex: 0 0 24px;');
  });

  it('exposes action rail icon mappings in workspace preferences', () => {
    const preferencesPanel = read('../src/features/preferences/WorkspacePreferencesPanel.tsx');
    const inputModalCss = read('./base/modals/input-modal.css');

    expect(preferencesPanel).toContain('ACTION_RAIL_ICON_MAPPINGS');
    expect(preferencesPanel).toContain("'core.toggle-explorer': <Folder size={14} />");
    expect(preferencesPanel).toContain("'core.git-pane-rail': <GitBranch size={14} />");
    expect(preferencesPanel).toContain('className="pwa-toggle-icon"');
    expect(inputModalCss).toContain('.pwa-toggle-icon');
    expect(inputModalCss).toContain('flex: 0 0 22px;');
  });

  it('allows view toolbars to y-scroll without taking over theme CSS ownership', () => {
    const editorCss = read('./base/ui-editor.css');
    const shellCss = read('./base/shell-structure.css');
    const panelToolbarCss = read('./base/chassis/panel-toolbar.css');

    expect(editorCss).toContain('.view-toolbar');
    expect(editorCss).toContain('overflow-y: auto;');
    expect(editorCss).toContain('scrollbar-gutter: stable both-edges;');
    expect(shellCss).toContain(':root[data-theme] .view-toolbar');
    expect(shellCss).toContain('overflow-y: auto;');
    expect(panelToolbarCss).toContain('overflow-y: auto;');
  });

  it('keeps command palette responsive with bounded dynamic viewport sizing', () => {
    const commandPalette = read('../components/Modals/CommandPalette.tsx');
    const commandPaletteCss = read('./base/modals/command-palette.css');
    const responsiveCss = read('./base/modals/responsive.css');

    expect(commandPalette).toContain('role="dialog"');
    expect(commandPalette).toContain('aria-modal="true"');
    expect(commandPalette).toContain('role="listbox"');
    expect(commandPaletteCss).toContain('max-height: min(620px, calc(100dvh - 32px));');
    expect(commandPaletteCss).toContain('letter-spacing: 0;');
    expect(responsiveCss).toContain('height: 100dvh;');
    expect(responsiveCss).toContain('.cmd-badge');
  });

  it('compacts labeled icon controls instead of letting labels overflow compact rails', () => {
    const actionRailCss = read('./base/chassis/action-rail.css');

    expect(actionRailCss).toContain('.rail-btn-label');
    expect(actionRailCss).toContain('max-width: 9ch;');
    expect(actionRailCss).toContain('@media (max-width: 640px), (max-height: 520px)');
    expect(actionRailCss).toContain('display: none;');
    expect(actionRailCss).toContain('.rail-btn-badge');
  });
});
