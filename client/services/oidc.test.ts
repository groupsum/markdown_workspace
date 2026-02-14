// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { completeOidcSignInFromCallback, getOidcPopupEventType } from './oidc';

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


  it('returns flow mismatch error when implicit mode receives code callback params', async () => {
    window.history.replaceState({}, '', '/auth/callback?code=abc-code&state=abc123');
    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
        username: 'alice',
        state: 'abc123',
        redirectUri: 'http://localhost:5173/auth/callback',
        createdAt: Date.now(),
        flow: 'implicit'
      })
    );

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toContain('OIDC flow mismatch');
    expect(localStorage.getItem(pendingKey)).toBeNull();
  });

  it('stores credential and returns success from implicit hash response', async () => {
    window.history.replaceState({}, '', '/auth/callback#access_token=abc-token&id_token=id-token&expires_in=3600&state=abc123');

    localStorage.setItem(
      pendingKey,
      JSON.stringify({
        projectId: 'proj-1',
        provider: 'github',
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
});
