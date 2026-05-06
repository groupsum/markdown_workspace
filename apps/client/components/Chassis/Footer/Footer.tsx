import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { useClientI18n } from '../../../src/features/i18n/useClientI18n';

interface FooterProps {
  cursorLine: number;
  cursorCol: number;
  unsaved: boolean;
  shellVersion: string;
  buildId: string;
  online?: boolean;
  isInstalled?: boolean;
  updateAvailable?: boolean;
  latestAvailable?: boolean;
  autoSaveEnabled?: boolean;
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({
  cursorLine,
  cursorCol,
  shellVersion,
  buildId,
  online = true,
  isInstalled = false,
  updateAvailable = false,
  latestAvailable = false,
  autoSaveEnabled = true,
  className = '',
}) => {
  const { t } = useClientI18n();
  const shellLabel = isInstalled
    ? t('core.status.runtime.pwa', 'PWA')
    : t('core.status.runtime.browser', 'BROWSER');
  const runtimeLabel = `${shellLabel}: v${shellVersion}:${buildId}`;

  return (
    <footer className={`status-bar ${className}`}>
      <div className="status-left">
        <div className="status-item status-item--cursor">
          <span className="status-kv">LN {cursorLine}</span>
          <span className="status-kv"> COL {cursorCol}</span>
        </div>
        <div className="status-item status-item--encoding" title={t('core.status.encoding.title', 'Encoding')}>
          <span className="status-label">{t('core.status.encoding', 'ENC:')}</span>
          <span className="status-text-bold">UTF-8</span>
        </div>
      </div>

      <div className="status-right">
        <div className="status-item status-item--autosave">
          <span className="status-label">{t('core.status.auto-save', 'AUTO-SAVE:')}</span>
          <span className={`status-text-bold ${autoSaveEnabled ? 'status-text--on' : 'status-text--warn'}`}>
            {autoSaveEnabled ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="status-item status-item--network">
          {online ? (
            <div className="status-online">
              <Wifi size={12} />
              <span className="status-text-bold">{t('core.status.online', 'ONLINE')}</span>
            </div>
          ) : (
            <div className="status-offline">
              <WifiOff size={12} />
              <span className="status-text-bold">{t('core.status.offline', 'OFFLINE')}</span>
            </div>
          )}
        </div>
        <div className="status-item status-runtime" title={t('core.status.runtime.title', 'Runtime shell')}>
          <span className="status-text-bold">{runtimeLabel}</span>
        </div>
        {latestAvailable && !updateAvailable && (
          <div className="status-item status-item--release" title={t('core.status.release.title', 'Retained release status')}>
            <span className="status-text-bold status-text--warn">{t('core.status.release.newer', 'NEWER_VERSION_AVAILABLE')}</span>
          </div>
        )}
        {updateAvailable && (
          <div className="status-item status-item--release" title={t('core.status.update.title', 'Application update status')}>
            <span className="status-text-bold status-text--warn">{t('core.status.update-ready', 'UPDATE_READY')}</span>
          </div>
        )}
      </div>
    </footer>
  );
};
