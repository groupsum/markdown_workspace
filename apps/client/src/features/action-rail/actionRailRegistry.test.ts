import { describe, expect, it } from 'vitest';
import { createActionRailRegistry } from './actionRailRegistry';

describe('action rail registry', () => {
  it('orders items by group and order', () => {
    const registry = createActionRailRegistry();

    registry.register({
      id: 'second',
      title: { defaultMessage: 'Second' },
      icon: { kind: 'lucide', name: 'Folder' },
      group: 'workspace.secondary',
      order: 20,
      target: { kind: 'command', commandId: 'second' },
    });

    registry.register({
      id: 'first',
      title: { defaultMessage: 'First' },
      icon: { kind: 'lucide', name: 'Folder' },
      group: 'workspace.primary',
      order: 10,
      target: { kind: 'command', commandId: 'first' },
    });

    expect(registry.listSync().map((item) => item.id)).toEqual(['first', 'second']);
  });
});
