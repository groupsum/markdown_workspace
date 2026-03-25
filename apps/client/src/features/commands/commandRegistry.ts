import type { I18nLabel, ExtensionIcon } from '@mdwrk/extension-manifest';
import type { Disposable, RegisteredCommand } from '@mdwrk/extension-host';
import { createStoreEmitter, type ObservableStore } from '../common/observable';

export interface ClientCommandDefinition extends RegisteredCommand {
  readonly icon?: ExtensionIcon;
  readonly keywords?: readonly string[];
}

export interface CommandRegistrySnapshot {
  readonly commands: readonly ClientCommandDefinition[];
}

export interface CommandRegistry extends ObservableStore<CommandRegistrySnapshot> {
  register(command: ClientCommandDefinition): Disposable;
  execute<T = unknown>(id: string, ...args: unknown[]): Promise<T>;
  listSync(): readonly ClientCommandDefinition[];
  get(id: string): ClientCommandDefinition | undefined;
}

const compareLabels = (a: I18nLabel, b: I18nLabel) => a.defaultMessage.localeCompare(b.defaultMessage);

export function createCommandRegistry(): CommandRegistry {
  const commands = new Map<string, ClientCommandDefinition>();
  const emitter = createStoreEmitter();

  const snapshot = (): CommandRegistrySnapshot => ({
    commands: Array.from(commands.values()).sort((left, right) => compareLabels(left.title, right.title)),
  });

  return {
    getSnapshot(): CommandRegistrySnapshot {
      return snapshot();
    },
    subscribe: emitter.subscribe,
    register(command: ClientCommandDefinition): Disposable {
      commands.set(command.id, command);
      emitter.emit();
      return {
        dispose(): void {
          if (commands.get(command.id) === command) {
            commands.delete(command.id);
            emitter.emit();
          }
        },
      };
    },
    async execute<T = unknown>(id: string, ...args: unknown[]): Promise<T> {
      const command = commands.get(id);
      if (!command) {
        throw new Error(`Command not found: ${id}`);
      }
      return await command.execute(...args) as T;
    },
    listSync(): readonly ClientCommandDefinition[] {
      return snapshot().commands;
    },
    get(id: string): ClientCommandDefinition | undefined {
      return commands.get(id);
    },
  };
}
