import { OidcCredential, OidcProviderId } from '../types';

interface OidcPendingSession {
  projectId: string;
  provider: OidcProviderId;
  username: string;
  state: string;
  verifier?: string;
  nonce?: string;
  redirectUri: string;
  createdAt: number;
  flow: 'code' | 'implicit';
}

interface OidcCallbackResult {
  status: 'success' | 'error' | 'idle';
  projectId?: string;
  provider?: OidcProviderId;
  credential?: OidcCredential;
  message?: string;
}

const OIDC_POPUP_EVENT_TYPE = 'lattice:oidc:callback';

export interface OidcProviderAdapter {
  id: OidcProviderId;
  label: string;
  issuer: string;
  authorizeEndpoint: string;
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  defaultScopes: string[];
  createAuthorizationUrl: (args: {
    clientId: string;
    redirectUri: string;
    state: string;
    codeChallenge?: string;
    nonce?: string;
    flow: 'code' | 'implicit';
  }) => string;
  createMockCredential: (username: string) => OidcCredential;
}

type OidcTokenPayload = {
  access_token?: string;
  id_token?: string;
  expires_in?: number;
  token_type?: string;
  error?: string;
  error_description?: string;
};

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
  tokenEndpoint?: string;
  userInfoEndpoint?: string;
  defaultScopes: string[];
}): OidcProviderAdapter => ({
  ...config,
  createAuthorizationUrl: ({ clientId, redirectUri, state, codeChallenge, nonce, flow }) => {
    const responseType = flow === 'implicit' ? 'token id_token' : 'code';

    const query = new URLSearchParams({
      response_type: responseType,
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: config.defaultScopes.join(' '),
      state
    });

    // OIDC implicit/hybrid requires a nonce; keep it even for code flow to be safe.
    if (nonce) query.set('nonce', nonce);

    if (flow === 'code') {
      if (!codeChallenge) throw new Error('PKCE code challenge is required for code flow.');
      query.set('code_challenge', codeChallenge);
      query.set('code_challenge_method', 'S256');
    }

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

/**
 * IMPORTANT: For browser-only deployments (no proxy/server-side exchange), you must use
 * an OIDC provider configured for SPAs (public client) and the provider must support the chosen flow.
 *
 * - Preferred: Authorization Code + PKCE (flow='code') *if* the provider's token endpoint allows CORS.
 * - Fallback: Implicit (flow='implicit') to avoid token endpoint calls (many providers still allow it),
 *   but it is generally less desirable security-wise.
 *
 * Set VITE_OIDC_FLOW to 'code' or 'implicit'. Default is 'code' so callback query params
 * (`?code=...&state=...`) work out of the box with modern OIDC providers.
 */
export const oidcAdapters: OidcProviderAdapter[] = [
  createAdapter({
    id: 'github',
    label: 'GitHub OIDC',
    issuer: 'https://github.com',
    authorizeEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    userInfoEndpoint: 'https://api.github.com/user',
    defaultScopes: ['openid', 'repo', 'read:user']
  }),
  createAdapter({
    id: 'gitlab',
    label: 'GitLab OIDC',
    issuer: 'https://gitlab.com',
    authorizeEndpoint: 'https://gitlab.com/oauth/authorize',
    tokenEndpoint: 'https://gitlab.com/oauth/token',
    userInfoEndpoint: 'https://gitlab.com/oauth/userinfo',
    defaultScopes: ['openid', 'profile', 'api']
  }),
  createAdapter({
    id: 'gitea',
    label: 'Gitea OIDC',
    issuer: 'https://gitea.com',
    authorizeEndpoint: 'https://gitea.com/login/oauth/authorize',
    tokenEndpoint: 'https://gitea.com/login/oauth/access_token',
    userInfoEndpoint: 'https://gitea.com/login/oauth/userinfo',
    defaultScopes: ['openid', 'profile', 'repo']
  })
];

export const getOidcAdapter = (provider: OidcProviderId) => {
  return oidcAdapters.find((adapter) => adapter.id === provider);
};

const OIDC_CRED_PREFIX = 'lattice-oidc-cred-v1';
const OIDC_PENDING_KEY = 'lattice-oidc-pending-v1';
const OIDC_PENDING_TTL_MS = 1000 * 60 * 10;

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
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(credential)));
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

const parseTokenPayload = async (response: Response): Promise<OidcTokenPayload> => {
  const contentType = response.headers.get('content-type')?.toLowerCase() || '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as OidcTokenPayload;
  }

  const rawBody = await response.text();
  if (!rawBody) return {};

  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('text/plain')) {
    const params = new URLSearchParams(rawBody);
    return {
      access_token: params.get('access_token') || undefined,
      id_token: params.get('id_token') || undefined,
      expires_in: params.get('expires_in') ? Number(params.get('expires_in')) : undefined,
      token_type: params.get('token_type') || undefined,
      error: params.get('error') || undefined,
      error_description: params.get('error_description') || undefined
    };
  }

  try {
    return JSON.parse(rawBody) as OidcTokenPayload;
  } catch {
    return {};
  }
};

const parseImplicitFragment = (hash: string): OidcTokenPayload & { state?: string } => {
  const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(fragment);
  return {
    access_token: params.get('access_token') || undefined,
    id_token: params.get('id_token') || undefined,
    expires_in: params.get('expires_in') ? Number(params.get('expires_in')) : undefined,
    token_type: params.get('token_type') || undefined,
    error: params.get('error') || undefined,
    error_description: params.get('error_description') || undefined,
    state: params.get('state') || undefined
  };
};

export const isOidcCallbackRoute = () => {
  const callbackUrl = new URL(getOidcRedirectUri());
  return window.location.pathname === callbackUrl.pathname;
};

const getOidcFlow = (): 'code' | 'implicit' => {
  const raw = (import.meta.env.VITE_OIDC_FLOW || '').trim().toLowerCase();
  if (raw === 'code') return 'code';
  if (raw === 'implicit') return 'implicit';
  // Default to modern Authorization Code + PKCE for provider compatibility.
  return 'code';
};

export const beginOidcSignIn = async (args: { projectId: string; provider: OidcProviderId; username: string }) => {
  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID?.trim();
  if (!clientId) throw new Error('OIDC client id is not configured.');
  const adapter = getOidcAdapter(args.provider);
  if (!adapter) throw new Error('Unsupported OIDC provider selected.');

  const flow = getOidcFlow();
  const redirectUri = getOidcRedirectUri();

  const state = randomBase64Url(24);
  const nonce = randomBase64Url(24);

  let verifier: string | undefined;
  let challenge: string | undefined;

  if (flow === 'code') {
    const pkce = await createPkceSession();
    verifier = pkce.verifier;
    challenge = pkce.challenge;
  }

  const pendingSession: OidcPendingSession = {
    projectId: args.projectId,
    provider: args.provider,
    username: args.username || 'user',
    state,
    verifier,
    nonce,
    redirectUri,
    createdAt: Date.now(),
    flow
  };

  localStorage.setItem(OIDC_PENDING_KEY, JSON.stringify(pendingSession));

  const authorizationUrl = adapter.createAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: challenge,
    nonce,
    flow
  });

  const popupWidth = 560;
  const popupHeight = 720;
  const left = Math.max(0, window.screenX + Math.round((window.outerWidth - popupWidth) / 2));
  const top = Math.max(0, window.screenY + Math.round((window.outerHeight - popupHeight) / 2));
  const popup = window.open(
    authorizationUrl,
    'oidc-connect',
    `popup=yes,width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );

  if (!popup) {
    window.location.assign(authorizationUrl);
    return;
  }

  popup.focus();
};

const buildCredential = async (pending: OidcPendingSession, tokenPayload: OidcTokenPayload): Promise<OidcCredential> => {
  const issuedAt = Date.now();
  const expiresAt = tokenPayload.expires_in ? issuedAt + tokenPayload.expires_in * 1000 : issuedAt + 60 * 60 * 1000;

  const adapter = getOidcAdapter(pending.provider);
  let username = pending.username || 'user';
  let subject = `${pending.provider}-${username}`;

  if (adapter?.userInfoEndpoint && tokenPayload.access_token) {
    try {
      const userResponse = await fetch(adapter.userInfoEndpoint, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${tokenPayload.access_token}`
        }
      });

      if (userResponse.ok) {
        const profile = (await userResponse.json()) as Record<string, unknown>;
        const profileUsername =
          (typeof profile.preferred_username === 'string' && profile.preferred_username) ||
          (typeof profile.username === 'string' && profile.username) ||
          (typeof profile.login === 'string' && profile.login) ||
          (typeof profile.name === 'string' && profile.name) ||
          '';
        const profileSubject =
          (typeof profile.sub === 'string' && profile.sub) ||
          (typeof profile.id === 'number' && String(profile.id)) ||
          (typeof profile.id === 'string' && profile.id) ||
          '';
        username = profileUsername || username;
        subject = profileSubject ? `${pending.provider}-${profileSubject}` : subject;
      }
    } catch (error) {
      console.warn('[oidc] userinfo request failed', error);
    }
  }

  return {
    provider: pending.provider,
    username,
    subject,
    accessToken: tokenPayload.access_token || '',
    idToken: tokenPayload.id_token,
    issuedAt,
    expiresAt
  };
};

export const completeOidcSignInFromCallback = async (callbackSearch?: string, callbackHash?: string): Promise<OidcCallbackResult> => {
  if (!callbackSearch && !isOidcCallbackRoute()) return { status: 'idle' };

  // Prefer forwarded params when parent processes popup callback.
  const search = callbackSearch ?? window.location.search;
  const hash = callbackHash ?? window.location.hash;
  const params = new URLSearchParams(search);
  const fragment = parseImplicitFragment(hash);

  const hasOidcCallbackParams = Boolean(
    params.get('code') ||
      params.get('state') ||
      params.get('error') ||
      fragment.access_token ||
      fragment.id_token ||
      fragment.state ||
      fragment.error
  );

  // Callback route can be loaded without OAuth params (bookmark/refresh).
  if (!hasOidcCallbackParams) return { status: 'idle' };

  const pendingRaw = localStorage.getItem(OIDC_PENDING_KEY);
  if (!pendingRaw) return { status: 'error', message: 'OIDC session could not be restored.' };

  let pending: OidcPendingSession;
  try {
    pending = JSON.parse(pendingRaw) as OidcPendingSession;
  } catch {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC session could not be restored.' };
  }

  if (!pending.createdAt || Date.now() - pending.createdAt > OIDC_PENDING_TTL_MS) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC session expired. Please reconnect.' };
  }

  // If invoked in popup without forwarded params, forward search+hash to opener.
  if (!callbackSearch && window.opener && window.opener !== window) {
    window.opener.postMessage(
      {
        type: OIDC_POPUP_EVENT_TYPE,
        search: window.location.search,
        hash: window.location.hash
      },
      window.location.origin
    );
    window.close();
    return { status: 'idle' };
  }

  const queryCode = params.get('code');
  const queryState = params.get('state');

  const oauthError = params.get('error') || fragment.error;
  if (oauthError) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: `OIDC sign-in failed: ${oauthError}` };
  }

  // Implicit flow: tokens are delivered in URL fragment.
  if (pending.flow === 'implicit') {
    if (queryCode || queryState) {
      localStorage.removeItem(OIDC_PENDING_KEY);
      return {
        status: 'error',
        message:
          "OIDC flow mismatch: provider returned code/state query params, but client is configured for implicit flow. Set VITE_OIDC_FLOW='code' (and ensure PKCE + token endpoint CORS are configured), then retry."
      };
    }

    const state = fragment.state;
    if (!state || state !== pending.state) {
      localStorage.removeItem(OIDC_PENDING_KEY);
      return { status: 'error', message: 'OIDC state validation failed.' };
    }
    if (!fragment.access_token) {
      localStorage.removeItem(OIDC_PENDING_KEY);
      const details = fragment.error_description || fragment.error || 'Provider did not return an access token.';
      return { status: 'error', message: `OIDC implicit response invalid: ${details}` };
    }

    const credential = await buildCredential(pending, fragment);
    await storeOidcCredential(pending.projectId, credential);
    localStorage.removeItem(OIDC_PENDING_KEY);

    // Clear hash to avoid leaking tokens via copy/paste or referrers.
    window.history.replaceState({}, document.title, window.location.pathname + window.location.search);

    return { status: 'success', projectId: pending.projectId, provider: pending.provider, credential };
  }

  // Code + PKCE flow.
  const code = params.get('code');
  const state = params.get('state');

  // Callback route can be loaded without OAuth params (bookmark/refresh).
  if (!oauthError && !code && !state) return { status: 'idle' };

  if (!code || !state) return { status: 'error', message: 'OIDC callback is missing code or state.' };

  if (pending.state !== state) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC state validation failed.' };
  }

  const adapter = getOidcAdapter(pending.provider);
  if (!adapter?.tokenEndpoint) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC token endpoint is not configured for this provider.' };
  }

  const clientId = import.meta.env.VITE_OIDC_CLIENT_ID?.trim();
  if (!clientId) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: 'OIDC client id is not configured.' };
  }

  const tokenBody = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: pending.redirectUri,
    client_id: clientId,
    code_verifier: pending.verifier || ''
  });

  let tokenResponse: Response;
  try {
    tokenResponse = await fetch(adapter.tokenEndpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody.toString(),
      mode: 'cors',
      credentials: 'omit'
    });
  } catch (error) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    console.warn('[oidc] Token exchange request failed', error);
    return {
      status: 'error',
      message:
        "OIDC token exchange failed before reaching provider. For strict browser-only deployments, either (1) use an OIDC provider whose token endpoint allows CORS for your origin, or (2) set VITE_OIDC_FLOW='implicit' to avoid token endpoint calls."
    };
  }

  if (!tokenResponse.ok) {
    const reason = await tokenResponse.text();
    localStorage.removeItem(OIDC_PENDING_KEY);
    return { status: 'error', message: `OIDC token exchange failed (${tokenResponse.status}): ${reason || tokenResponse.statusText}` };
  }

  const tokenPayload = await parseTokenPayload(tokenResponse);

  if (!tokenPayload.access_token) {
    localStorage.removeItem(OIDC_PENDING_KEY);
    const details = tokenPayload.error_description || tokenPayload.error || 'Provider did not return an access token.';
    return { status: 'error', message: `OIDC token response invalid: ${details}` };
  }

  const credential = await buildCredential(pending, tokenPayload);
  await storeOidcCredential(pending.projectId, credential);
  localStorage.removeItem(OIDC_PENDING_KEY);

  return { status: 'success', projectId: pending.projectId, provider: pending.provider, credential };
};

export const getOidcPopupEventType = () => OIDC_POPUP_EVENT_TYPE;
