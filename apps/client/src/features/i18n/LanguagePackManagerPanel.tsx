import React from 'react';
import { Download, Languages, PanelLeftClose, PanelLeftOpen, Power, PowerOff, Trash2, Upload } from 'lucide-react';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { useClientI18n } from './useClientI18n';
import {
  initializeLanguagePackStore,
  normalizeLanguagePackArtifact,
  removeStoredLanguagePack,
  setAllStoredLanguagePackEnabled,
  setStoredLanguagePackEnabled,
  upsertStoredLanguagePack,
  useStoredLanguagePacks,
  type LanguagePackArtifact,
} from './languagePackStore';

function downloadJson(filename: string, value: unknown): void {
  if (typeof window === 'undefined') {
    return;
  }
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const LanguagePackManagerPanel: React.FC = () => {
  const services = useClientRuntimeServices();
  const { locale, setLocale } = useClientI18n();
  const packs = useStoredLanguagePacks();
  const importRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void initializeLanguagePackStore();
  }, []);

  const activatePack = React.useCallback(async (pack: LanguagePackArtifact) => {
    if (!pack.enabled) {
      return;
    }
    if (Object.keys(pack.messages).length > 0) {
      services.i18n.registerCatalog({
        locale: pack.locale,
        messages: pack.messages,
      });
    }
    setLocale(pack.locale);
    await services.i18n.ensureLocale(pack.locale);
    void services.settingsStore.set('core.locale', pack.locale);
  }, [services.i18n, services.settingsStore, setLocale]);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = normalizeLanguagePackArtifact(JSON.parse(text));
      if (!parsed) {
        throw new Error('Invalid language pack artifact.');
      }
      await upsertStoredLanguagePack(parsed);
      if (parsed.enabled) {
        services.i18n.registerCatalog({
          locale: parsed.locale,
          messages: parsed.messages,
        });
      }
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to import language pack.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="font-bold text-[11px] uppercase">LANGUAGE_PACKS</span>
              <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
                Compact language-pack management from settings. Open the studio pane for token auditing and pack authoring.
              </p>
            </div>
            <div className="settings-action-row">
              <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}>
                <Upload size={14} /> IMPORT_PACK
              </button>
              <button type="button" className="modal-btn" onClick={() => { void setAllStoredLanguagePackEnabled(false); }}>
                <PanelLeftClose size={14} /> DISABLE_ALL
              </button>
              <button type="button" className="modal-btn" onClick={() => { void setAllStoredLanguagePackEnabled(true); }}>
                <PanelLeftOpen size={14} /> ENABLE_ALL
              </button>
              <button type="button" className="modal-btn modal-btn-primary" onClick={() => { void services.views.open('core.language-pack-studio.view'); }}>
                <Languages size={14} /> OPEN_STUDIO
              </button>
            </div>
          </div>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          {error && <p className="text-[11px] text-[var(--status-error)]">{error}</p>}
          <div className="settings-session-grid">
            <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{packs.length}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">ENABLED</span><span className="settings-session-value">{packs.filter((pack) => pack.enabled).length}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{locale}</span></div>
          </div>
          <div className="settings-chip-row">
            <span className="settings-chip">{packs.filter((pack) => pack.source === 'built-in').length} BUILT_IN</span>
            <span className="settings-chip">{packs.filter((pack) => pack.source === 'installed').length} INSTALLED</span>
            <span className="settings-chip">INDEXEDDB</span>
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex flex-col gap-3">
            {packs.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">NO_IMPORTED_LANGUAGE_PACKS</span>}
            {packs.map((pack) => (
              <div key={pack.locale} className="settings-session-item">
                <span className="settings-session-label">{pack.source.toUpperCase()}</span>
                <span className="settings-session-value">{pack.label} · {pack.locale}</span>
                <div className="settings-action-row">
                  <button type="button" className="modal-btn" onClick={() => { void setStoredLanguagePackEnabled(pack.locale, !pack.enabled); }}>
                    {pack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {pack.enabled ? 'DISABLE' : 'ENABLE'}
                  </button>
                  <button type="button" className="modal-btn" onClick={() => { void activatePack(pack); }} disabled={!pack.enabled || locale === pack.locale}>USE_PACK</button>
                  <button type="button" className="modal-btn" onClick={() => downloadJson(`${pack.locale}.language-pack.json`, pack)} disabled={pack.source !== 'installed'}>
                    <Download size={14} /> EXPORT
                  </button>
                  <button type="button" className="modal-btn" onClick={() => { void removeStoredLanguagePack(pack.locale); }} disabled={pack.source !== 'installed'}>
                    <Trash2 size={14} /> REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
