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
      <div className="settings-stack settings-stack--lg">
        <div className="settings-card settings-card-stack settings-card-inset">
          <div>
            <span className="settings-section-label">{t('core.settings.language.title', 'Language & Locale')}</span>
            <p className="settings-muted-caption mt-2 leading-relaxed">{t('core.settings.language.description', 'Select the interface language used by the core shell.')}</p>
          </div>
          <LanguageSelector />
          <div className="settings-session-grid">
            <div className="settings-session-item">
              <span className="settings-session-label">{t('core.settings.language.current', 'Current Language')}</span>
              <span className="settings-session-value">{activeLocale?.label ?? 'English'}</span>
            </div>
            <div className="settings-session-item">
              <span className="settings-session-label">{t('core.settings.language.locale-id', 'Locale ID')}</span>
              <span className="settings-session-value">{activeLocale?.locale ?? 'en'}</span>
            </div>
          </div>
        </div>

        <div className="settings-card settings-card-stack settings-card-inset">
          <div>
            <span className="settings-section-label">{t('core.settings.language.project-selector', 'Project Selector Language')}</span>
            <p className="settings-muted-caption mt-2 leading-relaxed">{t('core.settings.language.visibility', 'Language selector is visible in settings and on project surfaces.')}</p>
          </div>
          <div className="settings-action-row">
            <div className="settings-session-item settings-session-item--fill">
              <span className="settings-session-label">{t('core.settings.language.persistence', 'Persistence')}</span>
              <span className="settings-session-value">{t('core.settings.language.persisted', 'Language choice persists between sessions.')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
