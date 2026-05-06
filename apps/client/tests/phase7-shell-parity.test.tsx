// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilePlus } from 'lucide-react';
import { Footer } from '../components/Chassis/Footer/Footer';
import { ActionRail } from '../components/Chassis/ActionRail/ActionRail';
import { isMobileLandscapeViewport, isSplitViewAllowedForViewport } from '../src/features/layout/splitViewPolicy';

vi.mock('../src/features/i18n/useClientI18n', () => ({
  useClientI18n: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe('Phase 7 shell parity', () => {
  it('renders runtime shell label, build identifier, and update-ready badge in the status bar', () => {
    const { container } = render(
      <Footer
        cursorLine={12}
        cursorCol={4}
        unsaved={false}
        shellVersion="1.4.0"
        buildId="build-abc123"
        online
        isInstalled
        updateAvailable
        autoSaveEnabled
      />,
    );

    expect(screen.getByText('PWA: v1.4.0:build-abc123')).toBeInTheDocument();
    expect(screen.getByText('UPDATE_READY')).toBeInTheDocument();
    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText('AUTO-SAVE:')).toBeInTheDocument();
    expect(screen.getByText('ON')).toBeInTheDocument();
    expect(screen.queryByText(/IDB/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/SAVED|UNWRITTEN/)).not.toBeInTheDocument();
    expect(container.querySelector('.status-sep')).not.toBeInTheDocument();
  });

  it('uses the localized navigation aria-label for the action rail', () => {
    render(
      <ActionRail
        ariaLabel="Localized Primary Actions"
        items={[
          {
            id: 'new-file',
            title: 'New File',
            icon: <FilePlus size={16} />,
            onClick: () => {},
            group: 'workspace.primary',
            active: true,
          },
        ]}
      />,
    );

    expect(screen.getByRole('navigation', { name: 'Localized Primary Actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'New File' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('restores the v1 mobile-landscape split-view heuristic', () => {
    expect(isMobileLandscapeViewport({ width: 960, height: 640 })).toBe(true);
    expect(isSplitViewAllowedForViewport({ width: 960, height: 640 })).toBe(true);
    expect(isSplitViewAllowedForViewport({ width: 800, height: 980 })).toBe(false);
    expect(isSplitViewAllowedForViewport({ width: 1280, height: 720 })).toBe(true);
  });
});
