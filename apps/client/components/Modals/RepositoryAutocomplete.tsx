import React, { useEffect, useMemo, useState } from 'react';
import { GIT_REPO_REFRESH_REQUEST_EVENT } from '../../constants';
import { GitConfig } from '../../types';
import { getGitAdapterService } from '../../services/gitAdapter';
import { getAuthToken } from '../../services/gitConfig';
import { useClientI18n } from '../../src/features/i18n/useClientI18n';

interface RepositoryAutocompleteProps {
  projectId: string | null;
  gitConfig: GitConfig;
  onRepoUrlChange: (repoUrl: string) => void;
  onGitConfigChange: (config: GitConfig) => void;
}

export const RepositoryAutocomplete: React.FC<RepositoryAutocompleteProps> = ({
  projectId,
  gitConfig,
  onRepoUrlChange,
  onGitConfigChange,
}) => {
  const { t } = useClientI18n();
  const [repoUrls, setRepoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createPending, setCreatePending] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const provider = gitConfig.oidcProvider || 'github';
  const gitAdapter = useMemo(() => getGitAdapterService(provider), [provider]);
  const selectedRepoHost = gitAdapter.repoHost;
  const canLoadRepos = Boolean(projectId) && (gitConfig.authMode === 'pat' ? Boolean(gitConfig.patToken.trim()) : gitConfig.oidcConnected);

  useEffect(() => {
    let cancelled = false;
    const loadRepos = async () => {
      if (!projectId || !canLoadRepos) {
        setRepoUrls([]);
        setLastUpdatedAt(null);
        return;
      }
      setLoading(true);
      setError('');
      try {
        const accessToken = await getAuthToken(projectId, gitConfig);
        const repos = await gitAdapter.listRepos(accessToken);
        if (!cancelled) {
          setRepoUrls(repos.map((repo) => repo.htmlUrl));
          setLastUpdatedAt(Date.now());
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : t('core.settings.git.loading-repositories', 'LOADING_REPOSITORIES...');
          setError(message);
          setRepoUrls([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadRepos();
    const handleRefresh = () => { void loadRepos(); };
    window.addEventListener(GIT_REPO_REFRESH_REQUEST_EVENT, handleRefresh);
    return () => {
      cancelled = true;
      window.removeEventListener(GIT_REPO_REFRESH_REQUEST_EVENT, handleRefresh);
    };
  }, [canLoadRepos, gitAdapter, gitConfig, projectId, t]);

  const filteredSuggestions = useMemo(() => {
    const probe = gitConfig.repoUrl.trim().toLowerCase();
    if (!probe) return repoUrls;
    return repoUrls.filter((repo) => repo.toLowerCase().includes(probe));
  }, [gitConfig.repoUrl, repoUrls]);

  const handleCreatePrivateRepo = async () => {
    if (!projectId || !gitConfig.repoUrl.trim()) return;
    const repoName = gitConfig.repoUrl.split('/').filter(Boolean).at(-1) || gitConfig.repoUrl.trim();
    setCreatePending(true);
    setError('');
    try {
      const accessToken = await getAuthToken(projectId, gitConfig);
      const created = await gitAdapter.createRepo(accessToken, repoName.replace(/\.git$/i, ''));
      onRepoUrlChange(created.htmlUrl);
      onGitConfigChange({ ...gitConfig, oidcProvider: provider });
      setRepoUrls((previous) => Array.from(new Set([...previous, created.htmlUrl])));
      setLastUpdatedAt(Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create repository.';
      setError(message);
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)]">REPOSITORY URL</span>
        <input
          list="repo-autocomplete"
          className="modal-input !text-xs !py-3"
          value={gitConfig.repoUrl}
          onChange={(event) => onRepoUrlChange(event.target.value)}
          placeholder={`https://${selectedRepoHost}/owner/repo`}
        />
        <datalist id="repo-autocomplete">
          {filteredSuggestions.map((repo) => (
            <option key={repo} value={repo} />
          ))}
        </datalist>
      </label>

      <div className="settings-inline-stats">
        <span className="settings-inline-stat"><span className="settings-inline-stat-label">Loaded</span><span className="settings-inline-stat-value">{repoUrls.length}</span></span>
        <span className="settings-inline-stat"><span className="settings-inline-stat-label">Matches</span><span className="settings-inline-stat-value">{filteredSuggestions.length}</span></span>
        <span className="settings-inline-stat"><span className="settings-inline-stat-label">Host</span><span className="settings-inline-stat-value">{selectedRepoHost}</span></span>
      </div>

      {(loading || lastUpdatedAt || error || !canLoadRepos) && (
        <div className="settings-list">
          {loading && (
            <div className="settings-list-row">
              <div className="settings-list-row-main">
                <div className="settings-list-row-title">{t('core.settings.git.loading-repositories', 'LOADING_REPOSITORIES...')}</div>
              </div>
            </div>
          )}
          {lastUpdatedAt && (
            <div className="settings-list-row">
              <div className="settings-list-row-main">
                <div className="settings-list-row-title">LAST_REFRESH</div>
                <div className="settings-list-row-subtitle">{new Date(lastUpdatedAt).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
          {error && (
            <div className="settings-list-row">
              <div className="settings-list-row-main">
                <div className="settings-list-row-title">ERROR</div>
                <div className="settings-list-row-subtitle">{error.toUpperCase()}</div>
              </div>
            </div>
          )}
          {!canLoadRepos && (
            <div className="settings-list-row">
              <div className="settings-list-row-main">
                <div className="settings-list-row-title">AUTH REQUIRED</div>
                <div className="settings-list-row-subtitle">
                  {gitConfig.authMode === 'pat'
                    ? t('core.settings.git.pat.required', 'ENTER A PAT TO LOAD REPOSITORIES.')
                    : t('core.settings.git.oidc.required', 'CONNECT OIDC TO LOAD REPOSITORIES.')}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {Boolean(projectId && gitConfig.repoUrl.trim()) && !repoUrls.includes(gitConfig.repoUrl.trim()) && (
        <button type="button" className="modal-btn modal-btn-primary" onClick={handleCreatePrivateRepo} disabled={createPending}>
          {createPending ? t('core.settings.git.creating', 'CREATING_PRIVATE_REPO...') : t('core.settings.git.create-private-repo', 'CREATE_PRIVATE_REPO')}
        </button>
      )}
    </div>
  );
};
