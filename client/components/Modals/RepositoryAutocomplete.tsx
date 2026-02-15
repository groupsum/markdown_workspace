import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GitConfig } from '../../types';
import { clearOidcCredential, readOidcCredential } from '../../services/oidc';
import { getGitAdapterService } from '../../services/gitAdapter';

interface RepositoryAutocompleteProps {
  projectId: string | null;
  gitConfig: GitConfig;
  onRepoUrlChange: (repoUrl: string) => void;
  onGitConfigChange: (config: GitConfig) => void;
}

const PAT_REPO_PROVIDER = 'github' as const;
const PAT_REPO_HOST = 'github.com';

const normalizeRepoUrl = (value: string, host: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith(`https://${host}/`)) {
    return trimmed.replace(/\.git$/, '');
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(trimmed)) {
    return `https://${host}/${trimmed}`;
  }

  return trimmed;
};

const toOwnerRepo = (value: string, host: string): string => {
  const normalized = normalizeRepoUrl(value, host);
  if (!normalized) {
    return '';
  }

  if (/^[\w.-]+\/[\w.-]+$/.test(normalized)) {
    return normalized;
  }

  const hostPrefix = `https://${host}/`;
  if (!normalized.startsWith(hostPrefix)) {
    return '';
  }

  const path = normalized.slice(hostPrefix.length);
  const [owner, repo] = path.split('/').filter(Boolean);
  if (!owner || !repo) {
    return '';
  }

  return `${owner}/${repo.replace(/\.git$/, '')}`;
};

const shouldInvalidateAuthSession = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return normalized.includes('401') || normalized.includes('403') || normalized.includes('unauthorized') || normalized.includes('forbidden');
};

const getAuthToken = async (projectId: string, gitConfig: GitConfig): Promise<string> => {
  if (gitConfig.authMode === 'pat') {
    const token = gitConfig.patToken.trim();
    if (!token) {
      throw new Error('Enter a PAT token to load repositories.');
    }
    return token;
  }

  const credential = await readOidcCredential(projectId);
  if (!credential?.accessToken) {
    throw new Error('Connect OIDC to load repositories.');
  }
  return credential.accessToken;
};

export const RepositoryAutocomplete: React.FC<RepositoryAutocompleteProps> = ({ projectId, gitConfig, onRepoUrlChange, onGitConfigChange }) => {
  const gitAdapter = useMemo(
    () => getGitAdapterService(gitConfig.authMode === 'pat' ? PAT_REPO_PROVIDER : gitConfig.oidcProvider || 'github'),
    [gitConfig.authMode, gitConfig.oidcProvider]
  );
  const normalizedInput = normalizeRepoUrl(gitConfig.repoUrl, gitAdapter.repoHost);

  const getRepoNameFromValue = (value: string): string => {
    const normalized = normalizeRepoUrl(value, gitAdapter.repoHost);
    if (!normalized) {
      return '';
    }
    const chunks = normalized.split('/').filter(Boolean);
    return chunks.at(-1)?.toLowerCase() || '';
  };

  const [repoUrls, setRepoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createPending, setCreatePending] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  const clearStaleSession = async (message: string) => {
    if (!projectId || gitConfig.authMode !== 'oidc' || !shouldInvalidateAuthSession(message)) {
      return;
    }

    clearOidcCredential(projectId);
    onGitConfigChange({
      ...gitConfig,
      oidcConnected: false,
      oidcSubject: ''
    });
  };

  const loadRepos = useCallback(async () => {
    if (!projectId || (gitConfig.authMode === 'oidc' && !gitConfig.oidcProvider)) {
      setRepoUrls([]);
      setError('');
      return;
    }

    if (gitConfig.authMode === 'oidc' && !gitConfig.oidcConnected) {
      setRepoUrls([]);
      setError('');
      return;
    }

    if (gitConfig.authMode === 'pat' && !gitConfig.patToken.trim()) {
      setRepoUrls([]);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await getAuthToken(projectId, gitConfig);
      const repos = await gitAdapter.listRepos(token);
      setRepoUrls(repos.map((repo) => repo.htmlUrl));
      setLastUpdatedAt(Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load repositories.';
      await clearStaleSession(message);
      setError(message);
      setRepoUrls([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, gitConfig, gitAdapter]);

  useEffect(() => {
    void loadRepos();

    const intervalId = window.setInterval(() => {
      void loadRepos();
    }, 60_000);

    const handleManualRefresh = () => {
      void loadRepos();
    };

    window.addEventListener('lattice:gh:refresh-repos', handleManualRefresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('lattice:gh:refresh-repos', handleManualRefresh);
    };
  }, [loadRepos]);

  const filteredSuggestions = useMemo(() => {
    const probe = normalizedInput.toLowerCase();
    if (!probe) {
      return repoUrls;
    }
    return repoUrls.filter((repo) => repo.toLowerCase().includes(probe));
  }, [repoUrls, normalizedInput]);

  const renderedSuggestions = useMemo(() => {
    if (gitConfig.authMode !== 'pat') {
      return filteredSuggestions;
    }

    return Array.from(
      new Set(filteredSuggestions.map((repo) => toOwnerRepo(repo, PAT_REPO_HOST)).filter(Boolean))
    );
  }, [filteredSuggestions, gitConfig.authMode]);

  const repoExists = useMemo(() => {
    if (gitConfig.authMode === 'pat') {
      const candidate = toOwnerRepo(gitConfig.repoUrl, PAT_REPO_HOST).toLowerCase();
      if (!candidate) {
        return false;
      }
      return repoUrls.some((repo) => toOwnerRepo(repo, PAT_REPO_HOST).toLowerCase() === candidate);
    }

    return repoUrls.some((repo) => repo.toLowerCase() === normalizedInput.toLowerCase());
  }, [repoUrls, normalizedInput, gitConfig.authMode, gitConfig.repoUrl]);

  const canCreateRepo =
    Boolean(projectId) &&
    !repoExists &&
    Boolean(getRepoNameFromValue(gitConfig.repoUrl)) &&
    (gitConfig.authMode === 'pat' ? Boolean(gitConfig.patToken.trim()) : gitConfig.oidcConnected);

  const handleCreatePrivateRepo = async () => {
    if (!projectId) {
      return;
    }

    const repoName = getRepoNameFromValue(gitConfig.repoUrl);
    if (!repoName) {
      return;
    }

    setCreatePending(true);
    setError('');

    try {
      const token = await getAuthToken(projectId, gitConfig);
      const created = await gitAdapter.createRepo(token, repoName);
      onRepoUrlChange(created.htmlUrl);
      setRepoUrls((prev) => Array.from(new Set([...prev, created.htmlUrl])).sort((a, b) => a.localeCompare(b)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create repository.';
      await clearStaleSession(message);
      setError(message);
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-[var(--fg-muted)]">REPOSITORY URL</span>
      <input
        list="repo-autocomplete"
        className="modal-input !text-xs !py-3"
        value={gitConfig.repoUrl}
        onChange={(e) => onRepoUrlChange(e.target.value)}
        placeholder={gitConfig.authMode === 'pat' ? 'owner/repo (defaults to github.com)' : `https://${gitAdapter.repoHost}/owner/repo`}
      />
      <datalist id="repo-autocomplete">
        {renderedSuggestions.map((repo) => (
          <option key={repo} value={repo} />
        ))}
      </datalist>
      {loading && <span className="text-[10px] text-[var(--fg-muted)]">LOADING_REPOSITORIES…</span>}
      {!loading && lastUpdatedAt && <span className="text-[10px] text-[var(--fg-muted)]">UPDATED {new Date(lastUpdatedAt).toLocaleTimeString()}</span>}
      {error && <span className="text-[10px] text-[var(--danger)]">{error.toUpperCase()}</span>}
      {canCreateRepo && (
        <button
          type="button"
          className="modal-btn modal-btn-primary"
          onClick={handleCreatePrivateRepo}
          disabled={createPending}
        >
          {createPending ? 'CREATING_PRIVATE_REPO…' : 'CREATE_PRIVATE_REPO'}
        </button>
      )}
    </label>
  );
};
