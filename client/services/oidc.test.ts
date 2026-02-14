// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { completeOidcSignInFromCallback } from './oidc';

describe('completeOidcSignInFromCallback', () => {
  it('returns idle when callback route has no oidc params', async () => {
    window.history.replaceState({}, '', '/auth/callback');
    localStorage.removeItem('lattice-oidc-pending-v1');

    const result = await completeOidcSignInFromCallback();

    expect(result).toEqual({ status: 'idle' });
  });

  it('returns error when only one required param is present', async () => {
    window.history.replaceState({}, '', '/auth/callback?state=abc123');

    const result = await completeOidcSignInFromCallback();

    expect(result.status).toBe('error');
    expect(result.message).toBe('OIDC callback is missing code or state.');
  });
});
