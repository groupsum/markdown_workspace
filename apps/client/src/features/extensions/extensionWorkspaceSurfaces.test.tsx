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
import { GeminiAgentView } from '../../../../../packages/extensions/extension-gemini-agent/src/components/GeminiAgentView';
import { GitOperationsExplorer, GitPane } from '../../../components/Chassis/Git/GitPane';

vi.mock('../../../services/storage', () => ({
  DB_NAME: 'TestDB',
  DB_VERSION: 1,
  storage: {
    getSetting: vi.fn(async () => null),
    setSetting: vi.fn(async () => undefined),
  },
}));

vi.mock('@mdwrk/markdown-renderer-react', () => ({
  MarkdownRenderer: ({ markdown }: { markdown: string }) => <div data-testid="mock-markdown-renderer">{markdown}</div>,
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
    const header = view.container.querySelector('.extension-manager-header');
    expect(header).not.toBeNull();
    expect(header).not.toHaveClass('settings-card');
    expect(header).not.toHaveClass('settings-card-stack');

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
      relationships: [{ className: '.workspace', bridgeTarget: 'host', selector: '.workspace', scope: 'host', sourceTokens: ['--bg-app'] }],
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
    const header = view.container.querySelector('.theme-studio-header');
    expect(header).not.toBeNull();
    expect(header).not.toHaveClass('settings-card');
    expect(header).not.toHaveClass('settings-card-stack');
    expect(view.container.querySelector('.theme-token-editor')).not.toBeNull();
    expect(view.container.querySelector('.theme-token-row')).not.toBeNull();
    expect(screen.getByLabelText('Color picker --bg-app')).toBeInTheDocument();
    expect(screen.getByText('Live preview surface')).toBeInTheDocument();
    expect(screen.queryByText('Export metadata')).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Color picker --bg-app'), { target: { value: '#334455' } });
    await waitFor(() => expect(service.setDraftToken).toHaveBeenCalledWith('--bg-app', '#334455'));

    fireEvent.change(screen.getByLabelText('Token value --bg-app'), { target: { value: '#223344' } });
    await waitFor(() => expect(service.setDraftToken).toHaveBeenCalledWith('--bg-app', '#223344'));

    fireEvent.click(screen.getByText(/Relationships/));
    await waitFor(() => expect(view.container.querySelector('.theme-class-editor')).not.toBeNull());
    fireEvent.change(screen.getByLabelText('Edit class token .workspace --bg-app'), { target: { value: '#445566' } });
    await waitFor(() => expect(service.setDraftToken).toHaveBeenCalledWith('--bg-app', '#445566'));

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
    const header = view.container.querySelector('.language-pack-studio-header');
    expect(header).not.toBeNull();
    expect(header).not.toHaveClass('settings-card');
    expect(header).not.toHaveClass('settings-card-stack');

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

  it('renders gemini agent as a conversation-first pane with thread browser and markdown preview', async () => {
    const service = {
      subscribe: () => () => {},
      getSnapshot: () => ({
        busy: false,
        lastIntent: 'custom-prompt',
        lastPrompt: 'Summarize this file',
        lastContext: {
          project: { id: 'proj-1', name: 'Gemini Workspace' },
          file: { id: 'file-1', name: 'README.md', path: 'docs/README.md' },
          document: { uri: 'file:///README.md', content: '# Preview\\n\\nRendered response.' },
          selections: [{ text: 'Selected text', start: 0, end: 13 }],
        },
        lastResponse: { text: '# Preview\\n\\nRendered response.', model: 'gemini-2.5-flash' },
        pendingDraft: '## Draft\\n\\nEdited output.',
        lastError: null,
        writebackBlockedReason: null,
        infoMessage: 'Ready',
        activeThreadId: 'thread-1',
        threads: [
          {
            id: 'thread-1',
            title: 'Summarize README',
            createdAt: '2026-05-02T12:00:00.000Z',
            updatedAt: '2026-05-02T12:01:00.000Z',
            messages: [
              { id: 'msg-1', role: 'user', text: 'Summarize this file', createdAt: '2026-05-02T12:00:00.000Z', intent: 'custom-prompt' },
              { id: 'msg-2', role: 'assistant', text: '# Preview\\n\\nRendered response.', createdAt: '2026-05-02T12:01:00.000Z', intent: 'custom-prompt' },
            ],
          },
        ],
      }),
      refreshContext: vi.fn(async () => {}),
      loadSettings: vi.fn(async () => ({
        endpoint: 'https://example.test',
        model: 'gemini-2.5-flash',
        authMode: 'api-key',
        apiKey: 'secret',
        systemPrompt: 'You are helpful.',
        temperature: 0.2,
        requestTimeoutMs: 30000,
        autoAttachDocument: true,
        autoAttachSelection: true,
        allowWriteBack: true,
      })),
      runIntent: vi.fn(async () => ({ text: '# Result', model: 'gemini-2.5-flash' })),
      updateDraft: vi.fn(),
      clearDraft: vi.fn(),
      clearResult: vi.fn(),
      applyDraft: vi.fn(async () => true),
      createThread: vi.fn(),
      selectThread: vi.fn(),
    } as any;

    const view = render(
      <GeminiAgentView
        service={service}
        close={vi.fn(async () => {})}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.getByText('Conversations')).toBeInTheDocument();
    expect(screen.getByText('Summarize README')).toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeInTheDocument();
    expect(screen.getByText('Markdown preview')).toBeInTheDocument();
    expect(screen.getByText('Summarize this file')).toBeInTheDocument();
    expect(screen.getByTestId('mock-markdown-renderer')).toHaveTextContent('## Draft\\n\\nEdited output.');

    fireEvent.click(screen.getByText('New conversation'));
    expect(service.createThread).toHaveBeenCalled();

    fireEvent.click(view.container.querySelector('button[title="Draft only"]') as HTMLButtonElement);
    expect(screen.getByDisplayValue('## Draft\\n\\nEdited output.')).toBeInTheDocument();

    fireEvent.click(view.container.querySelector('button[title="Single pane"]') as HTMLButtonElement);
    expect(screen.getByText('Conversation')).toBeInTheDocument();

    fireEvent.click(view.container.querySelector('button[title="Preview only"]') as HTMLButtonElement);
    expect(screen.getByText('Markdown preview')).toBeInTheDocument();
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
    expect(screen.getAllByText('INDEXEDDB').length).toBe(1);
  });

  it('keeps language pack studio settings compact without redundant data chips', () => {
    const languageSnapshot = {
      activeLocale: 'en',
      packs: [
        { locale: 'en', label: 'English', source: 'built-in', enabled: true },
        { locale: 'de', label: 'Deutsch', source: 'installed', enabled: false },
      ],
      tokens: [],
      loadingTokens: false,
    };
    const languageController = {
      subscribe: () => () => {},
      getSnapshot: () => languageSnapshot,
    } as any;

    const view = render(
      <LanguagePackStudioSettingsPanel controller={languageController} open={vi.fn(async () => {})} formatLabel={formatLabel} />,
    );

    expect(screen.getByText('ENABLED')).toBeInTheDocument();
    expect(screen.queryByText('English fallback')).not.toBeInTheDocument();
    expect(screen.queryByText('INDEXEDDB')).not.toBeInTheDocument();
    expect(view.container.querySelector('.settings-chip-row')).toBeNull();
  });
});
