// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsModal } from './SettingsModal';

vi.mock('../../src/features/i18n/useClientI18n', () => ({
  useClientI18n: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe('SettingsModal', () => {
  it('does not render sidebar descriptions as sublabels', () => {
    render(
      <SettingsModal
        isOpen
        onClose={vi.fn()}
        sections={[
          {
            id: 'visual',
            title: 'Visual',
            description: 'Theme presets and visual surfaces.',
            panel: 'general',
            render: () => <div>Visual panel</div>,
          },
        ]}
      />,
    );

    expect(screen.getByText('VISUAL')).toBeInTheDocument();
    expect(screen.getByText('Theme presets and visual surfaces.')).toHaveClass('settings-content-description');
    expect(screen.queryByText('Theme presets and visual surfaces.', { selector: '.settings-sidebar-caption' })).not.toBeInTheDocument();
  });

  it('exposes stable sidebar section metadata for responsive tab policies', () => {
    render(
      <SettingsModal
        isOpen
        onClose={vi.fn()}
        sections={[
          {
            id: 'core.settings.keys',
            title: 'Key Map',
            description: 'Keyboard shortcuts.',
            panel: 'keys',
            render: () => <div>Key map panel</div>,
          },
        ]}
      />,
    );

    const keyMapButton = screen.getByRole('button', { name: 'Key Map' });
    expect(keyMapButton).toHaveAttribute('data-section-id', 'core.settings.keys');
    expect(keyMapButton).toHaveAttribute('data-panel', 'keys');
  });
});
