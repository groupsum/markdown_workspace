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
  'core.import-markdown',
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
  'link',
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

function humanizePreferenceId(id: string): string {
  return id
    .split(/[.-]/)
    .filter(Boolean)
    .map((part) => part === 'html' ? 'HTML' : part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const WorkspacePreferencesPanel: React.FC = () => {
  const preferences = useWorkspacePreferences();
  const { t } = useClientI18n();
  const toBackgroundMode = (value: string): WorkspaceExportBackgroundMode =>
    value === 'plain' || value === 'grayscale' ? value : 'theme';
  const toPdfPageOrientation = (value: string): WorkspacePdfPageOrientation =>
    value === 'landscape' ? 'landscape' : 'portrait';
  const formatPreferenceItem = (scope: 'action-rail-button' | 'editor-toolbar-button', id: string): string =>
    t(`core.settings.workspace-preferences.${scope}.${id}`, humanizePreferenceId(id));

  return (
    <div className="settings-pane">
      <div className="settings-stack settings-stack--lg">
        <div className="settings-card settings-card-stack settings-card-inset">
          <div>
            <span className="settings-section-label">{t('core.settings.workspace-preferences.surfaces.title', 'Workspace surfaces')}</span>
            <p className="settings-muted-caption mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.surfaces.description', 'Configure preview policy visibility, action-rail density, and export/print output handling.')}
            </p>
          </div>
          <label className="pwa-toggle pwa-toggle--start">
            <input
              type="checkbox"
              checked={!preferences.hidePreviewPolicy}
              onChange={(event) => updateWorkspacePreferences({ hidePreviewPolicy: !event.target.checked })}
            />
            <span className="pwa-toggle-indicator" />
            <span className="pwa-toggle-label">{t('core.settings.workspace-preferences.preview-policy', 'Show preview policy')}</span>
          </label>
          <label className="settings-field-stack">
            <span className="settings-field-label">{t('core.settings.workspace-preferences.action-rail-display', 'Action rail display')}</span>
            <select
              className="modal-input modal-input--compact"
              value={preferences.actionRailDisplayMode}
              onChange={(event) => updateWorkspacePreferences({ actionRailDisplayMode: event.target.value === 'labeled' ? 'labeled' : 'icon-only' })}
            >
              <option value="icon-only">{t('core.settings.workspace-preferences.action-rail-display.icon-only', 'Icon only')}</option>
              <option value="labeled">{t('core.settings.workspace-preferences.action-rail-display.labeled', 'Icon with labels')}</option>
            </select>
          </label>
          <div className="settings-grid-2">
            <label className="settings-field-stack">
              <span className="settings-field-label">{t('core.settings.workspace-preferences.html-export-background', 'HTML export background')}</span>
              <select
                className="modal-input modal-input--compact"
                value={preferences.htmlExportBackground}
                onChange={(event) => updateWorkspacePreferences({ htmlExportBackground: toBackgroundMode(event.target.value) })}
              >
                <option value="theme">{t('core.settings.workspace-preferences.background.theme', 'Theme background')}</option>
                <option value="plain">{t('core.settings.workspace-preferences.background.plain', 'White background')}</option>
                <option value="grayscale">{t('core.settings.workspace-preferences.background.grayscale', 'Grayscale')}</option>
              </select>
            </label>
            <label className="settings-field-stack">
              <span className="settings-field-label">{t('core.settings.workspace-preferences.pdf-page-orientation', 'PDF page orientation')}</span>
              <select
                className="modal-input modal-input--compact"
                value={preferences.pdfPageOrientation}
                onChange={(event) => updateWorkspacePreferences({ pdfPageOrientation: toPdfPageOrientation(event.target.value) })}
              >
                <option value="portrait">{t('core.settings.workspace-preferences.pdf-page-orientation.portrait', 'A4 portrait')}</option>
                <option value="landscape">{t('core.settings.workspace-preferences.pdf-page-orientation.landscape', 'A4 landscape')}</option>
              </select>
            </label>
            <label className="settings-field-stack">
              <span className="settings-field-label">{t('core.settings.workspace-preferences.print-background', 'Print background')}</span>
              <select
                className="modal-input modal-input--compact"
                value={preferences.printBackground}
                onChange={(event) => updateWorkspacePreferences({ printBackground: toBackgroundMode(event.target.value) })}
              >
                <option value="theme">{t('core.settings.workspace-preferences.background.theme', 'Theme background')}</option>
                <option value="plain">{t('core.settings.workspace-preferences.background.plain', 'White background')}</option>
                <option value="grayscale">{t('core.settings.workspace-preferences.background.grayscale', 'Grayscale')}</option>
              </select>
            </label>
          </div>
        </div>

        <div className="settings-card settings-card-stack settings-card-inset">
          <div>
            <span className="settings-section-label">{t('core.settings.workspace-preferences.action-rail-buttons.title', 'Action rail buttons')}</span>
            <p className="settings-muted-caption mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.action-rail-buttons.description', 'Hide or restore individual action-rail buttons without unregistering their commands.')}
            </p>
          </div>
          <div className="settings-grid-2">
            {ACTION_RAIL_BUTTONS.map((buttonId) => (
              <label key={buttonId} className="pwa-toggle pwa-toggle--start">
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

        <div className="settings-card settings-card-stack settings-card-inset">
          <div>
            <span className="settings-section-label">{t('core.settings.workspace-preferences.editor-toolbar-buttons.title', 'Editor toolbar buttons')}</span>
            <p className="settings-muted-caption mt-2 leading-relaxed">
              {t('core.settings.workspace-preferences.editor-toolbar-buttons.description', 'Control which editor-pane toolbar actions remain visible across views and breakpoints.')}
            </p>
          </div>
          <div className="settings-grid-2">
            {EDITOR_TOOLBAR_BUTTONS.map((buttonId) => (
              <label key={buttonId} className="pwa-toggle pwa-toggle--start">
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
