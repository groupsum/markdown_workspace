import type { HostCommandApi } from '@mdwrk/extension-host';
import type { CommandRegistry } from '../../../features/commands/commandRegistry';

export function createHostCommandApi(commands: CommandRegistry): HostCommandApi {
  return {
    async execute<T = unknown>(id: string, ...args: unknown[]): Promise<T> {
      return await commands.execute<T>(id, ...args);
    },
    async list(): Promise<readonly string[]> {
      return commands.listSync().map((command) => command.id);
    },
  };
}
