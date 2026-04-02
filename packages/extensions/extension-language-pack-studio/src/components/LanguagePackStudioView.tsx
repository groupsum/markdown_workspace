import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { Download, Languages, PackagePlus, Power, PowerOff, Trash2, Upload } from "lucide-react";
import type { LanguagePackStudioController, LanguagePackStudioSnapshot } from "../types.js";

function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export interface LanguagePackStudioViewProps {
  readonly controller: LanguagePackStudioController;
  readonly close: () => Promise<void>;
  readonly openQuickActions?: () => Promise<void>;
  readonly mode?: "pane" | "modal";
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const LanguagePackStudioView: React.FC<LanguagePackStudioViewProps> = ({ controller, close, openQuickActions, mode = "pane" }) => {
  const snapshot = React.useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) as LanguagePackStudioSnapshot;
  const importRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = React.useState<string | null>(null);
  const [draftLocale, setDraftLocale] = React.useState('custom');
  const [draftLabel, setDraftLabel] = React.useState('Custom Language Pack');
  const [draftMessages, setDraftMessages] = React.useState('{\n  "core.views.settings.title": "System Configuration"\n}');

  React.useEffect(() => {
    if (selectedLocale && snapshot.packs.some((pack) => pack.locale === selectedLocale)) {
      return;
    }
    setSelectedLocale(snapshot.packs[0]?.locale ?? null);
  }, [selectedLocale, snapshot.packs]);

  const selectedPack = snapshot.packs.find((pack) => pack.locale === selectedLocale) ?? null;
  const missingKeys = React.useMemo(() => {
    if (!selectedPack) return [];
    return snapshot.tokens.filter((token) => !(token.key in selectedPack.messages));
  }, [selectedPack, snapshot.tokens]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await controller.importArtifact(await file.text());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to import language pack.');
    } finally {
      event.target.value = '';
    }
  };

  const handleCreate = async () => {
    try {
      const messages = JSON.parse(draftMessages) as Record<string, string>;
      const pack = await controller.createArtifact({ locale: draftLocale, label: draftLabel, messages, enabled: true });
      downloadJson(`${pack.locale}.language-pack.json`, pack);
      setSelectedLocale(pack.locale);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to create language pack.');
    }
  };

  if (mode === 'modal') {
    return (
      <div className="modal-overlay" data-testid="language-pack-manager-modal">
        <div className="modal-base settings-modal" style={{ width: 'min(720px, 94vw)' }}>
          <div className="modal-header">
            <span className="modal-title">LANGUAGE_PACK_MANAGER</span>
            <button type="button" onClick={() => void close()} className="modal-close">EXIT</button>
          </div>
          <div className="settings-content-frame" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <div className="settings-pane" style={{ display: 'grid', gap: 16 }}>
              <div className="settings-card settings-card-stack">
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">ENABLED</span><span className="settings-session-value">{snapshot.packs.filter((pack) => pack.enabled).length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
                </div>
              </div>
              <div className="settings-card settings-card-stack">
                <div className="settings-action-row">
                  <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}><Upload size={14} /> IMPORT</button>
                </div>
                <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
                {error && <span className="text-[11px] text-[var(--status-error)]">{error}</span>}
                <div style={{ display: 'grid', gap: 10 }}>
                  {snapshot.packs.map((pack) => (
                    <div key={pack.locale} className="settings-session-item" style={{ alignItems: 'start' }}>
                      <div style={{ display: 'grid', gap: 4 }}>
                        <span className="settings-session-label">{pack.label}</span>
                        <span className="settings-session-value">{pack.locale}</span>
                      </div>
                      <div className="settings-action-row">
                        <button type="button" className="modal-btn" onClick={() => void controller.setEnabled(pack.locale, !pack.enabled)}>
                          {pack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {pack.enabled ? 'DISABLE' : 'ENABLE'}
                        </button>
                        <button type="button" className="modal-btn modal-btn-primary" onClick={() => void controller.activate(pack.locale)} disabled={!pack.enabled}>USE</button>
                        <button type="button" className="modal-btn" onClick={() => {
                          const artifact = controller.exportArtifact(pack.locale);
                          if (artifact) downloadJson(`${pack.locale}.language-pack.json`, artifact);
                        }}><Download size={14} /> EXPORT</button>
                        <button type="button" className="modal-btn" onClick={() => void controller.remove(pack.locale)}><Trash2 size={14} /> REMOVE</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="language-pack-studio-pane" data-testid="language-pack-studio-pane" style={{ display: 'grid', gridTemplateRows: 'auto 1fr', minHeight: '100%' }}>
      <div className="workspace-panel-header" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', height: 'auto', minHeight: 'var(--panel-header-height)', padding: '12px 10px' }}>
        <div style={{ display: 'grid', gap: 4 }}>
          <span className="settings-modal-kicker">LANGUAGE_PACK_STUDIO</span>
          <strong className="settings-modal-title">Language Pack Studio</strong>
          <span className="settings-modal-subtitle">Portable language packs, missing token audits, locale creation, and install/use/remove controls.</span>
        </div>
        <div className="settings-modal-actions" style={{ marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {openQuickActions && <button type="button" className="modal-btn" onClick={() => void openQuickActions()}><Languages size={14} /> QUICK_MANAGER</button>}
          <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}><Upload size={14} /> IMPORT</button>
          <button type="button" className="modal-btn" onClick={() => void close()}>CLOSE</button>
        </div>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
      </div>
      <div className="workspace-panel-content" style={{ overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '320px minmax(0, 1fr)', minHeight: '100%' }}>
          <aside style={{ borderRight: '1px solid var(--border-color)', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
            <div className="settings-pane" style={{ padding: 12 }}>
              <div className="settings-card settings-card-stack">
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">TOKENS</span><span className="settings-session-value">{snapshot.tokens.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
                </div>
              </div>
              {error && <p className="text-[11px] text-[var(--status-error)]">{error}</p>}
            </div>
            <div className="workspace-panel-content" style={{ padding: '0 12px 12px', overflow: 'auto' }}>
              <div className="settings-card settings-card-stack">
                {snapshot.packs.map((pack) => (
                  <button key={pack.locale} type="button" className={`settings-sidebar-btn ${selectedLocale === pack.locale ? 'active' : ''}`} onClick={() => setSelectedLocale(pack.locale)} style={{ justifyContent: 'space-between' }}>
                    <span>{pack.label}</span>
                    <span className="settings-session-label">{pack.enabled ? 'enabled' : 'disabled'}</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
          <div className="settings-pane" style={{ padding: 16, display: 'grid', gap: 16, alignContent: 'start' }}>
            {selectedPack && (
              <>
                <div className="settings-card settings-card-stack">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 14 }}>{selectedPack.label}</strong>
                      <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--fg-secondary)' }}>{selectedPack.locale}</p>
                    </div>
                    <div className="settings-action-row">
                      <button type="button" className="modal-btn" onClick={() => void controller.setEnabled(selectedPack.locale, !selectedPack.enabled)}>
                        {selectedPack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {selectedPack.enabled ? 'DISABLE' : 'ENABLE'}
                      </button>
                      <button type="button" className="modal-btn modal-btn-primary" onClick={() => void controller.activate(selectedPack.locale)} disabled={!selectedPack.enabled}>USE</button>
                      <button type="button" className="modal-btn" onClick={() => {
                        const artifact = controller.exportArtifact(selectedPack.locale);
                        if (artifact) downloadJson(`${selectedPack.locale}.language-pack.json`, artifact);
                      }}><Download size={14} /> EXPORT</button>
                      <button type="button" className="modal-btn" onClick={() => void controller.remove(selectedPack.locale)}><Trash2 size={14} /> REMOVE</button>
                    </div>
                  </div>
                  <div className="settings-session-grid">
                    <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{selectedPack.enabled ? 'ENABLED' : 'DISABLED'}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">MISSING</span><span className="settings-session-value">{missingKeys.length}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">TRANSLATED</span><span className="settings-session-value">{Object.keys(selectedPack.messages).length}</span></div>
                  </div>
                </div>
                <div className="settings-card settings-card-stack">
                  <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Token Audit</strong>
                  {snapshot.loadingTokens ? (
                    <span className="text-[11px] text-[var(--fg-muted)]">Loading tokens…</span>
                  ) : (
                    <div style={{ display: 'grid', gap: 8, maxHeight: 420, overflow: 'auto' }}>
                      {snapshot.tokens.map((token) => {
                        const missing = !(token.key in selectedPack.messages);
                        return (
                          <div key={token.key} className="settings-session-item" style={{ borderColor: missing ? 'var(--status-error)' : undefined }}>
                            <div style={{ display: 'grid', gap: 4 }}>
                              <span className="settings-session-label">{token.key}</span>
                              <span className="text-[11px] text-[var(--fg-muted)]">{token.source}</span>
                            </div>
                            <div style={{ display: 'grid', gap: 4, textAlign: 'right' }}>
                              <span className="settings-session-value">{missing ? 'MISSING' : 'PRESENT'}</span>
                              <span className="text-[11px] text-[var(--fg-muted)]">{selectedPack.messages[token.key] ?? token.defaultMessage}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
            <div className="settings-card settings-card-stack">
              <strong style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Create Language Pack</strong>
              <div className="settings-grid-2">
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Locale</span>
                  <input className="modal-input !text-xs !py-3" value={draftLocale} onChange={(event) => setDraftLocale(event.target.value)} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Label</span>
                  <input className="modal-input !text-xs !py-3" value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} />
                </label>
              </div>
              <label className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Messages JSON</span>
                <textarea className="modal-input !text-xs !py-3 font-mono" style={{ minHeight: 180 }} value={draftMessages} onChange={(event) => setDraftMessages(event.target.value)} />
              </label>
              <div className="settings-action-row">
                <button type="button" className="modal-btn modal-btn-primary" onClick={() => void handleCreate()}><PackagePlus size={14} /> CREATE_AND_EXPORT</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
