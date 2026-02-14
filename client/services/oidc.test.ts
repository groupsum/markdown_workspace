// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completeOidcSignInFromCallback } from './oidc';

const pendingKey = 'lattice-oidc-pending-v1';

describe('completeOidcSignInFromCallback', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('VITE_OIDC_CLIENT_ID', 'client-id');
    localStorage.clear();
    window.history.replaceState({}, '', '/auth/callback');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    global.fetch = originalFetch;
  });

  it('returns idle when callback route has no oidc params', async () => {
    const result = await completeOidcSignInFromCallback();

    expect(result).toEqual({ status: 'idle' });
  });

  it('returns error when only one required param is present', async () => {
    window.history.replaceState({}, '', '/auth/callback?state=abc123');

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toBe('OIDC callback is missing code or state.');
  });

  it('clears stale pending sessions and asks user to reconnect', async () => {
    window.history.replaceState({}, '', '/auth/callback?state=abc123&code=xyz');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        username: 'alice',
        state: 'abc123',
        verifier: 'verifier',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now() - 1000 * 60 * 11
      })
    );

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toBe('OIDC session expired. Please reconnect.');
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });

  it('exchanges code for access token and returns success', async () => {
    window.history.replaceState({}, '', '/auth/callback?state=abc123&code=xyz');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        username: 'alice',
        state: 'abc123',
        verifier: 'verifier',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now()
      })
    );

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: 'abc-token', expires_in: 3600, id_token: 'id-token' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 42, login: 'alice-gh' })
      }) as unknown as typeof fetch;

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('success');
    expect(result.credential?.accessToken).toBe('abc-token');
    expect(result.credential?.username).toBe('alice-gh');
    expect(result.credential?.subject).toBe('github-42');
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });
});
