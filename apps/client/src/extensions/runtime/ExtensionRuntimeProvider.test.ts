import { describe, expect, it } from 'vitest';
import { resolveBundledExtensionEnabledByDefault } from './bundledExtensionDefaults';
import { createClientExtensionTrustPolicy } from './extensionTrustPolicy';
import { shouldRegisterRuntimeSmokeExtension } from './runtimeSmokeGate';

describe('ExtensionRuntimeProvider runtime smoke gate', () => {
  it('registers the runtime smoke extension only in test mode', () => {
    expect(shouldRegisterRuntimeSmokeExtension('test')).toBe(true);
    expect(shouldRegisterRuntimeSmokeExtension('development')).toBe(false);
    expect(shouldRegisterRuntimeSmokeExtension('production')).toBe(false);
  });

  it('rejects unsigned external artifacts by default in production', () => {
    expect(createClientExtensionTrustPolicy('production', false)).toEqual({
      allowUnsigned: false,
      allowIntegrityOnly: false,
    });
    expect(createClientExtensionTrustPolicy('test', false)).toEqual({
      allowUnsigned: true,
      allowIntegrityOnly: true,
    });
  });

  it('uses an explicit bundled-extension default policy in production', () => {
    expect(resolveBundledExtensionEnabledByDefault('core.gemini-agent', 'production')).toBe(true);
    expect(resolveBundledExtensionEnabledByDefault('core.workspace-files', 'production')).toBe(true);
    expect(resolveBundledExtensionEnabledByDefault('core.unknown-dev-extension', 'production')).toBe(false);
    expect(resolveBundledExtensionEnabledByDefault('core.unknown-dev-extension', 'development')).toBe(true);
  });
});
