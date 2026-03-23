import type { MessageDescriptor, MessageValue } from "./types.js";
export declare function defineMessages<T extends Record<string, MessageDescriptor>>(messages: T): T;
export declare function normalizeMessageDescriptor(descriptor: string | MessageDescriptor, key?: string): MessageDescriptor;
export declare function interpolateMessage(template: string, values?: Readonly<Record<string, MessageValue>>): string;
export declare function formatMessage(descriptor: string | MessageDescriptor, values?: Readonly<Record<string, MessageValue>>): string;
//# sourceMappingURL=format.d.ts.map