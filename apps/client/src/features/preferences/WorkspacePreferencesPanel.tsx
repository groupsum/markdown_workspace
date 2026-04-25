import React from 'react';
import {
  useWorkspacePreferences,
  updateWorkspacePreferences,
  type WorkspaceExportBackgroundMode,
  type WorkspacePdfPageOrientation,
} from './workspacePreferences';
import { useClientI18n } from '../i18n/useClientI18n';

const ACTION_RAIL_BUTTONS = [
  'core.toggle-explorer',
  'core.new-file',
  'core.new-folder',
  'core.git-pane-rail',
  'core.switch-project',
  'core.download-workspace',
  'core.export-html',
  'core.import-markdown',
  'core.print-preview',
  'core.cloud-sync',
] as const;

const EDITOR_TOOLBAR_BUTTONS = [
  'view-editor',
  'view-split',
  'view-preview',
  'insert-table',
  'strikethrough',
  'bullet-list',
  'task-list',
  'indent',
  'outdent',
  'inline-math',
  'footnote',
  'superscript',
  'subscript',
  'bold',
  'italic',
  'undo',
  'redo',
] as const;

function toggleValue(values: readonly string[], target: string): readonly string[] {
  return values.includes(target)
    ? values.filter((value) => value !== target)
    : [...values, target];
}

export const WorkspacePreferencesPanel: React.FC = () => {
  const preferences = useWorkspacePreferences();
  const { t } = useClientI18n();
  const toBackgroundMode = (value: string): WorkspaceExportBackgroundMode =>
    value === 'plain' || value === 'grayscale' ? value : 'theme';
  const toPdfPageOrientation = (value: string): WorkspacePdfPageOrientation =>
    value === 'landscape' ? 'landscape' : 'portrait';
  const formatPreferenceItem = (scope: 'action-rail-button' | 'editor-toolbar-button', id: string): string =>
    t(`core.settings.workspace-preferences.${scope}.${id}`, id.toUpperCase());

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">{t('core.settings.workspace-preferences.surfaces.title', 'WORKSPACE_SURFACES')}</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.surfaces.description', 'Configure preview policy visibility, action-rail density, and export/print output handling.')}
            </p>
          </div>
          <label className="pwa-toggle justify-start gap-3">
            <input
              type="checkbox"
              checked={!preferences.hidePreviewPolicy}
              onChange={(event) => updateWorkspacePreferences({ hidePreviewPolicy: !event.target.checked })}
            />
            <span className="pwa-toggle-indicator" />
            <span className="pwa-toggle-label">{t('core.settings.workspace-preferences.preview-policy', 'SHOW_PREVIEW_POLICY')}</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.settings.workspace-preferences.action-rail-display', 'ACTION_RAIL_DISPLAY')}</span>
            <select
              className="modal-input !text-xs !py-3"
              value={preferences.actionRailDisplayMode}
              onChange={(event) => updateWorkspacePreferences({ actionRailDisplayMode: event.target.value === 'labeled' ? 'labeled' : 'icon-only' })}
            >
              <option value="icon-only">{t('core.settings.workspace-preferences.action-rail-display.icon-only', 'ICON_ONLY')}</option>
              <option value="labeled">{t('core.settings.workspace-preferences.action-rail-display.labeled', 'ICON_WITH_LABELS')}</option>
            </select>
          </label>
          <div className="settings-grid-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.settings.workspace-preferences.html-export-background', 'HTML_EXPORT_BACKGROUND')}</span>
              <select
                className="modal-input !text-xs !py-3"
                value={preferences.htmlExportBackground}
                onChange={(event) => updateWorkspacePreferences({ htmlExportBackground: toBackgroundMode(event.target.value) })}
              >
                <option value="theme">{t('core.settings.workspace-preferences.background.theme', 'THEME_BACKGROUND')}</option>
                <option value="plain">{t('core.settings.workspace-preferences.background.plain', 'NO_BACKGROUND')}</option>
                <option value="grayscale">{t('core.settings.workspace-preferences.background.grayscale', 'GRAYSCALE')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.settings.workspace-preferences.pdf-page-orientation', 'PDF_PAGE_ORIENTATION')}</span>
              <select
                className="modal-input !text-xs !py-3"
                value={preferences.pdfPageOrientation}
                onChange={(event) => updateWorkspacePreferences({ pdfPageOrientation: toPdfPageOrientation(event.target.value) })}
              >
                <option value="portrait">{t('core.settings.workspace-preferences.pdf-page-orientation.portrait', 'A4_PORTRAIT')}</option>
                <option value="landscape">{t('core.settings.workspace-preferences.pdf-page-orientation.landscape', 'A4_LANDSCAPE')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.settings.workspace-preferences.print-background', 'PRINT_BACKGROUND')}</span>
              <select
                className="modal-input !text-xs !py-3"
                value={preferences.printBackground}
                onChange={(event) => updateWorkspacePreferences({ printBackground: toBackgroundMode(event.target.value) })}
              >
                <option value="theme">{t('core.settings.workspace-preferences.background.theme', 'THEME_BACKGROUND')}</option>
                <option value="plain">{t('core.settings.workspace-preferences.background.plain', 'NO_BACKGROUND')}</option>
                <option value="grayscale">{t('core.settings.workspace-preferences.background.grayscale', 'GRAYSCALE')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">{t('core.settings.workspace-preferences.action-rail-buttons.title', 'ACTION_RAIL_BUTTONS')}</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.action-rail-buttons.description', 'Hide or restore individual action-rail buttons without unregistering their commands.')}
            </p>
          </div>
          <div className="settings-grid-2">
            {ACTION_RAIL_BUTTONS.map((buttonId) => (
              <label key={buttonId} className="pwa-toggle justify-start gap-3">
                <input
                  type="checkbox"
                  checked={!preferences.hiddenActionRailButtons.includes(buttonId)}
                  onChange={() => updateWorkspacePreferences((current) => ({
                    ...current,
                    hiddenActionRailButtons: toggleValue(current.hiddenActionRailButtons, buttonId),
                  }))}
                />
                <span className="pwa-toggle-indicator" />
                <span className="pwa-toggle-label">{formatPreferenceItem('action-rail-button', buttonId)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">{t('core.settings.workspace-preferences.editor-toolbar-buttons.title', 'EDITOR_TOOLBAR_BUTTONS')}</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.editor-toolbar-buttons.description', 'Control which editor-pane toolbar actions remain visible across views and breakpoints.')}
            </p>
          </div>
          <div className="settings-grid-2">
            {EDITOR_TOOLBAR_BUTTONS.map((buttonId) => (
              <label key={buttonId} className="pwa-toggle justify-start gap-3">
                <input
                  type="checkbox"
                  checked={!preferences.hiddenEditorToolbarButtons.includes(buttonId)}
                  onChange={() => updateWorkspacePreferences((current) => ({
                    ...current,
                    hiddenEditorToolbarButtons: toggleValue(current.hiddenEditorToolbarButtons, buttonId),
                  }))}
                />
                <span className="pwa-toggle-indicator" />
                <span className="pwa-toggle-label">{formatPreferenceItem('editor-toolbar-button', buttonId)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
