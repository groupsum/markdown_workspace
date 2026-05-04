// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkspaceMarkdownRenderer } from './WorkspaceMarkdownRenderer';
import { workspaceFilesManifest } from '../../../../packages/extensions/extension-workspace-files/src/manifest';

vi.mock('../../src/features/i18n/useClientI18n', () => ({
  useClientI18n: () => ({
    t: (_key: string, defaultMessage: string) => defaultMessage,
  }),
}));

vi.mock('../../src/features/preferences/workspacePreferences', () => ({
  useWorkspacePreferences: () => ({
    hidePreviewPolicy: true,
  }),
}));

vi.mock('../../src/features/markdownProfiles/profileConfig', () => ({
  getMarkdownProfileWarnings: () => [],
  useMarkdownProfileConfig: () => ({
    baseProfile: 'gfm',
    enabledExtensions: [],
    trustedHtml: false,
  }),
}));

describe('WorkspaceMarkdownRenderer preview actions', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders markdown export, html export, and print as preview overlay buttons', () => {
    const onExportMarkdown = vi.fn();
    const onExportHtml = vi.fn();
    const onPrintPreview = vi.fn();

    render(
      <WorkspaceMarkdownRenderer
        markdown="# Preview"
        theme="default"
        files={[]}
        onNavigate={vi.fn()}
        onExportMarkdown={onExportMarkdown}
        onExportHtml={onExportHtml}
        onPrintPreview={onPrintPreview}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Export Markdown' }));
    fireEvent.click(screen.getByRole('button', { name: 'Export HTML' }));
    fireEvent.click(screen.getByRole('button', { name: 'Print Preview' }));

    expect(onExportMarkdown).toHaveBeenCalledTimes(1);
    expect(onExportHtml).toHaveBeenCalledTimes(1);
    expect(onPrintPreview).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Preview actions')).toHaveClass('preview-pane-overlay-actions');
  });

  it('keeps print, markdown export, and html export commands out of the action rail manifest', () => {
    const actionRailIds = workspaceFilesManifest.contributions.actionRail?.map((item) => item.id) ?? [];
    const commandIds = workspaceFilesManifest.contributions.commands?.map((item) => item.id) ?? [];

    expect(commandIds).toContain('core.export-markdown');
    expect(commandIds).toContain('core.export-html');
    expect(commandIds).toContain('core.print-preview');
    expect(actionRailIds).not.toContain('core.export-markdown');
    expect(actionRailIds).not.toContain('core.export-html');
    expect(actionRailIds).not.toContain('core.print-preview');
  });

  it('keeps open markdown in the top rail group and import/download in the secondary rail group', () => {
    const actionRailItems = workspaceFilesManifest.contributions.actionRail ?? [];
    const byId = new Map(actionRailItems.map((item) => [item.id, item]));

    expect(byId.get('core.open-host-file')).toMatchObject({ group: 'workspace.primary', order: 40 });
    expect(byId.get('core.download-workspace')).toMatchObject({ group: 'workspace.secondary' });
    expect(byId.get('core.import-markdown')).toMatchObject({ group: 'workspace.secondary' });
  });
});
