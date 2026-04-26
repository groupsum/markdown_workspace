import React from 'react';
import { APP_BUILD_ID, APP_PACKAGE_NAME, APP_VERSION } from '../../../constants';
import { useClientRuntimeSnapshot } from '../../app/runtime/ClientRuntimeContext';
import { useClientI18n } from '../i18n/useClientI18n';

const humanizeStatus = (value: string): string => {
  const normalized = value.replaceAll('_', ' ').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const DataSettingsPanel: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const { t } = useClientI18n();
  const restoreInputRef = React.useRef<HTMLInputElement>(null);
  const snapshot = runtime.app;
  const pwaState = runtime.pwa.state;
  const pwaActions = runtime.pwa.actions;
  const pwaStatusLabel = pwaState.isInstalled ? t('core.settings.data.pwa.installed', 'Installed') : t('core.settings.data.pwa.not-installed', 'Not installed');
  const versionStatusLabel = t(
    `core.settings.data.pwa.version-status.${pwaState.versionStatusLabel.toLowerCase().replaceAll('_', '-')}`,
    humanizeStatus(pwaState.versionStatusLabel),
  );
  const compatibilityStateLabel = t(
    `core.settings.data.pwa.compatibility-state.${pwaState.compatibilityState.toLowerCase().replaceAll('_', '-')}`,
    humanizeStatus(pwaState.compatibilityState),
  );

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
      <div className="settings-stack settings-stack--lg">
        <div className="settings-card settings-card-highlight settings-card-inset">
          <div className="settings-row settings-row--top mb-2">
            <span className="settings-section-label">{t('core.settings.data.pwa.title', 'PWA deployment')}</span>
            <span className="settings-badge settings-badge--dark">{pwaStatusLabel}</span>
          </div>
          <p className="settings-muted-caption mb-4 leading-relaxed">{t('core.settings.data.description', 'PWA deployment and export controls.')}</p>
          <div className="pwa-status-grid">
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.update-state', 'Update state')}</span><span className={`pwa-status-value ${pwaState.updateAvailable ? 'is-ready' : ''}`}>{versionStatusLabel}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.service-worker', 'Service worker')}</span><span className="pwa-status-value">{pwaState.isSupported ? t('core.settings.state.available', 'Available') : t('core.settings.state.unavailable', 'Unavailable')}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.running-version', 'Running version')}</span><span className="pwa-status-value">{pwaState.runningVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.installed-version', 'Installed version')}</span><span className="pwa-status-value">{pwaState.installedVersion ?? t('core.settings.state.uncontrolled', 'Uncontrolled')}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.selected-version', 'Selected version')}</span><span className="pwa-status-value">{pwaState.selectedVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.latest-version', 'Latest version')}</span><span className="pwa-status-value">{pwaState.latestVersion}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.storage-schema', 'Storage schema')}</span><span className="pwa-status-value">{pwaState.localStorageSchema}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.compatibility', 'Compatibility')}</span><span className="pwa-status-value">{compatibilityStateLabel}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.app-version', 'App version')}</span><span className="pwa-status-value">{APP_VERSION}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.build-id', 'Build ID')}</span><span className="pwa-status-value">{APP_BUILD_ID}</span></div>
            <div className="pwa-status-row"><span className="pwa-status-label">{t('core.settings.data.pwa.package', 'Package')}</span><span className="pwa-status-value">{APP_PACKAGE_NAME}</span></div>
          </div>
          <div className="settings-action-row">
            <button className="modal-btn modal-btn--fill" onClick={pwaActions.promptInstall} disabled={!pwaState.canInstall}>{t('core.settings.data.pwa.install', 'Install PWA')}</button>
            <button className="modal-btn modal-btn--fill modal-btn-primary" onClick={pwaActions.requestUpdate} disabled={!pwaState.updateAvailable}>{t('core.settings.data.pwa.update', 'Apply update')}</button>
          </div>
          <div className="settings-action-row">
            <button className="modal-btn modal-btn--fill" onClick={() => void pwaActions.checkForUpdates()} disabled={pwaState.isCheckingForUpdates}>{t('core.settings.data.pwa.check', 'Check for updates')}</button>
            <button className="modal-btn modal-btn--fill" onClick={pwaActions.switchToLatest} disabled={pwaState.isLatest}>{t('core.settings.data.pwa.switch-latest', 'Switch to latest')}</button>
          </div>
          <label className="settings-field">
            <span className="settings-label">{t('core.settings.data.pwa.retained-version', 'Retained version')}</span>
            <select
              className="settings-select"
              value={pwaState.selectedVersion}
              onChange={(event) => pwaActions.switchToVersion(event.target.value)}
            >
              {pwaState.availableVersions.map((entry) => {
                const suffix = entry.disabled
                  ? entry.blocked
                    ? t('core.settings.data.pwa.version.failed-blocked', 'Failed version blocked')
                    : entry.compatible
                      ? t('core.settings.state.disabled', 'Disabled')
                      : t('core.settings.data.pwa.version.incompatible-local-data', 'Incompatible with local data')
                  : entry.version === pwaState.latestVersion
                    ? t('core.settings.data.pwa.version.latest', 'Latest')
                    : t('core.settings.data.pwa.version.retained', 'Retained');
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
            <span className="pwa-toggle-label">{t('core.settings.data.pwa.auto-update', 'Auto update')}</span>
          </label>
        </div>

        <div className="settings-card settings-card-highlight settings-card-inset">
          <div className="settings-row settings-row--top mb-2">
            <span className="settings-section-label">{t('core.settings.data.export.title', 'IndexedDB core dump')}</span>
            <span className="settings-badge settings-badge--dark">{t('core.settings.data.format.json', 'JSON')}</span>
          </div>
          <p className="settings-muted-caption mb-4 leading-relaxed">{t('core.settings.data.export.description', 'Extract the entire IndexedDB workspace, including file contents and metadata, to a portable JSON archive.')}</p>
          <button onClick={snapshot.actions.exportData} className="modal-btn modal-btn-primary modal-btn--full modal-btn--centered">{t('core.settings.data.export.action', 'Export now')}</button>
        </div>

        <div className="settings-card settings-card-highlight settings-card-inset">
          <div className="settings-row settings-row--top mb-2">
            <span className="settings-section-label">{t('core.settings.data.restore.title', 'Restore image')}</span>
            <span className="settings-badge settings-badge--dark">{t('core.settings.data.format.json', 'JSON')}</span>
          </div>
          <p className="settings-muted-caption mb-4">{t('core.settings.data.restore.description', 'Restore the active workspace from a previously exported JSON image.')}</p>
          <button className="modal-btn modal-btn--full modal-btn-primary" onClick={() => restoreInputRef.current?.click()}>{t('core.settings.data.restore.action', 'Start restore')}</button>
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
