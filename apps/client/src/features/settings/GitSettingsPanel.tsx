import React from 'react';
import { RefreshCw } from 'lucide-react';
import { OidcSignInSelector } from '../../../components/Modals/OidcSignInSelector';
import { RepositoryAutocomplete } from '../../../components/Modals/RepositoryAutocomplete';
import { useClientRuntimeSnapshot } from '../../app/runtime/ClientRuntimeContext';
import type { GitConfig } from '../../../types';
import { buildNormalizedGitConfig, inferPatProvider, inferProviderFromRepoUrl, PROVIDER_REPO_HOST } from '../../../services/gitConfig';
import { useClientI18n } from '../i18n/useClientI18n';

export const GitSettingsPanel: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const { t } = useClientI18n();
  const snapshot = runtime.app;
  const activeGitConfig = snapshot.actions.getActiveGitConfig() as GitConfig;
  const [draft, setDraft] = React.useState<GitConfig>(activeGitConfig);

  React.useEffect(() => {
    setDraft(activeGitConfig);
  }, [activeGitConfig]);

  React.useEffect(() => {
    if (draft.authMode !== 'pat') return;
    const inferredProvider = inferProviderFromRepoUrl(draft.repoUrl) ?? inferPatProvider(draft.patToken);
    if (!inferredProvider || inferredProvider === draft.oidcProvider) return;
    setDraft((current) => ({ ...current, oidcProvider: inferredProvider }));
  }, [draft.authMode, draft.oidcProvider, draft.patToken, draft.repoUrl]);

  const handleDraftChange = React.useCallback((next: GitConfig) => {
    setDraft(next);
    void snapshot.actions.handleGitConfigUpdate(next);
  }, [snapshot.actions]);

  const handleGitChange = (key: keyof GitConfig, value: string) => {
    handleDraftChange({ ...draft, [key]: value });
  };

  const handleSave = async () => {
    const normalized = buildNormalizedGitConfig(draft);
    setDraft(normalized);
    await snapshot.actions.handleGitConfigSave(normalized);
  };

  const handleTestLink = async () => {
    const normalized = buildNormalizedGitConfig(draft);
    setDraft(normalized);
    await snapshot.actions.testGitLink(normalized);
  };

  const provider = draft.oidcProvider || 'github';
  const normalizedRepo = buildNormalizedGitConfig(draft).repoUrl;

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <div className="settings-stack settings-stack--lg">
          <OidcSignInSelector
            gitConfig={draft}
            onGitConfigChange={handleDraftChange}
            onOidcSignIn={snapshot.actions.handleOidcSignIn}
          />

          <RepositoryAutocomplete
            projectId={snapshot.state.activeProjectId}
            gitConfig={draft}
            onRepoUrlChange={(value) => handleGitChange('repoUrl', value)}
            onGitConfigChange={handleDraftChange}
          />

          <div className="settings-inline-stats">
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.git.stat.auth-mode', 'Auth Mode')}</span><span className="settings-inline-stat-value">{draft.authMode === 'pat' ? t('core.settings.git.auth-mode.pat', 'PAT') : t('core.settings.git.auth-mode.oidc', 'OIDC')}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.git.stat.provider', 'Provider')}</span><span className="settings-inline-stat-value">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span></span>
            <span className="settings-inline-stat"><span className="settings-inline-stat-label">{t('core.settings.git.stat.host', 'Host')}</span><span className="settings-inline-stat-value">{PROVIDER_REPO_HOST[provider]}</span></span>
          </div>

          <label className="settings-field-stack">
            <span className="settings-field-label settings-field-label--plain">{t('core.settings.git.branch', 'Branch')}</span>
            <input
              className="modal-input modal-input--compact"
              value={draft.branch}
              onChange={(event) => handleGitChange('branch', event.target.value)}
              placeholder="main"
            />
          </label>

          <div className="settings-list-row">
            <div className="settings-list-row-main">
              <div className="settings-list-row-title">{t('core.settings.git.normalized-repository', 'Normalized repository')}</div>
              <div className="settings-list-row-subtitle">{normalizedRepo || t('core.settings.state.unset', 'Unset')}</div>
            </div>
            <div className="settings-list-row-actions">
              <span className="settings-chip">{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              <span className="settings-chip">{draft.branch || t('core.settings.git.default-branch', 'Main')}</span>
            </div>
          </div>
        </div>

        <div className="settings-action-row">
          <button className="modal-btn modal-btn--fill" onClick={() => { void handleTestLink(); }}>{t('core.settings.git.test-link', 'Test link')}</button>
          <button className="modal-btn modal-btn--fill" onClick={snapshot.actions.refreshGitRepositories}>
            <RefreshCw size={14} /> {t('core.settings.git.refresh-repos', 'Refresh repositories')}
          </button>
          <button className="modal-btn modal-btn--fill modal-btn-primary" onClick={() => { void handleSave(); }}>{t('core.settings.git.save-config', 'Save configuration')}</button>
        </div>
      </div>
    </div>
  );
};
