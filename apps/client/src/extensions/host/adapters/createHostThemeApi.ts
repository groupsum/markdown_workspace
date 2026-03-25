import {
  createEmptyThemePreset,
  getThemeBridgeDefinitions,
  MARKDOWN_WORKSPACE_THEME_CLASSES,
  MARKDOWN_WORKSPACE_THEME_TOKENS,
  type MarkdownWorkspaceThemeTokenMap,
  type MarkdownWorkspaceThemeTokenName,
  type ThemeBridgeTarget,
  type ThemePreset,
} from '@mdwrk/theme-contract';
import type { HostThemeApi } from '@mdwrk/extension-host';
import {
  createThemeBridgeVariableRecord,
  renderThemeBridgeCssVariables,
  renderThemeCssVariables,
} from '@mdwrk/ui-tokens/theme-map';
import type { ClientRuntimeBridge } from '../../../app/runtime/clientRuntimeTypes';

const tokenMap = new Map(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [definition.name, definition]));

function isThemePreset(value: ThemePreset | Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): value is ThemePreset {
  return Boolean(value && typeof value === 'object' && 'tokens' in value);
}

export function createHostThemeApi(runtime: ClientRuntimeBridge): HostThemeApi {
  const appliedDraftTokens = new Map<MarkdownWorkspaceThemeTokenName, string>();
  const draftTokens = new Map<MarkdownWorkspaceThemeTokenName, string>();

  const getRoot = () => document.documentElement;

  const applyTokenRecord = (tokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): void => {
    for (const [token, value] of Object.entries(tokens) as Array<[MarkdownWorkspaceThemeTokenName, string]>) {
      const definition = tokenMap.get(token);
      if (!definition) continue;
      getRoot().style.setProperty(definition.cssCustomProperty, value);
    }
  };

  const readTokenMap = async (): Promise<MarkdownWorkspaceThemeTokenMap> => {
    const entries = await Promise.all(
      MARKDOWN_WORKSPACE_THEME_TOKENS.map(async (definition) => {
        const computed = getComputedStyle(getRoot()).getPropertyValue(definition.cssCustomProperty).trim();
        return [definition.name, computed || definition.defaultValue] as const;
      }),
    );
    return Object.freeze(Object.fromEntries(entries)) as MarkdownWorkspaceThemeTokenMap;
  };

  const resetToActiveTheme = async (): Promise<void> => {
    const root = getRoot();
    for (const definition of MARKDOWN_WORKSPACE_THEME_TOKENS) {
      root.style.removeProperty(definition.cssCustomProperty);
    }
    const currentTheme = runtime.getSnapshot().app.state.theme;
    await runtime.getSnapshot().app.actions.setTheme(currentTheme);
  };

  const setDraftTokensInternal = async (tokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>): Promise<void> => {
    for (const [token, value] of Object.entries(tokens) as Array<[MarkdownWorkspaceThemeTokenName, string | undefined]>) {
      if (typeof value !== "string") continue;
      draftTokens.set(token, value);
    }
    applyTokenRecord(Object.fromEntries(draftTokens.entries()) as Partial<Record<MarkdownWorkspaceThemeTokenName, string>>);
  };

  return {
    async getToken(token: MarkdownWorkspaceThemeTokenName): Promise<string | null> {
      const definition = tokenMap.get(token);
      if (!definition) return null;
      const computed = getComputedStyle(getRoot()).getPropertyValue(definition.cssCustomProperty).trim();
      return computed || null;
    },
    async getTokenMap(): Promise<MarkdownWorkspaceThemeTokenMap> {
      return await readTokenMap();
    },
    async getTokens() {
      return MARKDOWN_WORKSPACE_THEME_TOKENS;
    },
    async getClassNames() {
      return MARKDOWN_WORKSPACE_THEME_CLASSES;
    },
    async getThemeBridge(target: ThemeBridgeTarget) {
      return getThemeBridgeDefinitions(target);
    },
    async getThemeBridgeVariables(target: ThemeBridgeTarget) {
      const tokens = await readTokenMap();
      return createThemeBridgeVariableRecord(target, tokens);
    },
    async setDraftToken(token, value): Promise<void> {
      const definition = tokenMap.get(token);
      if (!definition) return;
      draftTokens.set(token, value);
      getRoot().style.setProperty(definition.cssCustomProperty, value);
    },
    async setDraftTokens(tokens): Promise<void> {
      await setDraftTokensInternal(tokens);
    },
    async previewTheme(presetOrTokens): Promise<void> {
      const tokens = isThemePreset(presetOrTokens) ? presetOrTokens.tokens : presetOrTokens;
      await setDraftTokensInternal(tokens);
    },
    async applyDraft(): Promise<void> {
      for (const [token, value] of draftTokens.entries()) {
        appliedDraftTokens.set(token, value);
      }
      draftTokens.clear();
    },
    async discardDraft(): Promise<void> {
      draftTokens.clear();
      await resetToActiveTheme();
      applyTokenRecord(Object.fromEntries(appliedDraftTokens.entries()) as Partial<Record<MarkdownWorkspaceThemeTokenName, string>>);
    },
    async exportTheme() {
      const snapshot = runtime.getSnapshot();
      const preset = createEmptyThemePreset(snapshot.app.state.theme, snapshot.app.state.currentThemeDef.name);
      const tokens = await readTokenMap();
      return {
        ...preset,
        metadata: {
          ...preset.metadata,
          description: `Exported from ${snapshot.app.state.currentProject?.name ?? 'workspace'}`,
        },
        tokens,
      };
    },
    async exportThemeCss(options) {
      const tokens = await readTokenMap();
      if (options?.target && options.target !== 'host') {
        return renderThemeBridgeCssVariables(options.target, tokens, { selector: options.selector ?? ':root' });
      }
      return renderThemeCssVariables(tokens, { selector: options?.selector ?? ':root' });
    },
    async supportsClass(className) {
      return MARKDOWN_WORKSPACE_THEME_CLASSES.some((definition) => definition.name === className);
    },
  };
}
