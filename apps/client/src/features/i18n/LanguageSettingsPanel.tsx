import React from 'react';
import { LanguageSelector } from './LanguageSelector';
import { useClientI18n } from './useClientI18n';
import { useStoredLanguagePacks } from './languagePackStore';

export const LanguageSettingsPanel: React.FC = () => {
  const { locale, t } = useClientI18n();
  const languagePacks = useStoredLanguagePacks();
  const activeLocale = languagePacks.find((entry) => entry.locale === locale) ?? languagePacks[0];

  return (
    <div className="settings-pane">
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">{t('core.settings.language.title', 'Language & Locale')}</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">{t('core.settings.language.description', 'Select the interface language used by the core shell.')}</p>
          </div>
          <LanguageSelector />
          <div className="settings-session-grid">
            <div className="settings-session-item">
              <span className="settings-session-label">{t('core.settings.language.current', 'Current Language')}</span>
              <span className="settings-session-value">{activeLocale?.label ?? 'English'}</span>
            </div>
            <div className="settings-session-item">
              <span className="settings-session-label">LOCALE_ID</span>
              <span className="settings-session-value">{activeLocale?.locale ?? 'en'}</span>
            </div>
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div>
            <span className="font-bold text-[11px] uppercase">{t('core.settings.language.project-selector', 'Project Selector Language')}</span>
            <p className="text-[11px] text-[var(--fg-muted)] mt-2 leading-relaxed">{t('core.settings.language.visibility', 'Language selector is visible in settings and on project surfaces.')}</p>
          </div>
          <div className="settings-action-row">
            <div className="settings-session-item flex-1">
              <span className="settings-session-label">PERSISTENCE</span>
              <span className="settings-session-value">{t('core.settings.language.persisted', 'Language choice persists between sessions.')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
