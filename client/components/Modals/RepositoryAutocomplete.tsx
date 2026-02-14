import React, { useEffect, useMemo, useState } from 'react';
import { GitConfig } from '../../types';
import { readOidcCredential } from '../../services/oidc';
import { getGitAdapterService } from '../../services/gitAdapter';

interface RepositoryAutocompleteProps {
  projectId: string | null;
  gitConfig: GitConfig;
  onRepoUrlChange: (repoUrl: string) => void;
}

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

export const RepositoryAutocomplete: React.FC<RepositoryAutocompleteProps> = ({ projectId, gitConfig, onRepoUrlChange }) => {
  const gitAdapter = useMemo(() => getGitAdapterService(gitConfig.oidcProvider || 'github'), [gitConfig.oidcProvider]);
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

  useEffect(() => {
    const loadRepos = async () => {
      if (!projectId || !gitConfig.oidcProvider || !gitConfig.oidcConnected) {
        setRepoUrls([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const credential = await readOidcCredential(projectId);
        if (!credential?.accessToken) {
          throw new Error('Connect OIDC to load repositories.');
        }
        const repos = await gitAdapter.listRepos(credential.accessToken);
        setRepoUrls(repos.map((repo) => repo.htmlUrl));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load repositories.';
        setError(message);
        setRepoUrls([]);
      } finally {
        setLoading(false);
      }
    };

    loadRepos();
  }, [projectId, gitConfig.oidcProvider, gitConfig.oidcConnected, gitAdapter]);

  const filteredSuggestions = useMemo(() => {
    const probe = normalizedInput.toLowerCase();
    if (!probe) {
      return repoUrls;
    }
    return repoUrls.filter((repo) => repo.toLowerCase().includes(probe));
  }, [repoUrls, normalizedInput]);

  const repoExists = useMemo(
    () => repoUrls.some((repo) => repo.toLowerCase() === normalizedInput.toLowerCase()),
    [repoUrls, normalizedInput]
  );

  const canCreateRepo = gitConfig.oidcConnected && Boolean(projectId) && !repoExists && Boolean(getRepoNameFromValue(gitConfig.repoUrl));

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
      const credential = await readOidcCredential(projectId);
      if (!credential?.accessToken) {
        throw new Error('Connect OIDC to create repositories.');
      }

      const created = await gitAdapter.createRepo(credential.accessToken, repoName);
      onRepoUrlChange(created.htmlUrl);
      setRepoUrls((prev) => Array.from(new Set([...prev, created.htmlUrl])).sort((a, b) => a.localeCompare(b)));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create repository.';
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
        placeholder={`https://${gitAdapter.repoHost}/owner/repo`}
      />
      <datalist id="repo-autocomplete">
        {filteredSuggestions.map((repo) => (
          <option key={repo} value={repo} />
        ))}
      </datalist>
      {loading && <span className="text-[10px] text-[var(--fg-muted)]">LOADING_REPOSITORIES…</span>}
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
