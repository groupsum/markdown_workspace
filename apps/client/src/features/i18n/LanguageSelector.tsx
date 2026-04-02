import React from 'react';
import { CORE_SHELL_SUPPORTED_LOCALES } from '@mdwrk/i18n';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';
import { useClientI18n } from './useClientI18n';
import { useStoredLanguagePacks } from './languagePackStore';

interface LanguageSelectorProps {
  readonly compact?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false }) => {
  const services = useClientRuntimeServices();
  const { locale, setLocale, t } = useClientI18n();
  const languagePacks = useStoredLanguagePacks();

  const options = React.useMemo(() => [
    ...CORE_SHELL_SUPPORTED_LOCALES.map((entry) => ({ id: entry.id, nativeName: entry.nativeName })),
    ...languagePacks
      .filter((pack) => pack.enabled)
      .filter((pack) => !CORE_SHELL_SUPPORTED_LOCALES.some((entry) => entry.id === pack.locale))
      .map((pack) => ({ id: pack.locale, nativeName: pack.label })),
  ], [languagePacks]);

  const currentLocale = options.find((entry) => entry.id === locale) ?? options[0];

  return (
    <label className={`flex ${compact ? 'items-center gap-2' : 'flex-col gap-2'}`}>
      {!compact && <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.settings.language.selector.label', 'Language')}</span>}
      <select
        className="modal-input !text-xs !py-3"
        aria-label={t('core.settings.language.selector.label', 'Language')}
        value={currentLocale.id}
        onChange={(event) => {
          const nextLocale = event.target.value;
          setLocale(nextLocale);
          void services.settingsStore.set('core.locale', nextLocale);
        }}
      >
        {options.map((entry) => (
          <option key={entry.id} value={entry.id}>{entry.nativeName}</option>
        ))}
      </select>
    </label>
  );
};
