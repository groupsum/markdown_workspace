const PRODUCTION_ENABLED_BUNDLED_EXTENSION_IDS = new Set([
  'core.workspace-files',
  'core.git-ops',
  'core.extension-manager',
  'core.language-pack-studio',
  'core.gemini-agent',
  'core.theme-studio',
]);

export function resolveBundledExtensionEnabledByDefault(extensionId: string, mode: string): boolean {
  if (mode === 'production') {
    return PRODUCTION_ENABLED_BUNDLED_EXTENSION_IDS.has(extensionId);
  }
  return true;
}
