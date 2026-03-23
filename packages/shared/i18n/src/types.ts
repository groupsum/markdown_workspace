export type MessageValue = string | number | boolean | null | undefined;

export interface MessageDescriptor {
  readonly key?: string;
  readonly defaultMessage: string;
  readonly description?: string;
  readonly values?: Readonly<Record<string, MessageValue>>;
}

export type LocaleCatalogMessage = string | MessageDescriptor;
export type LocaleCatalogMessages = Readonly<Record<string, LocaleCatalogMessage>>;

export interface LocaleCatalog {
  readonly locale: string;
  readonly messages: LocaleCatalogMessages;
}

export interface LocaleRegistryOptions {
  readonly defaultLocale?: string;
  readonly fallbackLocale?: string;
}
