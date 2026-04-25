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
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.update-state', 'UPDATE_STATE')}</span><span className={`pwa-status-value ${pwaState.updateAvailable ? 'is-ready' : ''}`}>{pwaState.versionStatusLabel}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.service-worker', 'SERVICE_WORKER')}</span><span className="pwa-status-value">{pwaState.isSupported ? t('core.settings.state.available', 'AVAILABLE') : t('core.settings.state.unavailable', 'UNAVAILABLE')}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.running-version', 'RUNNING_VERSION')}</span><span className="pwa-status-value">{pwaState.runningVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.installed-version', 'INSTALLED_VERSION')}</span><span className="pwa-status-value">{pwaState.installedVersion ?? t('core.settings.state.uncontrolled', 'UNCONTROLLED')}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.selected-version', 'SELECTED_VERSION')}</span><span className="pwa-status-value">{pwaState.selectedVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.latest-version', 'LATEST_VERSION')}</span><span className="pwa-status-value">{pwaState.latestVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.storage-schema', 'STORAGE_SCHEMA')}</span><span className="pwa-status-value">{pwaState.localStorageSchema}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.compatibility', 'COMPATIBILITY')}</span><span className="pwa-status-value">{pwaState.compatibilityState}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.app-version', 'APP_VERSION')}</span><span className="pwa-status-value">{APP_VERSION}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.build-id', 'BUILD_ID')}</span><span className="pwa-status-value">{APP_BUILD_ID}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.package', 'PACKAGE')}</span><span className="pwa-status-value">{APP_PACKAGE_NAME}</span></div>
          </div>
          <div className="settings-action-row">
            <button className="modal-btn flex-1" onClick={pwaActions.promptInstall} disabled={!pwaState.canInstall}>{t('core.settings.data.pwa.install', 'INSTALL_PWA')}</button>
            <button className="modal-btn flex-1 modal-btn-primary" onClick={pwaActions.requestUpdate} disabled={!pwaState.updateAvailable}>{t('core.settings.data.pwa.update', 'APPLY_UPDATE')}</button>
          </div>
          <div className="settings-action-row">
            <button className="modal-btn flex-1" onClick={() => void pwaActions.checkForUpdates()} disabled={pwaState.isCheckingForUpdates}>{t('core.settings.data.pwa.check', 'CHECK_FOR_UPDATES')}</button>
            <button className="modal-btn flex-1" onClick={pwaActions.switchToLatest} disabled={pwaState.isLatest}>{t('core.settings.data.pwa.switch-latest', 'SWITCH_TO_LATEST')}</button>
          </div>
          <label className="settings-field">
            <span className="settings-label">{t('core.settings.data.pwa.retained-version', 'RETAINED_VERSION')}</span>
            <select
              className="settings-select"
              value={pwaState.selectedVersion}
              onChange={(event) => pwaActions.switchToVersion(event.target.value)}
            >
              {pwaState.availableVersions.map((entry) => {
                const suffix = entry.disabled
                  ? entry.blocked
                    ? t('core.settings.data.pwa.version.failed-blocked', 'FAILED_VERSION_BLOCKED')
                    : entry.compatible
                      ? t('core.settings.state.disabled', 'DISABLED')
                      : t('core.settings.data.pwa.version.incompatible-local-data', 'INCOMPATIBLE_WITH_LOCAL_DATA')
                  : entry.version === pwaState.latestVersion
                    ? t('core.settings.data.pwa.version.latest', 'LATEST')
                    : t('core.settings.data.pwa.version.retained', 'RETAINED');
                return (
                  <option key={entry.version} value={entry.version} disabled={entry.disabled}>
                    {`${entry.version} | ${entry.storageSchema} | ${suffix}`}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="pwa-toggle">
            <input type="checkbox" checked={pwaState.autoUpdateEnabled} onChange={(event) => pwaActions.toggleAutoUpdate(event.target.checked)} />
            <span className="pwa-toggle-indicator" />
            <span className="pwa-toggle-label">{t('core.settings.data.pwa.auto-update', 'AUTO_UPDATE')}</span>
          </label>
        </div>

        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.data.export.title', 'IDB_CORE_DUMP')}</span>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{t('core.settings.data.format.json', 'JSON')}</span>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)] mb-4 leading-relaxed">{t('core.settings.data.export.description', 'Extract the entire IndexedDB workspace, including file contents and metadata, to a portable JSON archive.')}</p>
          <button onClick={snapshot.actions.exportData} className="modal-btn modal-btn-primary w-full flex items-center justify-center gap-2">{t('core.settings.data.export.action', 'EXECUTE_EXPORT')}</button>
        </div>

        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.data.restore.title', 'RESTORE_IMAGE')}</span>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{t('core.settings.data.format.json', 'JSON')}</span>
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
