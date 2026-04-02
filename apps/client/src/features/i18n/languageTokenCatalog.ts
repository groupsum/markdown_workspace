import type { I18nLabel } from '@mdwrk/extension-manifest';
import { CORE_SHELL_LOCALE_LOADER_DEFINITION } from '@mdwrk/i18n';
import { extensionManagerLabels } from '@mdwrk/extension-manager';
import { languagePackStudioLabels } from '@mdwrk/extension-language-pack-studio';
import { themeStudioLabels } from '@mdwrk/extension-theme-studio';

export interface LanguageTokenDefinition {
  readonly key: string;
  readonly defaultMessage: string;
  readonly source: string;
}

function collectLabels(source: string, labels: Record<string, I18nLabel | string>): LanguageTokenDefinition[] {
  return Object.values(labels)
    .filter((value): value is I18nLabel => typeof value !== 'string')
    .map((label) => ({
      key: label.key,
      defaultMessage: label.defaultMessage,
      source,
    }));
}

export async function loadWorkspaceLanguageTokenCatalog(): Promise<readonly LanguageTokenDefinition[]> {
  const coreCatalog = await CORE_SHELL_LOCALE_LOADER_DEFINITION.loaders.en();
  const tokens = [
    ...Object.entries(coreCatalog.messages).map(([key, defaultMessage]) => ({
      key,
      defaultMessage: typeof defaultMessage === 'string' ? defaultMessage : defaultMessage.defaultMessage,
      source: 'core',
    })),
    ...collectLabels('extension-manager', extensionManagerLabels),
    ...collectLabels('language-pack-studio', languagePackStudioLabels),
    ...collectLabels('theme-studio', themeStudioLabels),
  ];
  const deduped = new Map<string, LanguageTokenDefinition>();
  for (const token of tokens) {
    deduped.set(token.key, token);
  }
  return Array.from(deduped.values()).sort((left, right) => left.key.localeCompare(right.key));
}
