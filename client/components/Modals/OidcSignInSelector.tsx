import React from 'react';
import { Shield } from 'lucide-react';
import { GitConfig, OidcProviderId } from '../../types';
import { oidcAdapters } from '../../services/oidc';

interface OidcSignInSelectorProps {
  gitConfig: GitConfig;
  onGitConfigChange: (config: GitConfig) => void;
  onOidcSignIn: () => void;
}

const DEFAULT_PROVIDER: OidcProviderId = 'github';

export const OidcSignInSelector: React.FC<OidcSignInSelectorProps> = ({ gitConfig, onGitConfigChange, onOidcSignIn }) => {
  const selectedProviderId: OidcProviderId = gitConfig.oidcProvider || DEFAULT_PROVIDER;

  const handleProviderSelect = (provider: OidcProviderId) => {
    onGitConfigChange({ ...gitConfig, oidcProvider: provider });
  };

  const handleUsernameChange = (username: string) => {
    onGitConfigChange({ ...gitConfig, username });
  };

  return (
    <div className="settings-card settings-card-stack">
      <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-[var(--fg-muted)]">
        <Shield size={14} /> OIDC SIGN-IN
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)]">OIDC PROVIDER</span>
        <select
          className="modal-input !text-xs !py-3"
          value={selectedProviderId}
          onChange={(e) => handleProviderSelect(e.target.value as OidcProviderId)}
        >
          {oidcAdapters.map((adapter) => (
            <option key={adapter.id} value={adapter.id}>{adapter.label}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)]">USERNAME</span>
        <input
          className="modal-input !text-xs !py-3"
          value={gitConfig.username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          placeholder="user"
        />
      </label>

      <div className="settings-action-row">
        <button className="modal-btn flex-1 modal-btn-primary" onClick={onOidcSignIn}>
          {gitConfig.oidcConnected ? 'RECONNECT_OIDC' : 'CONNECT_OIDC'}
        </button>
      </div>
    </div>
  );
};
