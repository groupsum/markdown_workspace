import { describe, expect, it } from 'vitest';
import { shouldRegisterRuntimeSmokeExtension } from './runtimeSmokeGate';

describe('ExtensionRuntimeProvider runtime smoke gate', () => {
  it('registers the runtime smoke extension only in test mode', () => {
    expect(shouldRegisterRuntimeSmokeExtension('test')).toBe(true);
    expect(shouldRegisterRuntimeSmokeExtension('development')).toBe(false);
    expect(shouldRegisterRuntimeSmokeExtension('production')).toBe(false);
  });
});
