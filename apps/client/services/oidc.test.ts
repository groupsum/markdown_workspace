// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitConfig } from '../types';
import { getAuthToken } from './gitConfig';
import {
  AGENT_EXTENSION_OIDC_TOKEN_BOUNDARY,
  completeOidcSignInFromCallback,
  getOidcPopupEventType,
  GIT_OPS_OIDC_TOKEN_BOUNDARY,
  readOidcCredential,
  storeOidcCredential,
} from './oidc';

const pendingKey = 'lattice-oidc-pending-v1';

describe('completeOidcSignInFromCallback (browser-only implicit flow)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('VITE_OIDC_CLIENT_ID', 'client-id');
    vi.stubEnv('VITE_OIDC_FLOW', 'implicit');
    localStorage.clear();
    window.history.replaceState({}, '', '/auth/callback');
    Object.defineProperty(window, 'opener', { value: null, configurable: true });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    global.fetch = originalFetch;
  });

  it('returns idle when callback route has no oidc params', async () => {
    const result = await completeOidcSignInFromCallback();
    expect(result).toEqual({ status: 'idle' });
  });

  it('clears stale pending sessions and asks user to reconnect', async () => {
    window.history.replaceState({}, '', '/auth/callback#access_token=tok&state=abc123');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
        username: 'alice',
        state: 'abc123',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now() - 1000 * 60 * 11,
        flow: 'implicit'
      })
    );

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toBe('OIDC session expired. Please reconnect.');
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });

  it('returns error when state does not match', async () => {
    window.history.replaceState({}, '', '/auth/callback#access_token=tok&state=wrong');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
        username: 'alice',
        state: 'abc123',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now(),
        flow: 'implicit'
      })
    );

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toBe('OIDC state validation failed.');
  });

  it('stores credential and returns success from implicit hash response', async () => {
    window.history.replaceState({}, '', '/auth/callback#access_token=abc-token&id_token=id-token&expires_in=3600&state=abc123');

    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
        username: 'alice',
        state: 'abc123',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now(),
        flow: 'implicit'
      })
    );

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ sub: '42', preferred_username: 'alice-gl' })
    }) as unknown as typeof fetch;

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('success');
    expect(result.credential?.accessToken).toBe('abc-token');
    expect(result.credential?.tokenBoundary).toBe(GIT_OPS_OIDC_TOKEN_BOUNDARY);
    expect(result.credential?.scopes).toContain('repo');
    expect(result.credential?.idToken).toBe('id-token');
    expect(result.credential?.username).toBe('alice-gl');
    expect(result.credential?.subject).toBe('github-42');
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });

  it('posts callback params to opener when completing in popup window', async () => {
    window.history.replaceState({}, '', '/auth/callback#access_token=abc-token&state=abc123');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
        username: 'alice',
        state: 'abc123',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now(),
        flow: 'implicit'
      })
    );

    const openerSpy = { postMessage: vi.fn() };
    Object.defineProperty(window, 'opener', { value: openerSpy, configurable: true });
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);

    const result = await completeOidcSignInFromCallback();

    expect(result).toEqual({ status: 'idle' });
    expect(openerSpy.postMessage).toHaveBeenCalledWith(
      {
        type: getOidcPopupEventType(),
        search: '',
        hash: '#access_token=abc-token&state=abc123'
      },
      window.location.origin
    );
    expect(closeSpy).toHaveBeenCalled();
  });

  it('rejects non-git OIDC credentials at the git auth boundary', async () => {
    await storeOidcCredential('proj-1', {
      provider: 'github',
      tokenBoundary: AGENT_EXTENSION_OIDC_TOKEN_BOUNDARY,
      scopes: ['openid'],
      username: 'agent',
      subject: 'github-agent',
      accessToken: 'agent-token',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    });

    const config: GitConfig = {
      repoUrl: 'https://github.com/mdwrk/test',
      branch: 'main',
      username: '',
      authMode: 'oidc',
      patToken: '',
      oidcProvider: 'github',
      oidcConnected: true,
      oidcSubject: 'github-agent',
    };

    await expect(getAuthToken('proj-1', config)).rejects.toThrow('Stored OIDC credential is not authorized for Git operations.');
  });

  it('rejects provider mismatches before returning an OIDC git token', async () => {
    await storeOidcCredential('proj-1', {
      provider: 'gitlab',
      tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
      scopes: ['openid', 'api'],
      username: 'alice',
      subject: 'gitlab-42',
      accessToken: 'gitlab-token',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    });

    const config: GitConfig = {
      repoUrl: 'https://github.com/mdwrk/test',
      branch: 'main',
      username: '',
      authMode: 'oidc',
      patToken: '',
      oidcProvider: 'gitlab',
      oidcConnected: true,
      oidcSubject: 'gitlab-42',
    };

    await expect(getAuthToken('proj-1', config)).rejects.toThrow('Connect github OIDC to continue.');
  });

  it('stores git and agent credentials in separate boundary namespaces', async () => {
    await storeOidcCredential('proj-1', {
      provider: 'github',
      tokenBoundary: GIT_OPS_OIDC_TOKEN_BOUNDARY,
      scopes: ['openid', 'repo'],
      username: 'git-user',
      subject: 'github-git-user',
      accessToken: 'git-token',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    });

    await storeOidcCredential('proj-1', {
      provider: 'github',
      tokenBoundary: AGENT_EXTENSION_OIDC_TOKEN_BOUNDARY,
      scopes: ['openid'],
      username: 'agent-user',
      subject: 'github-agent-user',
      accessToken: 'agent-token',
      issuedAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    });

    const gitCredential = await readOidcCredential('proj-1', GIT_OPS_OIDC_TOKEN_BOUNDARY);
    const agentCredential = await readOidcCredential('proj-1', AGENT_EXTENSION_OIDC_TOKEN_BOUNDARY);

    expect(gitCredential?.accessToken).toBe('git-token');
    expect(agentCredential?.accessToken).toBe('agent-token');
    expect(agentCredential?.tokenBoundary).toBe(AGENT_EXTENSION_OIDC_TOKEN_BOUNDARY);
  });
});
