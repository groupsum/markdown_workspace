import React from 'react';
import { useSyncExternalStore } from 'react';
import { CircleSlash2, Power, PowerOff } from 'lucide-react';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { useExtensionRuntime } from './ExtensionRuntimeContext';

export const ExtensionRuntimeDiagnosticsPanel: React.FC = () => {
  const runtime = useExtensionRuntime();
  const services = useClientRuntimeServices();
  const runtimeSnapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot);
  const diagnosticsSnapshot = useSyncExternalStore(services.diagnostics.subscribe, services.diagnostics.getSnapshot, services.diagnostics.getSnapshot);

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        {runtimeSnapshot.extensions.map((extension) => {
          const hostDiagnostics = diagnosticsSnapshot.records[extension.id] ?? [];
          return (
            <details key={extension.id} className="settings-card settings-card-stack" open>
              <summary className="flex items-center justify-between cursor-pointer">
                <span className="font-bold text-[11px] uppercase">{services.i18n.format(extension.manifest.displayName)}</span>
                <span className="text-[10px] uppercase text-[var(--fg-muted)]">{extension.status.toUpperCase()}</span>
              </summary>
              <div className="settings-session-grid mt-3">
                <div className="settings-session-item"><span className="settings-session-label">EXTENSION</span><span className="settings-session-value">{services.i18n.format(extension.manifest.displayName)}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">ID</span><span className="settings-session-value">{extension.id}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{extension.status.toUpperCase()}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">ACTIVATION</span><span className="settings-session-value">{extension.activation.toUpperCase()}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">ENABLED</span><span className="settings-session-value">{extension.enabled ? 'YES' : 'NO'}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">VERSION</span><span className="settings-session-value">{extension.manifest.version}</span></div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button className="modal-btn" title={extension.enabled ? 'Disable extension' : 'Enable extension'} aria-label={extension.enabled ? 'Disable extension' : 'Enable extension'} onClick={() => void runtime.setEnabled(extension.id, !extension.enabled)}>{extension.enabled ? <PowerOff size={14} /> : <Power size={14} />}</button>
                <button className="modal-btn modal-btn-primary" title="Activate extension" aria-label="Activate extension" onClick={() => void runtime.activate(extension.id)} disabled={!extension.enabled}><Power size={14} /></button>
                <button className="modal-btn" title="Deactivate extension" aria-label="Deactivate extension" onClick={() => void runtime.deactivate(extension.id)} disabled={extension.status !== 'active'}><CircleSlash2 size={14} /></button>
              </div>

              {extension.missingCapabilities.length > 0 && (
                <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">Missing host capabilities: {extension.missingCapabilities.join(', ')}</p>
              )}

              {!extension.compatibility.compatible && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">Compatibility Issues</span>
                  <ul className="text-[11px] text-[var(--fg-muted)] list-disc pl-5 mt-2">
                    {extension.compatibility.issues.map((issue) => (
                      <li key={`${issue.target}-${String(issue.expected)}`}>{issue.message}</li>
                    ))}
                  </ul>
                </div>
              )}

              {extension.lastError && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">Last Error</span>
                  <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{extension.lastError.message}</p>
                </div>
              )}

              {hostDiagnostics.length > 0 && (
                <div className="settings-card settings-card-muted">
                  <span className="font-bold text-[11px] uppercase">Diagnostics</span>
                  <ul className="text-[11px] text-[var(--fg-muted)] list-disc pl-5 mt-2">
                    {hostDiagnostics.map((record, index) => (
                      <li key={`${record.code}-${index}`}>{record.code}: {record.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
};
