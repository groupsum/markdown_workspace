import React from 'react';
import { Download, Trash2, Upload } from 'lucide-react';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { useClientI18n } from './useClientI18n';
import {
  normalizeLanguagePackArtifact,
  removeStoredLanguagePack,
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
  const [draftLocale, setDraftLocale] = React.useState('custom');
  const [draftLabel, setDraftLabel] = React.useState('Custom Language Pack');
  const [draftMessages, setDraftMessages] = React.useState('{\n  "core.views.settings.title": "System Configuration"\n}');
  const [error, setError] = React.useState<string | null>(null);

  const installPack = React.useCallback(async (pack: LanguagePackArtifact) => {
    upsertStoredLanguagePack(pack);
    services.i18n.registerCatalog({
      locale: pack.locale,
      messages: pack.messages,
    });
    await services.i18n.ensureLocale(pack.locale);
    setLocale(pack.locale);
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
      await installPack(parsed);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to import language pack.');
    } finally {
      event.target.value = '';
    }
  };

  const createPack = async () => {
    try {
      const parsedMessages = JSON.parse(draftMessages) as Record<string, string>;
      const pack = normalizeLanguagePackArtifact({
        kind: 'mdwrk-language-pack',
        version: 1,
        locale: draftLocale,
        label: draftLabel,
        messages: parsedMessages,
      });
      if (!pack) {
        throw new Error('Locale and at least one message are required.');
      }
      downloadJson(`${pack.locale}.language-pack.json`, pack);
      await installPack(pack);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Failed to create language pack.');
    }
  };

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="font-bold text-[11px] uppercase">LANGUAGE_PACKS</span>
              <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
                Import locale overrides, switch to an installed locale, or export a portable language-pack artifact.
              </p>
            </div>
            <button className="modal-btn" onClick={() => importRef.current?.click()}>
              <Upload size={14} /> IMPORT_PACK
            </button>
          </div>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          {error && <p className="text-[11px] text-[var(--status-error)]">{error}</p>}
          <div className="flex flex-col gap-3">
            {packs.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">NO_IMPORTED_LANGUAGE_PACKS</span>}
            {packs.map((pack) => (
              <div key={pack.locale} className="settings-session-item">
                <span className="settings-session-label">{pack.label}</span>
                <span className="settings-session-value">{pack.locale}</span>
                <div className="settings-action-row">
                  <button className="modal-btn" onClick={() => { void installPack(pack); }} disabled={locale === pack.locale}>USE_PACK</button>
                  <button className="modal-btn" onClick={() => downloadJson(`${pack.locale}.language-pack.json`, pack)}>
                    <Download size={14} /> EXPORT
                  </button>
                  <button className="modal-btn" onClick={() => removeStoredLanguagePack(pack.locale)}>
                    <Trash2 size={14} /> REMOVE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">CREATE_LANGUAGE_PACK</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
              Author a lightweight locale artifact, download it for publishing, and activate it immediately in the client.
            </p>
          </div>
          <div className="settings-grid-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">LOCALE_ID</span>
              <input className="modal-input !text-xs !py-3" value={draftLocale} onChange={(event) => setDraftLocale(event.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">DISPLAY_LABEL</span>
              <input className="modal-input !text-xs !py-3" value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} />
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">MESSAGES_JSON</span>
            <textarea
              className="modal-input !text-xs !py-3 font-mono"
              style={{ minHeight: 180 }}
              value={draftMessages}
              onChange={(event) => setDraftMessages(event.target.value)}
            />
          </label>
          <div className="settings-action-row">
            <button className="modal-btn modal-btn-primary" onClick={() => { void createPack(); }}>
              <Download size={14} /> BUILD_AND_PUBLISH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
