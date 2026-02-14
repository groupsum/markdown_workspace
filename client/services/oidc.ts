import { OidcCredential, OidcProviderId } from '../types';

interface OidcPendingSession {
  projectId: string;
  provider: OidcProviderId;
  username: string;
  state: string;
  verifier: string;
  redirectUri: string;
  createdAt: number;
}

interface OidcCallbackResult {
  status: 'success' | 'error' | 'idle';
  projectId?: string;
  provider?: OidcProviderId;
  credential?: OidcCredential;
  message?: string;
}

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
const OIDC_PENDING_KEY = 'lattice-oidc-pending-v1';

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

const getOidcRedirectUri = () => {
  const fqdn = import.meta.env.VITE_OIDC_FQDN?.trim() || window.location.origin;
  const callbackPath = import.meta.env.VITE_OIDC_CALLBACK_PATH?.trim() || '/auth/callback';
  return new URL(callbackPath, fqdn).toString();
};

export const isOidcCallbackRoute = () => {
  const callbackUrl = new URL(getOidcRedirectUri());
  return window.location.pathname === callbackUrl.pathname;
};

export const beginOidcSignIn = async (args: {
  projectId: string;
  provider: OidcProviderId;
  username: string;
}) => {
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID?.trim();
  if (!clientId) {
    throw new Error('OIDC client id is not configured.');
  }
  const adapter = getOidcAdapter(args.provider);
  if (!adapter) {
    throw new Error('Unsupported OIDC provider selected.');
  }

  const session = await createPkceSession();
  const redirectUri = getOidcRedirectUri();

  const pendingSession: OidcPendingSession = {
    projectId: args.projectId,
    provider: args.provider,
    username: args.username || 'user',
    state: session.state,
    verifier: session.verifier,
    redirectUri,
    createdAt: Date.now()
  };

  localStorage.setItem(OIDC_PENDING_KEY, JSON.stringify(pendingSession));

  const authorizationUrl = adapter.createAuthorizationUrl({
    clientId,
    redirectUri,
    state: session.state,
    codeChallenge: session.challenge
  });

  window.location.assign(authorizationUrl);
};

export const completeOidcSignInFromCallback = async (): Promise<OidcCallbackResult> => {
  if (!isOidcCallbackRoute()) {
    return { status: 'idle' };
  }

  const params = new URLSearchParams(window.location.search);
  const oauthError = params.get('error');
  if (oauthError) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: `OIDC sign-in failed: ${oauthError}` };
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) {
    return { status: 'error', message: 'OIDC callback is missing code or state.' };
  }

  const pendingRaw = localStorage.getItem(OIDC_PENDING_KEY);
  if (!pendingRaw) {
    return { status: 'error', message: 'OIDC session could not be restored.' };
  }

  try {
    const pending = JSON.parse(pendingRaw) as OidcPendingSession;
    if (pending.state !== state) {
      localStorage.removeItem(OIDC_PENDING_KEY);
      return { status: 'error', message: 'OIDC state validation failed.' };
    }

    const adapter = getOidcAdapter(pending.provider);
    if (!adapter) {
      localStorage.removeItem(OIDC_PENDING_KEY);
      return { status: 'error', message: 'OIDC provider is not available.' };
    }

    const credential = adapter.createMockCredential(pending.username);
    await storeOidcCredential(pending.projectId, credential);
    localStorage.removeItem(OIDC_PENDING_KEY);

    return {
      status: 'success',
      projectId: pending.projectId,
      provider: pending.provider,
      credential
    };
  } catch (error) {
    console.warn('[oidc] Failed to parse callback session', error);
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC callback parsing failed.' };
  }
};
