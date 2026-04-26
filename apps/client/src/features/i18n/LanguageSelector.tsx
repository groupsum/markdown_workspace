import React from 'react';
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

  const options = React.useMemo(() => (
    languagePacks
      .filter((pack) => pack.enabled)
      .map((pack) => ({ id: pack.locale, nativeName: pack.label }))
  ), [languagePacks]);

  const currentLocale = options.find((entry) => entry.id === locale) ?? options[0];

  return (
    <label className={compact ? 'language-selector language-selector--compact' : 'language-selector'}>
      {!compact && <span className="language-selector-label">{t('core.settings.language.selector.label', 'Language')}</span>}
      <select
        className="modal-input language-selector-control"
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
