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
      <div className="flex flex-col gap-4">
        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[11px] uppercase">{t('core.settings.markdown-profiles.default-profile', 'Default Markdown profile')}</span>
              <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">
                {t('core.settings.markdown-profiles.default-profile.description.prefix', 'The repository default remains')} <strong>{t('core.settings.markdown-profiles.default-profile.baseline', 'CommonMark 0.31.2 + GFM 0.29-gfm')}</strong>.
                {' '}{t('core.settings.markdown-profiles.default-profile.description.suffix', 'Optional profiles stay off unless explicitly enabled here.')}
              </p>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{config.baseProfile.toUpperCase()}</span>
          </div>
          <div className="settings-action-row">
            <button
              type="button"
              className="modal-btn flex-1"
              onClick={() => {
                writeStoredMarkdownProfileConfig(DEFAULT_MARKDOWN_PROFILE_CONFIG);
              }}
            >
              {t('core.settings.markdown-profiles.reset', 'Reset to default')}
            </button>
          </div>
        </div>

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-[11px] uppercase">{t('core.settings.markdown-profiles.certified', 'Certified optional profiles')}</span>
              <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.markdown-profiles.certified.description', 'These profiles are currently inside the Phase 4 optional-profile certification boundary.')}</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)] bg-black text-white">{inScopeProfiles.length} {t('core.settings.markdown-profiles.in-scope', 'In scope')}</span>
          </div>
          <div className="flex flex-col gap-3 mt-1">
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

        <div className="settings-card settings-card-stack bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-bold text-[11px] uppercase">{t('core.settings.markdown-profiles.experimental', 'Experimental or out of boundary')}</span>
              <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.markdown-profiles.experimental.description', 'These profiles are named and toggleable, but they are not currently counted toward the certified optional-profile closure.')}</p>
            </div>
            <span className="text-[9px] px-2 py-0.5 border border-[var(--border-color)]">{experimentalProfiles.length} {t('core.settings.markdown-profiles.experimental.count-label', 'Experimental')}</span>
          </div>
          <div className="flex flex-col gap-3 mt-1">
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

        <div className="settings-card settings-card-highlight bg-[var(--bg-inset)]">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="font-bold text-[11px] uppercase flex items-center gap-2">{t('core.settings.markdown-profiles.trusted-html', 'Trusted HTML preview and export')}</span>
              <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed mt-2">{t('core.settings.markdown-profiles.trusted-html.description', 'Enables trusted HTML passthrough for preview/export where a named profile requires it. Keep this off unless the workspace content is trusted.')}</p>
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
          <div className="settings-card settings-card-stack bg-[var(--bg-inset)] border border-[var(--warning, #f59e0b)]">
            <span className="font-bold text-[11px] uppercase">{t('core.settings.markdown-profiles.warnings', 'Profile warnings')}</span>
            <div className="flex flex-col gap-2 mt-2">
              {warnings.map((warning) => (
                <div key={`${warning.scope}:${warning.code}`} className="text-[11px] leading-relaxed text-[var(--fg-muted)]">
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
