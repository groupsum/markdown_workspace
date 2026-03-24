// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import '@markdown-workspace/testing/vitest-setup';

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ExtensionManifest, I18nLabel } from '@markdown-workspace/extension-manifest';
import type {
  DiagnosticRecord,
  Disposable,
  ExtensionContext,
  ExtensionHost,
  RegisteredActionRailItem,
  RegisteredCommand,
  RegisteredSettingsSection,
  RegisteredView,
} from '@markdown-workspace/extension-host';
import { EXTENSION_HOST_API_VERSION } from '@markdown-workspace/extension-host';
import {
  EXTENSION_RUNTIME_VERSION,
  createExtensionRuntime,
  createInMemoryExtensionRuntimeStorage,
  type BundledExtensionCatalogEntry,
  type ExtensionRuntimeRegistrationSink,
} from '@markdown-workspace/extension-runtime';
import { THEME_CONTRACT_VERSION } from '@markdown-workspace/theme-contract';
import {
  createExtensionManagerBundledEntry,
  EXTENSION_MANAGER_VIEW_ID,
  extensionManagerManifest,
} from '../src/index';
import { ExtensionManagerView } from '../src/components/ExtensionManagerView';

const formatLabel = (label: I18nLabel | string): string => typeof label === 'string' ? label : label.defaultMessage;

interface HostHarness {
  host: ExtensionHost;
  commands: RegisteredCommand[];
  views: RegisteredView[];
  railItems: RegisteredActionRailItem[];
  settingsSections: RegisteredSettingsSection[];
  notifications: string[];
  diagnostics: Record<string, DiagnosticRecord[]>;
  setGrantedCapabilities(capabilities: readonly string[]): void;
}

function createManifest(overrides: Partial<ExtensionManifest> & Pick<ExtensionManifest, 'id' | 'packageName' | 'displayName' | 'description'>): ExtensionManifest {
  return {
    manifestVersion: 1,
    id: overrides.id,
    packageName: overrides.packageName,
    version: '1.0.0',
    displayName: overrides.displayName,
    description: overrides.description,
    kind: 'bundled',
    icon: { kind: 'lucide', name: 'Puzzle' },
    enabledByDefault: true,
    capabilities: ['view.register', 'actionRail.register', 'notification.publish', 'settings.read', 'settings.write'],
    compatibility: {
      manifestVersion: 1,
      hostApi: EXTENSION_HOST_API_VERSION,
      runtime: EXTENSION_RUNTIME_VERSION,
      app: '>=1.3.49',
      themeContract: THEME_CONTRACT_VERSION,
    },
    entry: {
      module: './index.js',
      export: 'extension',
    },
    contributions: {
      commands: [],
      views: [],
      components: [],
      actionRail: [],
      settingsSections: [],
    },
    ...overrides,
  };
}

function createHostHarness(): HostHarness {
  const commands: RegisteredCommand[] = [];
  const views: RegisteredView[] = [];
  const railItems: RegisteredActionRailItem[] = [];
  const settingsSections: RegisteredSettingsSection[] = [];
  const notifications: string[] = [];
  const diagnostics: Record<string, DiagnosticRecord[]> = {};
  const hostSettings = new Map<string, unknown>();
  const hostSettingListeners = new Map<string, Set<(value: unknown | null) => void>>();
  const openedViews: string[] = [];

  const watchSetting = <T,>(key: string, listener: (value: T | null) => void): Disposable => {
    const bucket = hostSettingListeners.get(key) ?? new Set();
    bucket.add(listener as (value: unknown | null) => void);
    hostSettingListeners.set(key, bucket);
    return {
      dispose() {
        const active = hostSettingListeners.get(key);
        if (!active) return;
        active.delete(listener as (value: unknown | null) => void);
        if (active.size === 0) hostSettingListeners.delete(key);
      },
    };
  };

  const emitSetting = (key: string, value: unknown | null) => {
    for (const listener of Array.from(hostSettingListeners.get(key) ?? [])) {
      listener(value);
    }
  };

  const host: ExtensionHost = {
    apiVersion: EXTENSION_HOST_API_VERSION,
    commands: {
      async execute(id: string): Promise<unknown> {
        const command = commands.find((candidate) => candidate.id === id);
        return await command?.execute();
      },
      async list() {
        return commands.map((command) => command.id);
      },
    },
    views: {
      async open(id: string): Promise<void> {
        openedViews.push(id);
      },
      async close(): Promise<void> {},
      async focus(): Promise<void> {},
      async list() {
        return views;
      },
    },
    actionRail: {
      async list() {
        return railItems;
      },
      async reveal(): Promise<void> {},
      async setBadge(): Promise<void> {},
    },
    settings: {
      async get<T = unknown>(key: string): Promise<T | null> {
        return (hostSettings.has(key) ? hostSettings.get(key) : null) as T | null;
      },
      async set<T = unknown>(key: string, value: T): Promise<void> {
        hostSettings.set(key, value);
        emitSetting(key, value ?? null);
      },
      async remove(key: string): Promise<void> {
        hostSettings.delete(key);
        emitSetting(key, null);
      },
      watch: watchSetting,
    },
    notifications: {
      async info(message) { notifications.push(formatLabel(message)); },
      async warn(message) { notifications.push(formatLabel(message)); },
      async error(message) { notifications.push(formatLabel(message)); },
    },
    theme: {
      async getToken() { return null; },
      async getTokenMap() { return {}; },
      async getTokens() { return []; },
      async getClassNames() { return []; },
      async getThemeBridge() { return []; },
      async getThemeBridgeVariables() { return {}; },
      async setDraftToken() {},
      async setDraftTokens() {},
      async previewTheme() {},
      async applyDraft() {},
      async discardDraft() {},
      async exportTheme() {
        return {
          metadata: { id: 'test-theme', name: 'Test Theme', description: 'Test theme preset' },
          compatibility: { contract: '1.0.0' },
          tokens: {},
        };
      },
      async exportThemeCss() { return ':root {}'; },
      async supportsClass() { return true; },
    },
    editor: {
      async getActiveDocument() { return null; },
      async getSelections() { return []; },
      async insertText() {},
      async replaceSelections() {},
      async setDocumentContent() {},
    },
    workspace: {
      async listProjects() { return []; },
      async getActiveProject() { return null; },
      async getActiveFile() { return null; },
      async readFile() { return ''; },
      async writeFile() {},
    },
    i18n: {
      async getLocale() { return 'en'; },
      async setLocale() {},
      async ensureLocale() {},
      format: formatLabel,
      registerCatalog() {
        return { dispose() {} };
      },
      registerCatalogLoader() {
        return { dispose() {} };
      },
    },
    diagnostics: {
      async publish(extensionId, record) {
        diagnostics[extensionId] = [...(diagnostics[extensionId] ?? []), record];
      },
      async clear(extensionId) {
        diagnostics[extensionId] = [];
      },
    },
    logger: {
      debug() {}, info() {}, warn() {}, error() {},
    },
    environment: {
      platform: 'web',
      mode: 'test',
      hostVersion: '1.3.49',
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      grantedCapabilities: [
        'view.register',
        'actionRail.register',
        'notification.publish',
        'settings.read',
        'settings.write',
      ],
    },
  };

  return { host, commands, views, railItems, settingsSections, notifications, diagnostics, setGrantedCapabilities(capabilities) { (host as unknown as { environment: ExtensionHost['environment'] }).environment = { ...host.environment, grantedCapabilities: capabilities as never }; } };
}

function createRegistrationSink(harness: HostHarness): ExtensionRuntimeRegistrationSink {
  return {
    registerCommand(_extensionId, command) {
      harness.commands.push(command);
      return { dispose() {
        const index = harness.commands.indexOf(command);
        if (index >= 0) harness.commands.splice(index, 1);
      } };
    },
    registerView(_extensionId, view) {
      harness.views.push(view);
      return { dispose() {
        const index = harness.views.indexOf(view);
        if (index >= 0) harness.views.splice(index, 1);
      } };
    },
    registerActionRailItem(_extensionId, item) {
      harness.railItems.push(item);
      return { dispose() {
        const index = harness.railItems.indexOf(item);
        if (index >= 0) harness.railItems.splice(index, 1);
      } };
    },
    registerSettingsSection(_extensionId, section) {
      harness.settingsSections.push(section);
      return { dispose() {
        const index = harness.settingsSections.indexOf(section);
        if (index >= 0) harness.settingsSections.splice(index, 1);
      } };
    },
  };
}

function createBundledEntry(options: {
  manifest: ExtensionManifest;
  activation?: 'eager' | 'lazy';
  onActivate?: (context: ExtensionContext) => Promise<void> | void;
  onDeactivate?: (context: ExtensionContext) => Promise<void> | void;
  loadError?: Error;
}): BundledExtensionCatalogEntry {
  return {
    manifest: options.manifest,
    activation: options.activation ?? 'eager',
    async load() {
      if (options.loadError) throw options.loadError;
      return {
        manifest: options.manifest,
        activate: async (context) => {
          await options.onActivate?.(context);
        },
        deactivate: options.onDeactivate,
      };
    },
  };
}

function renderManagerView(runtime: ReturnType<typeof createExtensionRuntime>) {
  return render(
    <ExtensionManagerView
      runtime={runtime}
      close={vi.fn(async () => {})}
      formatLabel={formatLabel}
      defaultSettings={{ showCompatibility: true, showDiagnostics: true }}
    />,
  );
}

describe('extension-manager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('registers the extension manager bundled entry, view, command, and rail contribution', async () => {
    const harness = createHostHarness();
    const storage = createInMemoryExtensionRuntimeStorage();
    const runtime = createExtensionRuntime({
      host: harness.host,
      registrationSink: createRegistrationSink(harness),
      storage,
    });

    const entry = createExtensionManagerBundledEntry({ runtime });
    runtime.registerBundledExtension(entry);
    await runtime.start();

    expect(runtime.get(extensionManagerManifest.id)?.status).toBe('active');
    expect(harness.commands.some((command) => command.id === extensionManagerManifest.contributions.commands[0]?.id)).toBe(true);
    expect(harness.views.some((view) => view.id === EXTENSION_MANAGER_VIEW_ID)).toBe(true);
    expect(harness.railItems.some((item) => item.id === extensionManagerManifest.contributions.actionRail[0]?.id)).toBe(true);
    expect(harness.diagnostics[extensionManagerManifest.id]?.some((record) => record.code === 'EXT_MANAGER_READY')).toBe(true);

    await runtime.stop();
  });

  it('renders manager view and bundled extension inventory', async () => {
    const harness = createHostHarness();
    const runtime = createExtensionRuntime({
      host: harness.host,
      registrationSink: createRegistrationSink(harness),
      storage: createInMemoryExtensionRuntimeStorage(),
    });

    const inventoryManifest = createManifest({
      id: 'core.inventory',
      packageName: '@markdown-workspace/inventory',
      displayName: { defaultMessage: 'Inventory Extension' },
      description: { defaultMessage: 'Inventory test extension.' },
    });

    runtime.registerBundledExtension(createBundledEntry({
      manifest: inventoryManifest,
      onActivate(context) {
        context.registerView({
          id: 'core.inventory.view',
          title: { defaultMessage: 'Inventory View' },
          location: 'modal',
          render: () => null,
        });
        context.registerActionRailItem({
          id: 'core.inventory.rail',
          title: { defaultMessage: 'Inventory Rail' },
          icon: { kind: 'lucide', name: 'Puzzle' },
          group: 'extensions',
          target: { kind: 'view', viewId: 'core.inventory.view' },
        });
      },
    }));

    await runtime.start();
    renderManagerView(runtime);

    expect(await screen.findByText('Extension Manager')).toBeInTheDocument();
    expect(screen.getByText('Inventory Extension')).toBeInTheDocument();
    expect(screen.getByText('core.inventory')).toBeInTheDocument();
    expect(screen.getByText('Bundled')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('Compatible with the current host, runtime, and theme contract.')).toBeInTheDocument();

    await runtime.stop();
  });

  it('persists enabled state toggles through runtime restarts', async () => {
    const harness = createHostHarness();
    const storage = createInMemoryExtensionRuntimeStorage();

    const manifest = createManifest({
      id: 'core.toggle',
      packageName: '@markdown-workspace/toggle',
      displayName: { defaultMessage: 'Toggle Extension' },
      description: { defaultMessage: 'Toggle test extension.' },
    });

    const createRuntimeInstance = () => {
      const runtime = createExtensionRuntime({
        host: harness.host,
        registrationSink: createRegistrationSink(harness),
        storage,
      });
      runtime.registerBundledExtension(createBundledEntry({ manifest }));
      return runtime;
    };

    let runtime = createRuntimeInstance();
    await runtime.start();
    renderManagerView(runtime);

    const disableButton = await screen.findByRole('button', { name: 'Disable core.toggle' });
    fireEvent.click(disableButton);
    await waitFor(() => expect(runtime.get('core.toggle')?.enabled).toBe(false));
    await waitFor(() => expect(runtime.get('core.toggle')?.status).toBe('disabled'));
    await runtime.stop();

    runtime = createRuntimeInstance();
    await runtime.start();
    expect(runtime.get('core.toggle')?.enabled).toBe(false);
    expect(runtime.get('core.toggle')?.status).toBe('disabled');
    await runtime.stop();
  });

  it('renders schema-driven settings forms and persists config values', async () => {
    const harness = createHostHarness();
    const storage = createInMemoryExtensionRuntimeStorage();
    const runtime = createExtensionRuntime({
      host: harness.host,
      registrationSink: createRegistrationSink(harness),
      storage,
    });

    const manifest = createManifest({
      id: 'core.settings-form',
      packageName: '@markdown-workspace/settings-form',
      displayName: { defaultMessage: 'Settings Form Extension' },
      description: { defaultMessage: 'Settings form test extension.' },
      settingsSchema: {
        version: 1,
        sections: [
          { id: 'general', title: { defaultMessage: 'General' } },
        ],
        fields: [
          {
            key: 'toastOnActivate',
            kind: 'boolean',
            sectionId: 'general',
            label: { defaultMessage: 'Show activation toast' },
            defaultValue: true,
          },
          {
            key: 'mode',
            kind: 'select',
            sectionId: 'general',
            label: { defaultMessage: 'Mode' },
            defaultValue: 'safe',
            options: [
              { value: 'safe', label: { defaultMessage: 'Safe' } },
              { value: 'advanced', label: { defaultMessage: 'Advanced' } },
            ],
          },
        ],
      },
    });

    runtime.registerBundledExtension(createBundledEntry({ manifest }));
    await runtime.start();
    renderManagerView(runtime);

    const settingsSummary = screen.getAllByText('Settings')[0];
    fireEvent.click(settingsSummary);

    const checkbox = await screen.findByLabelText('Show activation toast');
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);

    const modeSelect = await screen.findByLabelText('Mode');
    fireEvent.change(modeSelect, { target: { value: 'advanced' } });

    await waitFor(async () => {
      expect(await runtime.getConfigurationStore('core.settings-form').get('toastOnActivate')).toBe(false);
      expect(await runtime.getConfigurationStore('core.settings-form').get('mode')).toBe('advanced');
    });

    await runtime.stop();
  });

  it('shows granted and missing permissions and compatibility issues', async () => {
    const harness = createHostHarness();
    harness.setGrantedCapabilities(['view.register']);
    const runtime = createExtensionRuntime({
      host: harness.host,
      registrationSink: createRegistrationSink(harness),
      storage: createInMemoryExtensionRuntimeStorage(),
    });

    const manifest = createManifest({
      id: 'core.permissions',
      packageName: '@markdown-workspace/permissions',
      displayName: { defaultMessage: 'Permissions Extension' },
      description: { defaultMessage: 'Permission and compatibility test extension.' },
      capabilities: ['view.register', 'actionRail.register', 'settings.read'],
      compatibility: {
        manifestVersion: 1,
        hostApi: '1.0.0',
        runtime: '1.0.0',
        app: '>=99.0.0',
        themeContract: '1.0.0',
      },
    });

    runtime.registerBundledExtension(createBundledEntry({ manifest }));
    await runtime.start();
    renderManagerView(runtime);

    expect(screen.getByText('view.register')).toBeInTheDocument();
    expect(screen.getByText('actionRail.register')).toBeInTheDocument();
    expect(screen.getByText('settings.read')).toBeInTheDocument();
    expect(screen.getByText('One or more compatibility issues were detected.')).toBeInTheDocument();
    expect(screen.getAllByText(/Expected app to satisfy/).length).toBeGreaterThan(0);

    await runtime.stop();
  });

  it('shows health and diagnostics when extension activation fails', async () => {
    const harness = createHostHarness();
    const runtime = createExtensionRuntime({
      host: harness.host,
      registrationSink: createRegistrationSink(harness),
      storage: createInMemoryExtensionRuntimeStorage(),
    });

    const manifest = createManifest({
      id: 'core.failing',
      packageName: '@markdown-workspace/failing',
      displayName: { defaultMessage: 'Failing Extension' },
      description: { defaultMessage: 'Fails during activation.' },
    });

    runtime.registerBundledExtension(createBundledEntry({
      manifest,
      onActivate() {
        throw new Error('Activation exploded.');
      },
    }));

    await runtime.start();
    renderManagerView(runtime);

    expect(await screen.findByText('Last error')).toBeInTheDocument();
    expect(screen.getByText('Activation exploded.')).toBeInTheDocument();
    expect(screen.getByText(/EXT_RUNTIME_ACTIVATE_FAILED/)).toBeInTheDocument();

    await runtime.stop();
  });
});
