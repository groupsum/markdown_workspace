import React from 'react';
import { APP_BUILD_ID, APP_PACKAGE_NAME, APP_VERSION } from '../../../constants';
import { useClientRuntimeSnapshot } from '../../app/runtime/ClientRuntimeContext';
import { useClientI18n } from '../i18n/useClientI18n';

export const DataSettingsPanel: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const { t } = useClientI18n();
  const restoreInputRef = React.useRef<HTMLInputElement>(null);
  const snapshot = runtime.app;
  const pwaState = runtime.pwa.state;
  const pwaActions = runtime.pwa.actions;
  const pwaStatusLabel = pwaState.isInstalled ? t('core.settings.data.pwa.installed', 'INSTALLED') : t('core.settings.data.pwa.not-installed', 'NOT_INSTALLED');
  const pwaUpdateLabel = pwaState.updateAvailable ? t('core.status.update-ready', 'UPDATE_READY') : t('core.settings.data.pwa.up-to-date', 'UP_TO_DATE');

  const handleRestoreUpload: React.ChangeEventHandler<HTMLInputElement> = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const payload = await file.text();
      await snapshot.actions.restoreData(payload);
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.data.pwa.title', 'PWA_DEPLOYMENT')}</span>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{pwaStatusLabel}</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">{t('core.settings.data.description', 'PWA deployment and export controls.')}</p>
          <div className="pwa-status-grid">
            <div className="pwa-status-row"><span className="pwa-status-label">UPDATE_STATE</span><span className={`pwa-status-value ${pwaState.updateAvailable ? 'is-ready' : ''}`}>{pwaUpdateLabel}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">SERVICE_WORKER</span><span className="pwa-status-value">{pwaState.isSupported ? 'AVAILABLE' : 'UNAVAILABLE'}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">APP_VERSION</span><span className="pwa-status-value">{APP_VERSION}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">BUILD_ID</span><span className="pwa-status-value">{APP_BUILD_ID}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">PACKAGE</span><span className="pwa-status-value">{APP_PACKAGE_NAME}</span></div>
          </div>
          <div className="settings-action-row">
            <button className="modal-btn flex-1" onClick={pwaActions.promptInstall} disabled={!pwaState.canInstall}>{t('core.settings.data.pwa.install', 'INSTALL_PWA')}</button>
            <button className="modal-btn flex-1 modal-btn-primary" onClick={pwaActions.requestUpdate} disabled={!pwaState.updateAvailable}>{t('core.settings.data.pwa.update', 'APPLY_UPDATE')}</button>
          </div>
          <label className="pwa-toggle">
            <input type="checkbox" checked={pwaState.autoUpdateEnabled} onChange={(event) => pwaActions.toggleAutoUpdate(event.target.checked)} />
            <span className="pwa-toggle-indicator" />
            <span className="pwa-toggle-label">{t('core.settings.data.pwa.auto-update', 'AUTO_UPDATE')}</span>
          </label>
        </div>

        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.data.export.title', 'IDB_CORE_DUMP')}</span>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">JSON</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">{t('core.settings.data.export.description', 'Extract the entire IndexedDB workspace, including file contents and metadata, to a portable JSON archive.')}</p>
          <button onClick={snapshot.actions.exportData} className="modal-btn modal-btn-primary w-full flex items-center justify-center gap-2">{t('core.settings.data.export.action', 'EXECUTE_EXPORT')}</button>
        </div>

        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.data.restore.title', 'RESTORE_IMAGE')}</span>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">JSON</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mb-4">{t('core.settings.data.restore.description', 'Restore the active workspace from a previously exported JSON image.')}</p>
          <button className="modal-btn w-full modal-btn-primary" onClick={() => restoreInputRef.current?.click()}>{t('core.settings.data.restore.action', 'INIT_RESTORE')}</button>
          <input
            ref={restoreInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleRestoreUpload}
          />
        </div>
      </div>
    </div>
  );
};
