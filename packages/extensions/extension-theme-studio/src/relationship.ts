import type {
  MarkdownWorkspaceThemeTokenName,
  ThemeBridgeVariableDefinition,
  ThemeClassDefinition,
} from "@markdown-workspace/theme-contract";
import type { ThemeStudioClassRelationship } from "./types.js";

const unique = (values: readonly MarkdownWorkspaceThemeTokenName[]) => Array.from(new Set(values));

export function buildThemeStudioClassRelationships(
  classes: readonly ThemeClassDefinition[],
  rendererBridge: readonly ThemeBridgeVariableDefinition[],
  editorBridge: readonly ThemeBridgeVariableDefinition[],
): readonly ThemeStudioClassRelationship[] {
  const rendererTokens = unique(rendererBridge.map((definition) => definition.sourceToken));
  const editorTokens = unique(editorBridge.map((definition) => definition.sourceToken));

  return classes.map((definition) => ({
    className: definition.name,
    selector: definition.selector,
    scope: definition.scope,
    stability: definition.stability,
    bridgeTarget: definition.scope === "renderer" ? "renderer" : definition.scope === "editor" ? "editor" : "host",
    sourceTokens: definition.scope === "renderer"
      ? rendererTokens
      : definition.scope === "editor"
        ? editorTokens
        : unique([...rendererTokens, ...editorTokens]),
  }));
}
