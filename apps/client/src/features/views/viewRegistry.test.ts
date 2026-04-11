import { describe, expect, it, vi } from 'vitest';
import { createViewRegistry } from './viewRegistry';

describe('view registry', () => {
  it('opens and closes views', async () => {
    const registry = createViewRegistry();
    registry.register({
      id: 'core.settings',
      title: { defaultMessage: 'Settings' },
      location: 'modal',
      render: () => null,
      allowMultiple: false,
    });

    await registry.open('core.settings');
    expect(registry.isOpen('core.settings')).toBe(true);

    await registry.close('core.settings');
    expect(registry.isOpen('core.settings')).toBe(false);
  });

  it('tracks the active main view and updates app mode through the registry', async () => {
    const onAppModeChange = vi.fn();
    const registry = createViewRegistry({
      resolveAppMode: (view) => (view.id === 'core.git-pane' ? 'git' : 'work'),
      onAppModeChange,
    });
    registry.register({
      id: 'core.git-pane',
      title: { defaultMessage: 'Git' },
      location: 'main',
      render: () => null,
      allowMultiple: false,
    });

    await registry.open('core.git-pane');

    expect(registry.getSnapshot().activeMainViewId).toBe('core.git-pane');
    expect(onAppModeChange).toHaveBeenCalledWith('git');

    await registry.close('core.git-pane');

    expect(registry.getSnapshot().activeMainViewId).toBeNull();
    expect(onAppModeChange).toHaveBeenLastCalledWith('work');
  });

  it('switches between main views exclusively', async () => {
    const firstOnClose = vi.fn();
    const registry = createViewRegistry();
    registry.register({
      id: 'core.theme-studio.view',
      title: { defaultMessage: 'Theme Studio' },
      location: 'main',
      render: () => null,
      allowMultiple: false,
      onClose: firstOnClose,
    });
    registry.register({
      id: 'core.gemini-agent.view',
      title: { defaultMessage: 'Gemini' },
      location: 'main',
      render: () => null,
      allowMultiple: false,
    });

    await registry.open('core.theme-studio.view');
    await registry.open('core.gemini-agent.view');

    expect(registry.isOpen('core.theme-studio.view')).toBe(false);
    expect(registry.isOpen('core.gemini-agent.view')).toBe(true);
    expect(registry.getSnapshot().activeMainViewId).toBe('core.gemini-agent.view');
    expect(firstOnClose).toHaveBeenCalledTimes(1);
  });

  it('toggles an active main view closed', async () => {
    const registry = createViewRegistry();
    registry.register({
      id: 'core.gemini-agent.view',
      title: { defaultMessage: 'Gemini' },
      location: 'main',
      render: () => null,
      allowMultiple: false,
    });

    await registry.open('core.gemini-agent.view');
    await registry.toggle('core.gemini-agent.view');

    expect(registry.isOpen('core.gemini-agent.view')).toBe(false);
    expect(registry.getSnapshot().activeMainViewId).toBeNull();
  });

  it('preserves open semantics for modal views when toggle is used', async () => {
    const onOpen = vi.fn();
    const registry = createViewRegistry();
    registry.register({
      id: 'core.command-palette',
      title: { defaultMessage: 'Command Palette' },
      location: 'modal',
      render: () => null,
      allowMultiple: false,
      onOpen,
    });

    await registry.toggle('core.command-palette');

    expect(registry.isOpen('core.command-palette')).toBe(true);
    expect(registry.getSnapshot().activeMainViewId).toBeNull();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
