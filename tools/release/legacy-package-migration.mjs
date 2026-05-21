const MDWRK_REPO = 'https://github.com/groupsum/mdwrk';
const MDWRK_PAGES_REPO = 'https://github.com/groupsum/mdwrk-pages';

function entry({ packageName, targetRepo, targetDirectory }) {
  return {
    packageName,
    targetRepo,
    targetDirectory,
    targetUrl: `${targetRepo}/tree/master/${targetDirectory}`,
  };
}

export const LEGACY_PACKAGE_MIGRATIONS = [
  entry({ packageName: '@mdwrk/extension-host', targetRepo: MDWRK_REPO, targetDirectory: 'packages/contracts/extension-host' }),
  entry({ packageName: '@mdwrk/extension-manifest', targetRepo: MDWRK_REPO, targetDirectory: 'packages/contracts/extension-manifest' }),
  entry({ packageName: '@mdwrk/theme-contract', targetRepo: MDWRK_REPO, targetDirectory: 'packages/contracts/theme-contract' }),
  entry({ packageName: '@mdwrk/markdown-renderer-core', targetRepo: MDWRK_REPO, targetDirectory: 'packages/renderer/markdown-renderer-core' }),
  entry({ packageName: '@mdwrk/markdown-renderer-react', targetRepo: MDWRK_REPO, targetDirectory: 'packages/renderer/markdown-renderer-react' }),
  entry({ packageName: '@mdwrk/markdown-editor-core', targetRepo: MDWRK_REPO, targetDirectory: 'packages/editor/markdown-editor-core' }),
  entry({ packageName: '@mdwrk/markdown-editor-react', targetRepo: MDWRK_REPO, targetDirectory: 'packages/editor/markdown-editor-react' }),
  entry({ packageName: '@mdwrk/markdown-edit-in-renderer-react', targetRepo: MDWRK_REPO, targetDirectory: 'packages/editor/markdown-edit-in-renderer-react' }),
  entry({ packageName: '@mdwrk/extension-runtime', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-runtime' }),
  entry({ packageName: '@mdwrk/extension-workspace-files', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-workspace-files' }),
  entry({ packageName: '@mdwrk/extension-git-ops', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-git-ops' }),
  entry({ packageName: '@mdwrk/extension-manager', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-manager' }),
  entry({ packageName: '@mdwrk/extension-gemini-agent', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-gemini-agent' }),
  entry({ packageName: '@mdwrk/extension-theme-studio', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-theme-studio' }),
  entry({ packageName: '@mdwrk/extension-language-pack-studio', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-language-pack-studio' }),
  entry({ packageName: '@mdwrk/extension-catalog-hello', targetRepo: MDWRK_REPO, targetDirectory: 'packages/extensions/extension-catalog-hello' }),
  entry({ packageName: '@mdwrk/i18n', targetRepo: MDWRK_REPO, targetDirectory: 'packages/shared/i18n' }),
  entry({ packageName: '@mdwrk/icons', targetRepo: MDWRK_REPO, targetDirectory: 'packages/shared/icons' }),
  entry({ packageName: '@mdwrk/testing', targetRepo: MDWRK_REPO, targetDirectory: 'packages/shared/testing' }),
  entry({ packageName: '@mdwrk/ui-tokens', targetRepo: MDWRK_REPO, targetDirectory: 'packages/shared/ui-tokens' }),
  entry({ packageName: '@mdwrk/structured-data', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/shared/structured-data' }),
  entry({ packageName: '@mdwrk/lander-content-contract', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-content-contract' }),
  entry({ packageName: '@mdwrk/lander-core', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-core' }),
  entry({ packageName: '@mdwrk/lander-seo', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-seo' }),
  entry({ packageName: '@mdwrk/lander-theme', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-theme' }),
  entry({ packageName: '@mdwrk/lander-react', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-react' }),
  entry({ packageName: '@mdwrk/lander-markdown-content-adapter', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-markdown-content-adapter' }),
  entry({ packageName: '@mdwrk/lander-page-templates', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-page-templates' }),
  entry({ packageName: '@mdwrk/lander-page-template-presets', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/lander/lander-page-template-presets' }),
  entry({ packageName: '@mdwrk/page-template-demo-content-pack', targetRepo: MDWRK_PAGES_REPO, targetDirectory: 'packages/content/page-template-demo-content-pack' }),
];

export const LEGACY_PACKAGE_MIGRATION_BY_NAME = new Map(
  LEGACY_PACKAGE_MIGRATIONS.map((migration) => [migration.packageName, migration]),
);

export function getLegacyPackageMigration(packageName) {
  return LEGACY_PACKAGE_MIGRATION_BY_NAME.get(packageName) ?? null;
}

export function isLegacyBridgePackage(packageName) {
  return LEGACY_PACKAGE_MIGRATION_BY_NAME.has(packageName);
}
