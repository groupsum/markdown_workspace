import { describe, expect, it } from 'vitest';
import { createViewRegistry } from './viewRegistry';

describe('view registry', () => {
  it('opens and closes views', async () => {
    const registry = createViewRegistry();
    registry.register({
      id: 'core.settings',
      title: { defaultMessage: 'Settings' },
      location: 'modal',
      render: () => null,
      allowMultiple: false,
    });

    await registry.open('core.settings');
    expect(registry.isOpen('core.settings')).toBe(true);

    await registry.close('core.settings');
    expect(registry.isOpen('core.settings')).toBe(false);
  });
});
