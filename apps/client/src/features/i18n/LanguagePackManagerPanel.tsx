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
  const { locale, setLocale, t } = useClientI18n();
  const packs = useStoredLanguagePacks();
  const importRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    void initializeLanguagePackStore();
  }, []);

  const builtInCount = packs.filter((pack) => pack.source === 'built-in').length;
  const installedCount = packs.filter((pack) => pack.source === 'installed').length;
  const enabledCount = packs.filter((pack) => pack.enabled).length;

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
        throw new Error(t('core.settings.language-packs.import.invalid', 'Invalid language pack artifact.'));
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
      setError(nextError instanceof Error ? nextError.message : t('core.settings.language-packs.import.failed', 'Failed to import language pack.'));
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
              <span className="font-bold text-[11px] uppercase">{t('core.settings.language-packs.title', 'Language Packs')}</span>
              <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">
                {t('core.settings.language-packs.description', 'Compact language-pack management from settings. Open the studio pane for token auditing and pack authoring.')}
              </p>
            </div>
            <div className="settings-action-row">
              <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}>
                <Upload size={14} /> {t('core.settings.language-packs.import', 'Import pack')}
              </button>
              <button type="button" className="modal-btn" onClick={() => { void setAllStoredLanguagePackEnabled(false); }}>
                <PanelLeftClose size={14} /> {t('core.settings.language-packs.disable-all', 'Disable all')}
              </button>
              <button type="button" className="modal-btn" onClick={() => { void setAllStoredLanguagePackEnabled(true); }}>
                <PanelLeftOpen size={14} /> {t('core.settings.language-packs.enable-all', 'Enable all')}
              </button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={() => {
                  void services.views.close('core.settings');
                  void services.views.open('core.language-pack-studio.view');
                }}
              >
                <Languages size={14} /> {t('core.settings.language-packs.open-studio', 'Open studio')}
              </button>
            </div>
          </div>
          <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImport} />
          {error && <p className="text-[11px] text-[var(--status-error)]">{error}</p>}
          <div className="settings-inline-stats">
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.language-packs.stats.packs', 'Packs')}</span><span className="settings-inline-stat-value">{packs.length}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.language-packs.stats.enabled', 'Enabled')}</span><span className="settings-inline-stat-value">{enabledCount}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.language-packs.stats.active', 'Active')}</span><span className="settings-inline-stat-value">{locale}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.language-packs.stats.built-in', 'Built In')}</span><span className="settings-inline-stat-value">{builtInCount}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.language-packs.stats.installed', 'Installed')}</span><span className="settings-inline-stat-value">{installedCount}</span></span>
          </div>
          <div className="settings-chip-row">
            <span className="settings-chip">{builtInCount} {t('core.settings.language-packs.source.built-in', 'Built in')}</span>
            <span className="settings-chip">{installedCount} {t('core.settings.language-packs.source.installed', 'Installed')}</span>
            <span className="settings-chip">{t('core.settings.storage.indexeddb', 'IndexedDB')}</span>
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="settings-list">
            {packs.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">{t('core.settings.language-packs.empty', 'No imported language packs')}</span>}
            {packs.map((pack) => (
              <div key={pack.locale} className="settings-list-row">
                <div className="settings-list-row-main">
                  <div className="settings-list-row-title">
                    <span>{pack.label}</span>
                    <span className="settings-chip">{pack.locale}</span>
                    <span className="settings-chip">{pack.source === 'built-in' ? t('core.settings.language-packs.source.built-in', 'Built in') : t('core.settings.language-packs.source.installed', 'Installed')}</span>
                    <span className="settings-chip">{pack.enabled ? t('core.settings.state.enabled', 'Enabled') : t('core.settings.state.disabled', 'Disabled')}</span>
                  </div>
                  <div className="settings-list-row-subtitle">
                    {pack.source === 'built-in'
                      ? t('core.settings.language-packs.built-in.description', 'Bundled with the core shell catalog.')
                      : t('core.settings.language-packs.installed.description', 'Stored in IndexedDB and available for export, activation, and removal.')}
                  </div>
                </div>
                <div className="settings-list-row-actions">
                  <button type="button" className="modal-btn" onClick={() => { void setStoredLanguagePackEnabled(pack.locale, !pack.enabled); }}>
                    {pack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {pack.enabled ? t('core.settings.language-packs.disable', 'Disable') : t('core.settings.language-packs.enable', 'Enable')}
                  </button>
                  <button type="button" className="modal-btn" onClick={() => { void activatePack(pack); }} disabled={!pack.enabled || locale === pack.locale}>{t('core.settings.language-packs.use-pack', 'Use pack')}</button>
                  <button type="button" className="modal-btn" onClick={() => downloadJson(`${pack.locale}.language-pack.json`, pack)} disabled={pack.source !== 'installed'}>
                    <Download size={14} /> {t('core.settings.language-packs.export', 'Export')}
                  </button>
                  <button type="button" className="modal-btn" onClick={() => { void removeStoredLanguagePack(pack.locale); }} disabled={pack.source !== 'installed'}>
                    <Trash2 size={14} /> {t('core.settings.language-packs.remove', 'Remove')}
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
