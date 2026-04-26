import React from 'react';
import { MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS, type MarkdownOptionalProfileId } from '@mdwrk/markdown-renderer-core';
import {
  DEFAULT_MARKDOWN_PROFILE_CONFIG,
  getMarkdownProfileWarnings,
  useMarkdownProfileConfig,
  writeStoredMarkdownProfileConfig,
} from './profileConfig';
import { useClientI18n } from '../i18n/useClientI18n';

function toggleMembership(values: readonly MarkdownOptionalProfileId[], target: MarkdownOptionalProfileId): readonly MarkdownOptionalProfileId[] {
  return values.includes(target) ? values.filter((value) => value !== target) : [...values, target];
}

export const MarkdownProfileSettingsPanel: React.FC = () => {
  const config = useMarkdownProfileConfig();
  const warnings = React.useMemo(() => getMarkdownProfileWarnings(config, 'settings'), [config]);
  const { t } = useClientI18n();

  const inScopeProfiles = React.useMemo(
    () => MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.filter((definition) => definition.status === 'in-scope'),
    [],
  );
  const experimentalProfiles = React.useMemo(
    () => MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.filter((definition) => definition.status !== 'in-scope'),
    [],
  );

  const updateExtensions = (profileId: (typeof MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS)[number]['id']) => {
    writeStoredMarkdownProfileConfig({
      ...config,
      enabledExtensions: toggleMembership(config.enabledExtensions, profileId),
    });
  };

  return (
    <div className="settings-pane">
      <div className="settings-stack settings-stack--lg">
        <div className="settings-card settings-card-stack settings-card-inset">
          <div className="settings-row settings-row--top settings-row--gap-md">
            <div className="settings-field-stack">
              <span className="settings-section-label">{t('core.settings.markdown-profiles.default-profile', 'Default Markdown profile')}</span>
              <p className="settings-muted-caption leading-relaxed">
                {t('core.settings.markdown-profiles.default-profile.description.prefix', 'The repository default remains')} <strong>{t('core.settings.markdown-profiles.default-profile.baseline', 'CommonMark 0.31.2 + GFM 0.29-gfm')}</strong>.
                {' '}{t('core.settings.markdown-profiles.default-profile.description.suffix', 'Optional profiles stay off unless explicitly enabled here.')}
              </p>
            </div>
            <span className="settings-badge settings-badge--dark">{config.baseProfile.toUpperCase()}</span>
          </div>
          <div className="settings-action-row">
            <button
              type="button"
              className="modal-btn modal-btn--fill"
              onClick={() => {
                writeStoredMarkdownProfileConfig(DEFAULT_MARKDOWN_PROFILE_CONFIG);
              }}
            >
              {t('core.settings.markdown-profiles.reset', 'Reset to default')}
            </button>
          </div>
        </div>

        <div className="settings-card settings-card-stack settings-card-inset">
          <div className="settings-row settings-row--top settings-row--gap-md">
            <div>
              <span className="settings-section-label">{t('core.settings.markdown-profiles.certified', 'Certified optional profiles')}</span>
              <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.markdown-profiles.certified.description', 'These profiles are currently inside the Phase 4 optional-profile certification boundary.')}</p>
            </div>
            <span className="settings-badge settings-badge--dark">{inScopeProfiles.length} {t('core.settings.markdown-profiles.in-scope', 'In scope')}</span>
          </div>
          <div className="settings-stack settings-stack--md settings-stack--spaced-sm">
            {inScopeProfiles.map((definition) => {
              const enabled = config.enabledExtensions.includes(definition.id);
              return (
                <label key={definition.id} className="settings-check">
                  <input
                    className="settings-check-input"
                    type="checkbox"
                    checked={enabled}
                    onChange={() => updateExtensions(definition.id)}
                  />
                  <div className="settings-check-content">
                    <span className="settings-check-title">{definition.name}</span>
                    {('notes' in definition ? definition.notes : undefined)?.map((note) => (
                      <span key={note} className="settings-check-copy">{note}</span>
                    ))}
                    <span className="settings-check-meta">{enabled ? t('core.settings.markdown-profiles.enabled', 'Enabled') : t('core.settings.markdown-profiles.disabled', 'Disabled')}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="settings-card settings-card-stack settings-card-inset">
          <div className="settings-row settings-row--top settings-row--gap-md">
            <div>
              <span className="settings-section-label">{t('core.settings.markdown-profiles.experimental', 'Experimental or out of boundary')}</span>
              <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.markdown-profiles.experimental.description', 'These profiles are named and toggleable, but they are not currently counted toward the certified optional-profile closure.')}</p>
            </div>
            <span className="settings-badge">{experimentalProfiles.length} {t('core.settings.markdown-profiles.experimental.count-label', 'Experimental')}</span>
          </div>
          <div className="settings-stack settings-stack--md settings-stack--spaced-sm">
            {experimentalProfiles.map((definition) => {
              const enabled = config.enabledExtensions.includes(definition.id);
              return (
                <label key={definition.id} className="settings-check">
                  <input
                    className="settings-check-input"
                    type="checkbox"
                    checked={enabled}
                    onChange={() => updateExtensions(definition.id)}
                  />
                  <div className="settings-check-content">
                    <span className="settings-check-title">{definition.name}</span>
                    {('notes' in definition ? definition.notes : undefined)?.map((note) => (
                      <span key={note} className="settings-check-copy">{note}</span>
                    ))}
                    <span className="settings-check-meta">{enabled ? t('core.settings.markdown-profiles.enabled-warning', 'Enabled with warning') : t('core.settings.markdown-profiles.disabled', 'Disabled')}</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        <div className="settings-card settings-card-highlight settings-card-inset">
          <div className="settings-row settings-row--top settings-row--bottom">
            <div>
              <span className="settings-section-label settings-inline-row settings-inline-row--sm">{t('core.settings.markdown-profiles.trusted-html', 'Trusted HTML preview and export')}</span>
              <p className="settings-muted-caption settings-copy--spaced settings-copy--relaxed">{t('core.settings.markdown-profiles.trusted-html.description', 'Enables trusted HTML passthrough for preview/export where a named profile requires it. Keep this off unless the workspace content is trusted.')}</p>
            </div>
            <label className="pwa-toggle">
              <input
                type="checkbox"
                checked={config.trustedHtmlPreview}
                onChange={(event) => {
                  writeStoredMarkdownProfileConfig({
                    ...config,
                    trustedHtmlPreview: event.target.checked,
                  });
                }}
              />
              <span className="pwa-toggle-indicator" />
            </label>
          </div>
        </div>

        {warnings.length > 0 && (
          <div className="settings-card settings-card-stack settings-card-inset settings-card-warning">
            <span className="settings-section-label">{t('core.settings.markdown-profiles.warnings', 'Profile warnings')}</span>
            <div className="settings-field-stack mt-2">
              {warnings.map((warning) => (
                <div key={`${warning.scope}:${warning.code}`} className="settings-muted-caption settings-copy--relaxed">
                  {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
