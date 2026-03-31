import path from 'node:path';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import {
  THEME_CATALOG,
  THEME_IDS,
  REQUIRED_PHASE9_THEME_IDS,
  PHASE9_SMOKE_THEME_IDS,
} from '../data/themeCatalog.js';

const repoRoot = path.resolve(new URL('../../..', import.meta.url).pathname);

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function themeCssFileToId(filename) {
  return filename.replace(/^theme-/, '').replace(/\.css$/, '');
}

const themesText = loadText('apps/client/data/themes.tsx');
const themeStylesText = loadText('apps/client/styles/index.tsx');
const projectSelectorText = loadText('apps/client/components/Project/ProjectSelector.tsx');
const settingsVisualText = loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const themeServiceText = loadText('apps/client/services/themeService.ts');
const htmlExportText = loadText('apps/client/services/htmlExport.tsx');
const responsiveSmallText = loadText('apps/client/styles/base/chassis/responsive-small.css');
const contractTokensText = loadText('packages/contracts/theme-contract/src/tokens.ts');
const contractBridgesText = loadText('packages/contracts/theme-contract/src/bridges.ts');
const uiRootCssText = loadText('packages/shared/ui-tokens/src/styles/root.css');
const uiMarkdownCssText = loadText('packages/shared/ui-tokens/src/styles/markdown.css');
const uiTokensSmokeText = loadText('packages/shared/ui-tokens/tests/run-smoke.mjs');
const rendererThemeText = loadText('packages/renderer/markdown-renderer-react/src/theme.ts');
const rendererTypesText = loadText('packages/renderer/markdown-renderer-react/src/types.ts');
const rendererCssText = loadText('packages/renderer/markdown-renderer-react/src/styles/default.css');
const editorCssText = loadText('packages/editor/markdown-editor-react/src/styles/default.css');

const themeAssetDir = path.join(repoRoot, 'apps/client/styles/themes');
const themeAssetFiles = readdirSync(themeAssetDir)
  .filter((entry) => entry.startsWith('theme-') && entry.endsWith('.css'))
  .sort();
const themeAssetIds = themeAssetFiles.map(themeCssFileToId);
const designReferenceDir = path.join(repoRoot, 'apps/client/html_theme_examples');

const uniqueThemeIds = new Set(THEME_IDS);

const requiredTokens = [
  'editor-line-height',
  'editor-line-rhythm',
  'line-number-gutter-width',
  'markdown-heading-line-height',
  'markdown-line-height',
  'mobile-expandable-rail-width',
  'mobile-rail-expanded-width',
];

const requiredThemeChecks = REQUIRED_PHASE9_THEME_IDS.map((themeId) => ({
  id: `theme.required.${themeId}`,
  pass:
    THEME_IDS.includes(themeId)
    && themeStylesText.includes(`'${themeId}':`)
    && themeAssetIds.includes(themeId),
}));

const tokenContractChecks = requiredTokens.map((tokenName) => ({
  id: `token.contract.${tokenName}`,
  pass:
    contractTokensText.includes(`"${tokenName}"`)
    && contractTokensText.includes(`cssCustomProperty: "--${tokenName}"`),
}));

const tokenRootChecks = requiredTokens.map((tokenName) => ({
  id: `token.root-css.${tokenName}`,
  pass: uiRootCssText.includes(`--${tokenName}:`),
}));

const designReferenceChecks = THEME_CATALOG
  .filter((theme) => theme.designReferenceFile)
  .map((theme) => ({
    id: `theme.design-reference.${theme.id}`,
    pass: existsSync(path.join(designReferenceDir, theme.designReferenceFile)),
  }));

const checks = [
  {
    id: 'theme.catalog.count.12',
    pass: THEME_CATALOG.length === 12,
  },
  {
    id: 'theme.catalog.unique-ids',
    pass: uniqueThemeIds.size === THEME_CATALOG.length,
  },
  {
    id: 'theme.catalog.metadata-version-present',
    pass: loadText('apps/client/data/themeCatalog.js').includes('THEME_CATALOG_VERSION'),
  },
  {
    id: 'theme.registry.tsx.uses-theme-catalog',
    pass: themesText.includes("from './themeCatalog.js'") && themesText.includes('THEME_CATALOG.map((theme) =>'),
  },
  {
    id: 'theme.selector.project-surface-uses-themes',
    pass: projectSelectorText.includes('THEMES.length') && projectSelectorText.includes('{THEMES.map(theme => ('),
  },
  {
    id: 'theme.selector.settings-surface-uses-themes',
    pass: settingsVisualText.includes('{THEMES.map((theme) => (') && settingsVisualText.includes('ACTIVE_THEME'),
  },
  {
    id: 'theme.stylesheet-registry.count.12',
    pass: THEME_IDS.every((themeId) => new RegExp(`[\\'\\"]?${themeId}[\\'\\"]?:`).test(themeStylesText)) && THEME_IDS.length === 12,
  },
  {
    id: 'theme.assets.count.12',
    pass: themeAssetIds.length === 12,
  },
  {
    id: 'theme.assets.match-catalog',
    pass: [...themeAssetIds].sort().join('|') === [...THEME_IDS].sort().join('|'),
  },
  {
    id: 'theme.service.supports-all-registered-themes',
    pass: themeServiceText.includes('THEME_STYLESHEET_TEXT[themeId] ? themeId : DEFAULT_THEME_ID') && themeServiceText.includes('const themeDef = THEMES.find'),
  },
  {
    id: 'theme.export.supports-all-registered-themes',
    pass: htmlExportText.includes('THEME_STYLESHEET_TEXT[theme] || THEME_STYLESHEET_TEXT.default'),
  },
  {
    id: 'theme.responsive-mobile-tokens-used',
    pass: responsiveSmallText.includes('var(--mobile-rail-expanded-width)') && responsiveSmallText.includes('var(--mobile-expandable-rail-width)'),
  },
  {
    id: 'bridge.renderer.line-height-contract',
    pass: contractBridgesText.includes('--mw-line-height') && contractBridgesText.includes('--mw-heading-line-height'),
  },
  {
    id: 'bridge.editor.line-height-and-gutter-contract',
    pass: contractBridgesText.includes('--mwe-line-height') && contractBridgesText.includes('--mwe-gutter-width'),
  },
  {
    id: 'renderer.theme-helper.exposes-line-height',
    pass: rendererTypesText.includes('readonly lineHeight?: string;')
      && rendererTypesText.includes('readonly headingLineHeight?: string;')
      && rendererThemeText.includes('["--mw-line-height" as any]')
      && rendererThemeText.includes('["--mw-heading-line-height" as any]'),
  },
  {
    id: 'renderer.styles.consume-bridge-line-heights',
    pass: rendererCssText.includes('var(--mw-line-height') && rendererCssText.includes('var(--mw-heading-line-height'),
  },
  {
    id: 'editor.styles.consume-gutter-and-line-height-bridges',
    pass: editorCssText.includes('var(--mwe-gutter-width') && editorCssText.includes('var(--mwe-line-height'),
  },
  {
    id: 'ui-tokens.smoke.covers-phase9-tokens',
    pass: uiTokensSmokeText.includes('requiredPhase9Tokens') && uiTokensSmokeText.includes('--mwe-gutter-width') && uiTokensSmokeText.includes('--mw-line-height'),
  },
  {
    id: 'markdown.css.uses-markdown-line-height-tokens',
    pass: uiMarkdownCssText.includes('line-height: var(--markdown-line-height);') && uiMarkdownCssText.includes('line-height: var(--markdown-heading-line-height);'),
  },
  {
    id: 'phase9.smoke-theme-ids.present',
    pass: PHASE9_SMOKE_THEME_IDS.every((themeId) => THEME_IDS.includes(themeId)),
  },
  ...requiredThemeChecks,
  ...tokenContractChecks,
  ...tokenRootChecks,
  ...designReferenceChecks,
];

const result = {
  phase: 9,
  generatedAt: new Date().toISOString(),
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  themeCatalog: {
    count: THEME_CATALOG.length,
    ids: THEME_IDS,
    smokeThemeIds: PHASE9_SMOKE_THEME_IDS,
  },
  checks,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2));
} else {
  console.log(`phase9 theme parity: ${result.passed}/${result.total} passed`);
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
}
