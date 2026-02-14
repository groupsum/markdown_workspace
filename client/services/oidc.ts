import { OidcCredential, OidcProviderId } from '../types';

export interface OidcProviderAdapter {
  id: OidcProviderId;
  label: string;
  issuer: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  defaultScopes: string[];
  createAuthorizationUrl: (args: {
    clientId: string;
    redirectUri: string;
    state: string;
    codeChallenge: string;
  }) => string;
  createMockCredential: (username: string) => OidcCredential;
}

const buildPkceChallenge = async (verifier: string): Promise<string> => {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const b64 = btoa(String.fromCharCode(...new Uint8Array(digest)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const randomBase64Url = (len = 32): string => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};

const createAdapter = (config: {
  id: OidcProviderId;
  label: string;
  issuer: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  defaultScopes: string[];
}): OidcProviderAdapter => ({
  ...config,
  createAuthorizationUrl: ({ clientId, redirectUri, state, codeChallenge }) => {
    const query = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: config.defaultScopes.join(' '),
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    return `${config.authorizeEndpoint}?${query.toString()}`;
  },
  createMockCredential: (username) => ({
    provider: config.id,
    username,
    subject: `${config.id}-${username}`,
    accessToken: randomBase64Url(48),
    idToken: randomBase64Url(64),
    issuedAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60
  })
});

export const oidcAdapters: OidcProviderAdapter[] = [
  createAdapter({
    id: 'github',
    label: 'GitHub OIDC',
    issuer: 'https://github.com',
    authorizeEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    defaultScopes: ['openid', 'repo', 'read:user']
  }),
  createAdapter({
    id: 'gitlab',
    label: 'GitLab OIDC',
    issuer: 'https://gitlab.com',
    authorizeEndpoint: 'https://gitlab.com/oauth/authorize',
    tokenEndpoint: 'https://gitlab.com/oauth/token',
    defaultScopes: ['openid', 'profile', 'api']
  }),
  createAdapter({
    id: 'gitea',
    label: 'Gitea OIDC',
    issuer: 'https://gitea.com',
    authorizeEndpoint: 'https://gitea.com/login/oauth/authorize',
    tokenEndpoint: 'https://gitea.com/login/oauth/access_token',
    defaultScopes: ['openid', 'profile', 'repo']
  })
];

export const getOidcAdapter = (provider: OidcProviderId) => {
  return oidcAdapters.find((adapter) => adapter.id === provider);
};

const OIDC_CRED_PREFIX = 'lattice-oidc-cred-v1';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const deriveLocalKey = async (): Promise<CryptoKey> => {
  const originSalt = `${window.location.origin}:oidc:v1`;
  const baseKey = await crypto.subtle.importKey('raw', encoder.encode(originSalt), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: encoder.encode(navigator.userAgent),
      iterations: 120000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

export const storeOidcCredential = async (projectId: string, credential: OidcCredential): Promise<void> => {
  const key = await deriveLocalKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(JSON.stringify(credential))
  );
  const payload = {
    iv: Array.from(iv),
    data: Array.from(new Uint8Array(ciphertext))
  };
  localStorage.setItem(`${OIDC_CRED_PREFIX}:${projectId}`, JSON.stringify(payload));
};

export const readOidcCredential = async (projectId: string): Promise<OidcCredential | null> => {
  const raw = localStorage.getItem(`${OIDC_CRED_PREFIX}:${projectId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { iv: number[]; data: number[] };
    const key = await deriveLocalKey();
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(parsed.iv) },
      key,
      new Uint8Array(parsed.data)
    );
    const credential = JSON.parse(decoder.decode(plaintext)) as OidcCredential;
    if (credential.expiresAt && credential.expiresAt < Date.now()) {
      localStorage.removeItem(`${OIDC_CRED_PREFIX}:${projectId}`);
      return null;
    }
    return credential;
  } catch (error) {
    console.warn('[oidc] Failed to decrypt OIDC credential', error);
    localStorage.removeItem(`${OIDC_CRED_PREFIX}:${projectId}`);
    return null;
  }
};

export const clearOidcCredential = (projectId: string) => {
  localStorage.removeItem(`${OIDC_CRED_PREFIX}:${projectId}`);
};

export const createPkceSession = async () => {
  const state = randomBase64Url(24);
  const verifier = randomBase64Url(48);
  const challenge = await buildPkceChallenge(verifier);
  return { state, verifier, challenge };
};
