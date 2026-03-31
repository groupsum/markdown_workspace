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
        <div className="flex flex-col gap-4">
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

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)]">BRANCH</span>
            <input
              className="modal-input !text-xs !py-3"
              value={draft.branch}
              onChange={(event) => handleGitChange('branch', event.target.value)}
              placeholder="main"
            />
          </label>

          <div className="settings-session-grid">
            <div className="settings-session-item"><span className="settings-session-label">AUTH_MODE</span><span className="settings-session-value">{draft.authMode.toUpperCase()}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">PROVIDER</span><span className="settings-session-value">{provider.toUpperCase()}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">REPO_HOST</span><span className="settings-session-value">{PROVIDER_REPO_HOST[provider]}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">NORMALIZED_REPO</span><span className="settings-session-value">{normalizedRepo || 'UNSET'}</span></div>
          </div>
        </div>

        <div className="settings-action-row">
          <button className="modal-btn flex-1" onClick={() => { void handleTestLink(); }}>{t('core.settings.git.test-link', 'TEST_LINK')}</button>
          <button className="modal-btn flex-1" onClick={snapshot.actions.refreshGitRepositories}>
            <RefreshCw size={14} /> {t('core.settings.git.refresh-repos', 'REFRESH_REPOS')}
          </button>
          <button className="modal-btn flex-1 modal-btn-primary" onClick={() => { void handleSave(); }}>{t('core.settings.git.save-config', 'SAVE_CONFIG')}</button>
        </div>
      </div>
    </div>
  );
};
