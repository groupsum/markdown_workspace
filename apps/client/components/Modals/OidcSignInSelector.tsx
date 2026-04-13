import React from 'react';
import { GitConfig, OidcProviderId } from '../../types';
import { useClientI18n } from '../../src/features/i18n/useClientI18n';

interface OidcSignInSelectorProps {
  gitConfig: GitConfig;
  onGitConfigChange: (config: GitConfig) => void;
  onOidcSignIn: () => void;
}

const PROVIDERS: readonly OidcProviderId[] = ['github', 'gitlab', 'gitea'];

export const OidcSignInSelector: React.FC<OidcSignInSelectorProps> = ({
  gitConfig,
  onGitConfigChange,
  onOidcSignIn,
}) => {
  const { t } = useClientI18n();
  const patReady = gitConfig.patToken.trim().length > 0;

  return (
    <div className="settings-card settings-card-stack">
      <div className="flex flex-col gap-4">
        <div className="settings-form-grid">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)]">{t('core.settings.git.auth-mode', 'Authentication Mode')}</span>
            <select
              className="modal-input !text-xs !py-3"
              value={gitConfig.authMode}
              onChange={(event) => onGitConfigChange({
                ...gitConfig,
                authMode: event.target.value as GitConfig['authMode'],
                oidcProvider: gitConfig.oidcProvider || 'github',
              })}
            >
              <option value="oidc">{t('core.settings.git.auth-mode.oidc', 'OIDC')}</option>
              <option value="pat">{t('core.settings.git.auth-mode.pat', 'PAT')}</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)]">OIDC PROVIDER</span>
            <select
              className="modal-input !text-xs !py-3"
              value={gitConfig.oidcProvider || 'github'}
              onChange={(event) => {
                const provider = event.target.value as OidcProviderId;
                onGitConfigChange({ ...gitConfig, oidcProvider: provider });
              }}
            >
              {PROVIDERS.map((provider) => (
                <option key={provider} value={provider}>{provider.toUpperCase()}</option>
              ))}
            </select>
          </label>
        </div>

        {gitConfig.authMode === 'pat' && (
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-[var(--fg-muted)]">PAT TOKEN</span>
            <input
              className="modal-input !text-xs !py-3"
              type="password"
              value={gitConfig.patToken}
              onChange={(event) => onGitConfigChange({ ...gitConfig, authMode: 'pat', patToken: event.target.value })}
              placeholder="ghp_..."
            />
          </label>
        )}

        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-[var(--fg-muted)]">USERNAME</span>
          <input
            className="modal-input !text-xs !py-3"
            value={gitConfig.username}
            onChange={(event) => onGitConfigChange({ ...gitConfig, authMode: gitConfig.authMode, username: event.target.value })}
            placeholder="user"
          />
        </label>

        <div className="settings-inline-stats">
          <span className="settings-inline-stat"><span className="settings-inline-stat-label">OIDC</span><span className="settings-inline-stat-value">{gitConfig.oidcConnected ? 'CONNECTED' : 'DISCONNECTED'}</span></span>
          <span className="settings-inline-stat"><span className="settings-inline-stat-label">Provider</span><span className="settings-inline-stat-value">{(gitConfig.oidcProvider || 'github').toUpperCase()}</span></span>
          <span className="settings-inline-stat"><span className="settings-inline-stat-label">Token</span><span className="settings-inline-stat-value">{patReady ? 'READY' : 'REQUIRED'}</span></span>
        </div>

        <div className="settings-list-row">
          <div className="settings-list-row-main">
            <div className="settings-list-row-title">OIDC SUBJECT</div>
            <div className="settings-list-row-subtitle">{gitConfig.oidcSubject || 'NONE'}</div>
          </div>
        </div>

        {gitConfig.authMode === 'oidc' && (
          <button type="button" className="modal-btn modal-btn-primary" onClick={onOidcSignIn}>
            {t('core.settings.git.oidc.sign-in', 'OIDC_SIGN_IN')}
          </button>
        )}
      </div>
    </div>
  );
};
