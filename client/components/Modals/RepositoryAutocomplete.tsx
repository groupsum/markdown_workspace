import React, { useMemo } from 'react';
import { GitConfig } from '../../types';

interface RepositoryAutocompleteProps {
  gitConfig: GitConfig;
  onRepoUrlChange: (repoUrl: string) => void;
}

const providerBase: Record<string, string> = {
  github: 'https://github.com',
  gitlab: 'https://gitlab.com',
  gitea: 'https://gitea.com'
};

export const RepositoryAutocomplete: React.FC<RepositoryAutocompleteProps> = ({ gitConfig, onRepoUrlChange }) => {
  const suggestions = useMemo(() => {
    const base = gitConfig.oidcProvider ? providerBase[gitConfig.oidcProvider] : 'https://github.com';
    const user = gitConfig.username || 'user';
    const templates = ['repo', 'docs', 'playground', 'markdown-notes'];
    return templates.map((name) => `${base}/${user}/${name}`);
  }, [gitConfig.oidcProvider, gitConfig.username]);

  return (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-bold text-[var(--fg-muted)]">REPOSITORY URL</span>
      <input
        list="repo-autocomplete"
        className="modal-input !text-xs !py-3"
        value={gitConfig.repoUrl}
        onChange={(e) => onRepoUrlChange(e.target.value)}
        placeholder="https://provider/owner/repo"
      />
      <datalist id="repo-autocomplete">
        {suggestions.map((repo) => (
          <option key={repo} value={repo} />
        ))}
      </datalist>
    </label>
  );
};
