// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ExtensionManagerView } from '../../../../../packages/extensions/extension-manager/src/components/ExtensionManagerView';
import { ExtensionManagerSettingsPanel } from '../../../../../packages/extensions/extension-manager/src/components/ExtensionManagerSettingsPanel';
import { ThemeStudioView } from '../../../../../packages/extensions/extension-theme-studio/src/components/ThemeStudioView';
import { ThemeStudioSettingsPanel } from '../../../../../packages/extensions/extension-theme-studio/src/components/ThemeStudioSettingsPanel';
import { LanguagePackStudioView } from '../../../../../packages/extensions/extension-language-pack-studio/src/components/LanguagePackStudioView';
import { LanguagePackStudioSettingsPanel } from '../../../../../packages/extensions/extension-language-pack-studio/src/components/LanguagePackStudioSettingsPanel';
import { GitOperationsExplorer, GitPane } from '../../../components/Chassis/Git/GitPane';

vi.mock('../../../services/storage', () => ({
  DB_NAME: 'TestDB',
  DB_VERSION: 1,
  storage: {
    getSetting: vi.fn(async () => null),
    setSetting: vi.fn(async () => undefined),
  },
}));

const formatLabel = (label: { defaultMessage?: string } | string): string =>
  typeof label === 'string' ? label : (label.defaultMessage ?? '');

describe('extension workspace surfaces', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders git source control as the workspace panel browser, not an internal pane sidebar', () => {
    const explorer = render(<GitOperationsExplorer activeFile={null} unsaved={false} />);

    expect(screen.getByText('Source Control')).toBeInTheDocument();
    expect(explorer.container.querySelector('.workspace-panel-content.git-source-control-browser')).not.toBeNull();

    cleanup();

    const setWorkspaceSidebarOpen = vi.fn();
    const pane = render(
      <GitPane
        files={[]}
        activeFile={null}
        theme={'classic' as any}
        unsaved={false}
        onClose={vi.fn()}
        shellSidebarOpen
        onShellSidebarToggle={setWorkspaceSidebarOpen}
      />,
    );

    expect(pane.container.querySelector('.git-workspace .workspace-sidebar')).toBeNull();
    fireEvent.click(screen.getByTitle('Toggle source-control panel'));
    expect(setWorkspaceSidebarOpen).toHaveBeenCalledWith(false);
  });

  it('renders extension manager as a pane surface with workspace-sidebar and layout toggles', async () => {
    const managerSnapshot = {
      extensions: [
        {
          id: 'core.demo',
          source: 'bundled',
          status: 'active',
          enabled: true,
          activation: 'eager',
          diagnostics: [],
          grantedCapabilities: [],
          missingCapabilities: [],
          compatibility: { compatible: true, issues: [] },
          manifest: {
            id: 'core.demo',
            packageName: '@mdwrk/demo',
            version: '1.0.0',
            icon: { kind: 'lucide', name: 'Plug' },
            displayName: { defaultMessage: 'Demo Extension' },
            description: { defaultMessage: 'Demo description' },
          },
        },
      ],
      catalogEntries: [],
    };
    const runtime = {
      subscribe: () => () => {},
      getSnapshot: () => managerSnapshot,
      installFromCatalogEntry: vi.fn(),
      removeInstalledExtension: vi.fn(),
      setEnabled: vi.fn(),
      activate: vi.fn(),
      deactivate: vi.fn(),
      getConfigurationStore: vi.fn(() => ({ get: vi.fn(async () => null), set: vi.fn(async () => {}) })),
    } as any;

    const view = render(
      <ExtensionManagerView
        runtime={runtime}
        close={vi.fn(async () => {})}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.queryByTestId('extension-manager-modal')).not.toBeInTheDocument();
    expect(view.container.querySelector('.workspace-sidebar.editor-pane-column')).not.toBeNull();
    expect(screen.getByLabelText('Filter extension browser')).toBeInTheDocument();

    fireEvent.click(view.container.querySelector('button[title="Single pane"]') as HTMLButtonElement);
    await waitFor(() => expect(screen.queryByLabelText('Resize Extension Manager panes')).not.toBeInTheDocument());
    expect(screen.queryByText('Catalog Browser')).not.toBeInTheDocument();

    fireEvent.click(view.container.querySelector('button[title="Split screen"]') as HTMLButtonElement);
    await waitFor(() => expect(screen.getByLabelText('Resize Extension Manager panes')).toBeInTheDocument());
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.queryByText('Catalog Browser')).not.toBeInTheDocument();

    fireEvent.click(view.container.querySelector('button[title="Toggle sidebar"]') as HTMLButtonElement);
    await waitFor(() => expect(view.container.querySelector('.workspace-sidebar.editor-pane-column')).toBeNull());
  });

  it('renders theme studio as a pane surface with workspace-sidebar and layout toggles', async () => {
    const themeSnapshot = {
      busy: false,
      infoMessage: 'Ready',
      lastError: null,
      metadata: {
        themeName: 'Test Theme',
        themeId: 'test-theme',
        packageName: '@mdwrk/test-theme',
        author: 'MdWrk',
        description: 'Theme test',
      },
      tokenDefinitions: [{ name: '--bg-app', category: 'color', description: 'App background color', defaultValue: '#000000' }],
      currentTokens: { '--bg-app': '#111111' },
      draftTokens: {},
      relationships: [{ className: '.workspace', bridgeTarget: 'host', selector: '.workspace', scope: 'host' }],
      lastExports: null,
    };
    const service = {
      subscribe: () => () => {},
      getSnapshot: () => themeSnapshot,
      refresh: vi.fn(async () => {}),
      readSettings: vi.fn(async () => ({ defaultExportTarget: 'host' })),
      preview: vi.fn(async () => {}),
      apply: vi.fn(async () => {}),
      revert: vi.fn(async () => {}),
      generateExports: vi.fn(async () => {}),
      importPackageArtifact: vi.fn(async () => {}),
      updateMetadata: vi.fn(async () => {}),
      setDraftToken: vi.fn(async () => {}),
      clearDraftToken: vi.fn(async () => {}),
    } as any;

    const view = render(
      <ThemeStudioView
        service={service}
        close={vi.fn(async () => {})}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.queryByTestId('theme-studio-modal')).not.toBeInTheDocument();
    expect(view.container.querySelector('.workspace-sidebar.editor-pane-column')).not.toBeNull();
    expect(screen.getByLabelText('Filter theme browser')).toBeInTheDocument();
    expect(screen.getByLabelText('Color picker --bg-app')).toBeInTheDocument();
    expect(screen.getByText('Live preview surface')).toBeInTheDocument();
    expect(screen.queryByText('Export metadata')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Color picker --bg-app'), { target: { value: '#334455' } });
    await waitFor(() => expect(service.setDraftToken).toHaveBeenCalledWith('--bg-app', '#334455'));

    fireEvent.change(screen.getByLabelText('Token value --bg-app'), { target: { value: '#223344' } });
    await waitFor(() => expect(service.setDraftToken).toHaveBeenCalledWith('--bg-app', '#223344'));

    fireEvent.click(view.container.querySelector('button[title="Single pane"]') as HTMLButtonElement);
    await waitFor(() => expect(screen.queryByLabelText('Resize Theme Studio panes')).not.toBeInTheDocument());

    fireEvent.click(view.container.querySelector('button[title="Split screen"]') as HTMLButtonElement);
    await waitFor(() => expect(screen.getByLabelText('Resize Theme Studio panes')).toBeInTheDocument());
  });

  it('renders language pack studio as a pane surface with workspace-sidebar and layout toggles', async () => {
    const languageSnapshot = {
      activeLocale: 'en',
      loadingTokens: false,
      tokens: [{ key: 'core.views.settings.title', defaultMessage: 'System Configuration', source: 'core' }],
      packs: [
        { locale: 'en', label: 'English', enabled: true, messages: {}, source: 'built-in' },
        { locale: 'de', label: 'Deutsch', enabled: true, messages: { 'core.views.settings.title': 'Systemkonfiguration' }, source: 'installed' },
      ],
    };
    const controller = {
      subscribe: () => () => {},
      getSnapshot: () => languageSnapshot,
      importArtifact: vi.fn(async () => {}),
      createArtifact: vi.fn(async () => ({ locale: 'it', label: 'Italiano', enabled: true, messages: {}, source: 'installed' })),
      updateArtifact: vi.fn(async () => ({ locale: 'de', label: 'Deutsch', enabled: true, messages: { 'core.views.settings.title': 'Systemeinstellungen' }, source: 'installed' })),
      activate: vi.fn(async () => {}),
      remove: vi.fn(async () => {}),
      setEnabled: vi.fn(async () => {}),
      setAllEnabled: vi.fn(async () => {}),
      exportArtifact: vi.fn(() => null),
    } as any;

    const view = render(
      <LanguagePackStudioView
        controller={controller}
        close={vi.fn(async () => {})}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.queryByTestId('language-pack-manager-modal')).not.toBeInTheDocument();
    expect(view.container.querySelector('.workspace-sidebar.editor-pane-column')).not.toBeNull();
    expect(screen.getByLabelText('Filter language browser')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Deutsch'));
    fireEvent.change(screen.getByLabelText('Token value core.views.settings.title'), { target: { value: 'Systemeinstellungen' } });
    fireEvent.click(screen.getByText('Save pack'));
    await waitFor(() => expect(controller.updateArtifact).toHaveBeenCalledWith('de', expect.objectContaining({
      label: 'Deutsch',
      messages: { 'core.views.settings.title': 'Systemeinstellungen' },
    })));

    fireEvent.click(view.container.querySelector('button[title="Toggle sidebar"]') as HTMLButtonElement);
    await waitFor(() => expect(view.container.querySelector('.workspace-sidebar.editor-pane-column')).toBeNull());

    fireEvent.click(view.container.querySelector('button[title="Single pane"]') as HTMLButtonElement);
    fireEvent.click(view.container.querySelector('button[title="Split screen"]') as HTMLButtonElement);
    expect(controller.setAllEnabled).not.toHaveBeenCalled();
  });

  it('renders settings-menu content for extension manager, theme studio, and language pack studio', () => {
    const managerSnapshot = { extensions: [], catalogEntries: [] };
    const managerRuntime = {
      subscribe: () => () => {},
      getSnapshot: () => managerSnapshot,
    } as any;
    const themeSnapshot = {
      busy: false,
      metadata: { themeId: 'test-theme' },
      tokenDefinitions: [],
      relationships: [],
    };
    const themeService = {
      subscribe: () => () => {},
      getSnapshot: () => themeSnapshot,
    } as any;
    const languageSnapshot = { activeLocale: 'en', packs: [], tokens: [], loadingTokens: false };
    const languageController = {
      subscribe: () => () => {},
      getSnapshot: () => languageSnapshot,
    } as any;

    render(
      <>
        <ExtensionManagerSettingsPanel runtime={managerRuntime} open={vi.fn(async () => {})} formatLabel={formatLabel} />
        <ThemeStudioSettingsPanel service={themeService} open={vi.fn(async () => {})} formatLabel={formatLabel} />
        <LanguagePackStudioSettingsPanel controller={languageController} open={vi.fn(async () => {})} formatLabel={formatLabel} />
      </>,
    );

    expect(screen.getByText('Open manager')).toBeInTheDocument();
    expect(screen.getAllByText('Open studio').length).toBe(2);
    expect(screen.getAllByText('INDEXEDDB').length).toBeGreaterThan(1);
  });
});
