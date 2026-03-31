import type { AuthMode, GitConfig, OidcProviderId } from '../types';
import { readOidcCredential } from './oidc';

export const PROVIDER_REPO_HOST: Record<OidcProviderId, string> = {
  github: 'github.com',
  gitlab: 'gitlab.com',
  gitea: 'gitea.com',
};

export const DEFAULT_AUTH_MODE: AuthMode = 'pat';
export const DEFAULT_PROVIDER: OidcProviderId = 'github';

export const inferPatProvider = (token: string): OidcProviderId | null => {
  const trimmed = token.trim().toLowerCase();
  if (!trimmed) return null;

  if (
    trimmed.startsWith('ghp_') ||
    trimmed.startsWith('github_pat_') ||
    trimmed.startsWith('gho_') ||
    trimmed.startsWith('ghu_')
  ) {
    return 'github';
  }

  if (trimmed.startsWith('glpat-')) {
    return 'gitlab';
  }

  return null;
};

export const inferProviderFromRepoUrl = (value: string): OidcProviderId | null => {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.includes('github.com')) return 'github';
  if (trimmed.includes('gitlab.com')) return 'gitlab';
  if (trimmed.includes('gitea.com')) return 'gitea';
  return null;
};

export const normalizeRepositoryUrl = (value: string, defaultHost: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed.replace(/\.git$/i, '');
  if (/^[\w.-]+\/[\w.-]+(?:\.git)?$/.test(trimmed)) {
    return `https://${defaultHost}/${trimmed.replace(/\.git$/i, '')}`;
  }
  if (/^[\w.-]+\.[\w.-]+\/.+/.test(trimmed)) {
    return `https://${trimmed.replace(/\.git$/i, '')}`;
  }
  return trimmed.replace(/\.git$/i, '');
};

export const resolveGitProvider = (config: Pick<GitConfig, 'oidcProvider' | 'repoUrl' | 'patToken'>): OidcProviderId => {
  return inferProviderFromRepoUrl(config.repoUrl)
    ?? inferPatProvider(config.patToken)
    ?? (config.oidcProvider || DEFAULT_PROVIDER);
};

export const buildNormalizedGitConfig = (config: GitConfig): GitConfig => {
  const oidcProvider = resolveGitProvider(config);
  return {
    ...config,
    oidcProvider,
    repoUrl: normalizeRepositoryUrl(config.repoUrl, PROVIDER_REPO_HOST[oidcProvider]),
    authMode: config.authMode === 'oidc' ? 'oidc' : DEFAULT_AUTH_MODE,
  };
};

export const getDefaultGitConfig = (): GitConfig => ({
  repoUrl: '',
  branch: 'main',
  username: '',
  authMode: DEFAULT_AUTH_MODE,
  patToken: '',
  oidcProvider: DEFAULT_PROVIDER,
  oidcConnected: false,
  oidcSubject: '',
});

export const getAuthToken = async (projectId: string, gitConfig: GitConfig): Promise<string> => {
  if (gitConfig.authMode === 'pat') {
    const token = gitConfig.patToken.trim();
    if (!token) {
      throw new Error('Enter a PAT token to continue.');
    }
    return token;
  }

  const credential = await readOidcCredential(projectId);
  if (!credential?.accessToken) {
    throw new Error('Connect OIDC to continue.');
  }
  return credential.accessToken;
};
