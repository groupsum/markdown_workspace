import React from 'react';
import { CheckCircle2, CircleSlash2, Power, PowerOff } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { useExtensionRuntime } from './ExtensionRuntimeContext';

export const ExtensionRuntimeDiagnosticsPanel: React.FC = () => {
  const runtime = useExtensionRuntime();
  const services = useClientRuntimeServices();
  const t = React.useCallback((key: string, defaultMessage: string) => services.i18n.format({ key, defaultMessage }), [services.i18n]);
  const runtimeSnapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const diagnosticsSnapshot = useSyncExternalStore(services.diagnostics.subscribe, services.diagnostics.getSnapshot, services.diagnostics.getSnapshot);

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        {runtimeSnapshot.extensions.map((extension) => {
          const hostDiagnostics = diagnosticsSnapshot.records[extension.id] ?? [];
          return (
            <div key={extension.id} className="settings-card settings-card-stack">
              <div className="settings-session-grid">
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.placeholder.extension', 'EXTENSION')}</span><span className="settings-session-value">{services.i18n.format(extension.manifest.displayName)}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.runtime.id', 'ID')}</span><span className="settings-session-value">{extension.id}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.runtime.status', 'STATUS')}</span><span className="settings-session-value">{extension.status.toUpperCase()}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.runtime.activation', 'ACTIVATION')}</span><span className="settings-session-value">{extension.activation.toUpperCase()}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.runtime.enabled', 'ENABLED')}</span><span className="settings-session-value">{extension.enabled ? t('core.extensions.runtime.yes', 'YES') : t('core.extensions.runtime.no', 'NO')}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{t('core.extensions.runtime.version', 'VERSION')}</span><span className="settings-session-value">{extension.manifest.version}</span></div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  className="modal-btn"
                  onClick={() => void runtime.setEnabled(extension.id, !extension.enabled)}
                  aria-label={`${extension.enabled ? t('core.extensions.runtime.disable', 'DISABLE') : t('core.extensions.runtime.enable', 'ENABLE')} ${extension.id}`}
                  title={extension.enabled ? t('core.extensions.runtime.disable', 'DISABLE') : t('core.extensions.runtime.enable', 'ENABLE')}
                >
                  {extension.enabled ? <PowerOff size={14} /> : <Power size={14} />}
                </button>
                <button
                  className="modal-btn modal-btn-primary"
                  onClick={() => void runtime.activate(extension.id)}
                  disabled={!extension.enabled}
                  aria-label={`${t('core.extensions.runtime.activate', 'ACTIVATE')} ${extension.id}`}
                  title={t('core.extensions.runtime.activate', 'ACTIVATE')}
                >
                  <CheckCircle2 size={14} />
                </button>
                <button
                  className="modal-btn"
                  onClick={() => void runtime.deactivate(extension.id)}
                  disabled={extension.status !== 'active'}
                  aria-label={`${t('core.extensions.runtime.deactivate', 'DEACTIVATE')} ${extension.id}`}
                  title={t('core.extensions.runtime.deactivate', 'DEACTIVATE')}
                >
                  <CircleSlash2 size={14} />
                </button>
              </div>

              {extension.missingCapabilities.length > 0 && (
                <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{t('core.extensions.runtime.missing-capabilities', 'Missing host capabilities')}: {extension.missingCapabilities.join(', ')}</p>
              )}

              {!extension.compatibility.compatible && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">{t('core.extensions.runtime.compatibility-issues', 'Compatibility Issues')}</span>
                  <ul className="text-[11px] text-[var(--fg-muted)] list-disc pl-5 mt-2">
                    {extension.compatibility.issues.map((issue) => (
                      <li key={`${issue.target}-${String(issue.expected)}`}>{issue.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {extension.lastError && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">{t('core.extensions.runtime.last-error', 'Last Error')}</span>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{extension.lastError.message}</p>
                </div>
              )}

              {hostDiagnostics.length > 0 && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">{t('core.extensions.runtime.diagnostics', 'Diagnostics')}</span>
                  <ul className="text-[11px] text-[var(--fg-muted)] list-disc pl-5 mt-2">
                    {hostDiagnostics.map((record, index) => (
                      <li key={`${record.code}-${index}`}>{record.code}: {record.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
