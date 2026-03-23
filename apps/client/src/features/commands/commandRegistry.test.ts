import { describe, expect, it } from 'vitest';
import { createCommandRegistry } from './commandRegistry';

describe('command registry', () => {
  it('registers and executes commands', async () => {
    const registry = createCommandRegistry();
    let executed = false;

    registry.register({
      id: 'core.test',
      title: { defaultMessage: 'Test' },
      execute: () => {
        executed = true;
        return 'ok';
      },
    });

    const result = await registry.execute<string>('core.test');
    expect(result).toBe('ok');
    expect(executed).toBe(true);
  });
});
