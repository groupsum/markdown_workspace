// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsView } from './SettingsView';

const closeView = vi.fn();
const settingsSnapshot = {
  sections: [{
    id: 'general',
    title: { defaultMessage: 'General', key: 'core.settings.section.general' },
    panel: 'general',
    render: () => <div>General panel</div>,
  }],
};

const format = vi.fn((label: { key?: string; defaultMessage?: string } | string) => {
  if (typeof label === 'string') return label;
  return label.key ? `i18n:${label.key}` : (label.defaultMessage ?? '');
});

vi.mock('../app/runtime/ClientRuntimeContext', () => ({
  useClientRuntimeSnapshot: () => ({
    app: {
      state: {
        currentThemeDef: { name: 'Neon Grid' },
      },
    },
  }),
  useClientRuntimeServices: () => ({
    settingsRegistry: {
      subscribe: () => () => undefined,
      getSnapshot: () => settingsSnapshot,
    },
    i18n: {
      format,
    },
    views: {
      close: closeView,
    },
  }),
}));

vi.mock('./iconRenderer', () => ({
  renderExtensionIcon: () => null,
}));

describe('SettingsView', () => {
  it('renders modal labels through i18n formatting', () => {
    render(<SettingsView />);

    expect(screen.getByText('i18n:core.settings.title')).toBeTruthy();
    expect(screen.getByText('i18n:core.settings.activeTheme')).toBeTruthy();
    expect(screen.getByText('i18n:core.settings.exit')).toBeTruthy();
    expect(screen.getByText('i18n:core.settings.section.general')).toBeTruthy();
    expect(screen.getByText('Neon Grid')).toBeTruthy();

    expect(format).toHaveBeenCalledWith({ defaultMessage: 'System Configuration', key: 'core.settings.title' });
    expect(format).toHaveBeenCalledWith({ defaultMessage: 'ACTIVE_THEME', key: 'core.settings.activeTheme' });
    expect(format).toHaveBeenCalledWith({ defaultMessage: 'EXIT_CONFIG', key: 'core.settings.exit' });
  });
});
