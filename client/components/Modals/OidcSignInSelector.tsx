import React from 'react';
import { KeyRound, Shield } from 'lucide-react';
import { AuthMode, GitConfig, OidcProviderId } from '../../types';
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

  const handleAuthModeSelect = (authMode: AuthMode) => {
    onGitConfigChange({ ...gitConfig, authMode });
  };

  const handlePatChange = (patToken: string) => {
    onGitConfigChange({ ...gitConfig, patToken });
  };

  return (
    <div className="settings-card settings-card-stack">
      <div className="flex items-center gap-2 text-[11px] uppercase font-bold text-[var(--fg-muted)]">
        <Shield size={14} /> AUTHENTICATION
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)]">AUTH MODE</span>
        <select
          className="modal-input !text-xs !py-3"
          value={gitConfig.authMode}
          onChange={(e) => handleAuthModeSelect(e.target.value as AuthMode)}
        >
          <option value="pat">PAT TOKEN</option>
          <option value="oidc">OIDC FLOW</option>
        </select>
      </label>

      {gitConfig.authMode === 'pat' ? (
        <>
          <div className="rounded border border-[var(--border-color)] bg-[var(--bg-inset)] px-3 py-2">
            <span className={`text-[10px] font-bold ${gitConfig.patToken.trim() ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
              {gitConfig.patToken.trim() ? 'AUTH_STATE: TOKEN_READY' : 'AUTH_STATE: TOKEN_REQUIRED'}
            </span>
            <p className="mt-1 text-[10px] text-[var(--fg-muted)]">
              PAT token is kept in project config and used directly for provider API calls.
            </p>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)]">PAT TOKEN</span>
            <input
              type="password"
              className="modal-input !text-xs !py-3"
              value={gitConfig.patToken}
              onChange={(e) => handlePatChange(e.target.value)}
              placeholder="ghp_... / glpat-..."
              autoComplete="off"
            />
          </label>
        </>
      ) : (
        <>
          <div className="rounded border border-[var(--border-color)] bg-[var(--bg-inset)] px-3 py-2">
            <span className={`text-[10px] font-bold ${gitConfig.oidcConnected ? 'text-[var(--accent)]' : 'text-[var(--danger)]'}`}>
              {gitConfig.oidcConnected ? 'AUTH_STATE: CONNECTED' : 'AUTH_STATE: DISCONNECTED'}
            </span>
            <p className="mt-1 text-[10px] text-[var(--fg-muted)]">
              {gitConfig.oidcConnected
                ? `SUBJECT: ${gitConfig.oidcSubject || 'UNKNOWN'}`
                : 'OIDC session is missing or expired. Reconnect to continue provider operations.'}
            </p>
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

          <div className="settings-action-row">
            <button className="modal-btn flex-1 modal-btn-primary" onClick={onOidcSignIn}>
              <KeyRound size={14} />
              {gitConfig.oidcConnected ? 'RECONNECT_OIDC' : 'CONNECT_OIDC'}
            </button>
          </div>
        </>
      )}

      <label className="flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[var(--fg-muted)]">USERNAME</span>
        <input
          className="modal-input !text-xs !py-3"
          value={gitConfig.username}
          onChange={(e) => handleUsernameChange(e.target.value)}
          placeholder="user"
        />
      </label>
    </div>
  );
};
