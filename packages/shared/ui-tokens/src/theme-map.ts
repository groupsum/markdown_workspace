import {
  MARKDOWN_WORKSPACE_THEME_TOKENS,
  type MarkdownWorkspaceThemeTokenMap,
  type MarkdownWorkspaceThemeTokenName,
} from "@mdwrk/theme-contract/tokens";
import {
  getThemeBridgeDefinitions,
  type ThemeBridgeTarget,
} from "@mdwrk/theme-contract/bridges";

export type ThemeTokenOverrides = Partial<Record<MarkdownWorkspaceThemeTokenName, string>>;

export interface ThemeCssVariableRenderOptions {
  readonly selector?: string;
  readonly indent?: string;
  readonly compact?: boolean;
}

export function createMarkdownWorkspaceThemeTokenMap(
  overrides: ThemeTokenOverrides = {},
): MarkdownWorkspaceThemeTokenMap {
  return Object.freeze(
    Object.fromEntries(
      MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [
        definition.name,
        overrides[definition.name] ?? definition.defaultValue,
      ]),
    ) as MarkdownWorkspaceThemeTokenMap,
  );
}

export function createThemeCssCustomPropertyRecord(
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  const tokenMap = createMarkdownWorkspaceThemeTokenMap(overrides);
  return Object.freeze(
    Object.fromEntries(
      MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [
        definition.cssCustomProperty,
        tokenMap[definition.name],
      ]),
    ) as Record<`--${string}`, string>,
  );
}

export function createThemeBridgeVariableRecord(
  target: ThemeBridgeTarget,
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  const tokenMap = createMarkdownWorkspaceThemeTokenMap(overrides);
  return Object.freeze(
    Object.fromEntries(
      getThemeBridgeDefinitions(target).map((definition) => [
        definition.cssCustomProperty,
        tokenMap[definition.sourceToken],
      ]),
    ) as Record<`--${string}`, string>,
  );
}

export function createRendererThemeBridgeVariableRecord(
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  return createThemeBridgeVariableRecord("renderer", overrides);
}

export function createEditorThemeBridgeVariableRecord(
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  return createThemeBridgeVariableRecord("editor", overrides);
}

export function renderThemeCssVariables(
  overrides: ThemeTokenOverrides = {},
  options: ThemeCssVariableRenderOptions = {},
): string {
  const selector = options.selector ?? ":root";
  const indent = options.indent ?? "  ";
  const compact = options.compact ?? false;
  const propertyRecord = createThemeCssCustomPropertyRecord(overrides);
  const lines = Object.entries(propertyRecord).map(([property, value]) => `${indent}${property}: ${value};`);

  if (compact) {
    return `${selector}{${lines.map((line) => line.trim()).join("")}}`;
  }

  return `${selector} {\n${lines.join("\n")}\n}`;
}

export function renderThemeBridgeCssVariables(
  target: ThemeBridgeTarget,
  overrides: ThemeTokenOverrides = {},
  options: ThemeCssVariableRenderOptions = {},
): string {
  const selector = options.selector ?? ":root";
  const indent = options.indent ?? "  ";
  const compact = options.compact ?? false;
  const propertyRecord = createThemeBridgeVariableRecord(target, overrides);
  const lines = Object.entries(propertyRecord).map(([property, value]) => `${indent}${property}: ${value};`);

  if (compact) {
    return `${selector}{${lines.map((line) => line.trim()).join("")}}`;
  }

  return `${selector} {\n${lines.join("\n")}\n}`;
}
