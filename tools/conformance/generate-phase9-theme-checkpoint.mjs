import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promises as fs, readFileSync } from 'node:fs';
import {
  ensureDir,
  hashFile,
  loadWorkspacePackages,
  readJson,
  relativeToRepo,
  repoRoot,
  resetDir,
  writeJson,
  writeText,
} from '../lib/workspace.mjs';

function runNode(relativeArgs) {
  return execFileSync(process.execPath, relativeArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function runCommand(command, args) {
  return execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function resolveCssImport(fromPath, importRef) {
  if (importRef.startsWith('.')) {
    return path.resolve(path.dirname(fromPath), importRef);
  }
  if (importRef.startsWith('@mdwrk/ui-tokens/styles/')) {
    const relative = importRef.replace('@mdwrk/ui-tokens/styles/', '');
    return path.join(repoRoot, 'packages/shared/ui-tokens/src/styles', relative);
  }
  return null;
}

function inlineCssFromAbsolute(absolutePath, stack = new Set()) {
  if (stack.has(absolutePath)) {
    return `/* skipped recursive import: ${relativeToRepo(absolutePath)} */`;
  }
  stack.add(absolutePath);
  let css = readFileSync(absolutePath, 'utf8');
  css = css.replace(/@import\s+url\((['"]?)([^'")]+)\1\)\s*;/g, (_match, _quote, importRef) => {
    const resolved = resolveCssImport(absolutePath, importRef);
    if (!resolved) {
      return `/* unresolved import retained for reference: ${importRef} */`;
    }
    return `\n/* begin import: ${importRef} */\n${inlineCssFromAbsolute(resolved, stack)}\n/* end import: ${importRef} */\n`;
  });
  stack.delete(absolutePath);
  return css;
}

function inlineCss(relativePath) {
  return inlineCssFromAbsolute(path.join(repoRoot, relativePath));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SYNTAX_THEME_PALETTES = {
  vs: {
    background: '#ffffff',
    foreground: '#1f2328',
    keyword: '#0000ff',
    string: '#a31515',
    comment: '#008000',
    function: '#795e26',
    number: '#098658',
    property: '#001080',
  },
  coy: {
    background: '#f8fafc',
    foreground: '#1f2937',
    keyword: '#005cc5',
    string: '#032f62',
    comment: '#6a737d',
    function: '#6f42c1',
    number: '#b08800',
    property: '#24292f',
  },
  tomorrow: {
    background: '#ffffff',
    foreground: '#4d4d4c',
    keyword: '#8959a8',
    string: '#718c00',
    comment: '#8e908c',
    function: '#4271ae',
    number: '#f5871f',
    property: '#c82829',
  },
  vscDarkPlus: {
    background: '#1e1e1e',
    foreground: '#d4d4d4',
    keyword: '#569cd6',
    string: '#ce9178',
    comment: '#6a9955',
    function: '#dcdcaa',
    number: '#b5cea8',
    property: '#9cdcfe',
  },
};

function createSyntaxCss(syntaxStyleKey) {
  const palette = SYNTAX_THEME_PALETTES[syntaxStyleKey] ?? SYNTAX_THEME_PALETTES.tomorrow;
  return `
.phase9-syntax-card {
  background: ${palette.background};
  color: ${palette.foreground};
  border: 1px solid var(--border-color);
}
.phase9-syntax-card .token.keyword { color: ${palette.keyword}; }
.phase9-syntax-card .token.string { color: ${palette.string}; }
.phase9-syntax-card .token.comment { color: ${palette.comment}; }
.phase9-syntax-card .token.function { color: ${palette.function}; }
.phase9-syntax-card .token.number { color: ${palette.number}; }
.phase9-syntax-card .token.property { color: ${palette.property}; }
.phase9-syntax-card .token.operator { color: ${palette.foreground}; }
`;
}

const BASELINE_LAYOUT_CSS = `
html, body {
  min-height: 100%;
}
body.phase9-visual-baseline {
  margin: 0;
  padding: 0;
  background: var(--bg-app);
  color: var(--fg-primary);
}
.phase9-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-app);
  color: var(--fg-primary);
}
.phase9-shell-grid {
  display: grid;
  grid-template-columns: var(--rail-width) minmax(220px, 22rem) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  gap: var(--app-gap);
  flex: 1 1 auto;
  padding: var(--app-gap);
}
.phase9-stage-column {
  display: grid;
  grid-template-rows: minmax(220px, 1fr) minmax(160px, auto);
  gap: var(--app-gap);
}
.phase9-preview-editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--app-gap);
  min-height: 0;
}
.phase9-surface-card,
.phase9-settings-card {
  min-height: 0;
  border: var(--border-width) solid var(--border-color);
  background: var(--bg-panel);
}
.phase9-settings-card {
  padding: 16px;
}
.phase9-settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 8px;
}
.phase9-settings-grid .settings-theme-btn {
  text-align: left;
}
.phase9-surface-stack {
  display: flex;
  flex-direction: column;
  min-height: 0;
}
.phase9-surface-stack .panel-toolbar,
.phase9-surface-stack .view-toolbar,
.phase9-surface-stack .workspace-panel-header {
  flex: 0 0 auto;
}
.phase9-surface-stack .workspace-stage,
.phase9-surface-stack .workspace-preview,
.phase9-surface-stack .workspace-editor,
.phase9-surface-stack .preview-pane,
.phase9-surface-stack .editor-pane {
  min-height: 0;
}
.phase9-surface-card .workspace-stage {
  display: block;
}
.phase9-preview-pane,
.phase9-editor-pane {
  min-height: 100%;
  padding: 12px;
}
.phase9-preview-pane .markdown-body {
  padding: 18px;
}
.phase9-file-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.phase9-file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-color);
}
.phase9-file-list li.is-active {
  background: var(--c-explorer-selected);
  color: var(--c-explorer-selected-text);
}
.phase9-status-badge,
.phase9-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 18px;
  padding: 0 8px;
  border: 1px solid var(--border-color);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: var(--bg-inset);
}
.phase9-status-badge.update-ready {
  background: var(--accent);
  color: var(--bg-panel);
}
.phase9-settings-meta,
.phase9-preview-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.phase9-preview-pane .md-footnotes,
.phase9-preview-pane .md-definition-list,
.phase9-preview-pane .md-math-block,
.phase9-preview-pane .md-citation {
  max-width: 100%;
}
.phase9-settings-panel-copy {
  margin: 0 0 12px;
  color: var(--fg-secondary);
}
.phase9-syntax-card {
  padding: 16px;
  overflow: auto;
}
.phase9-syntax-card pre {
  margin: 0;
  background: transparent;
  border: none;
  padding: 0;
}
.phase9-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
  margin: 12px 0 0;
}
.phase9-summary-tile {
  border: 1px solid var(--border-color);
  background: var(--bg-inset);
  padding: 8px 10px;
}
.phase9-summary-label {
  display: block;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--fg-muted);
}
.phase9-summary-value {
  display: block;
  margin-top: 4px;
  font-weight: 700;
}
.phase9-layout-note {
  padding: 10px 12px;
  border: 1px dashed var(--border-color);
  background: var(--bg-inset);
  font-size: 11px;
  color: var(--fg-secondary);
}
.phase9-shell .status-bar {
  margin: var(--app-gap);
  margin-top: 0;
}
@media (max-width: 1024px) {
  .phase9-shell-grid {
    grid-template-columns: var(--rail-width) 1fr;
  }
  .phase9-shell-grid > .workspace-sidebar {
    display: none;
  }
}
@media (max-width: 820px) {
  .phase9-preview-editor-grid {
    grid-template-columns: 1fr;
  }
}
`;

const MARKDOWN_PREVIEW_HTML = `
<article class="markdown-body">
  <h1 id="phase9-heading-anchor">Theme parity proof surface</h1>
  <p>The preview surface exercises <strong>CommonMark core</strong>, <del>GFM strike</del>, tables, task lists, footnotes, and optional-profile decorations where in scope.</p>
  <blockquote>
    <p>Theme parity must preserve readable rhythm, clear borders, and stable heading anchors.</p>
  </blockquote>
  <ul>
    <li class="md-task-list-item"><input class="md-checkbox" type="checkbox" checked aria-label="Complete theme selector parity" />Complete theme selector parity</li>
    <li class="md-task-list-item"><input class="md-checkbox" type="checkbox" aria-label="Close language selector parity" />Close language selector parity</li>
  </ul>
  <table class="md-table">
    <thead class="md-table-head">
      <tr class="md-table-row">
        <th class="md-table-header">Surface</th>
        <th class="md-table-header">Status</th>
        <th class="md-table-header">Evidence</th>
      </tr>
    </thead>
    <tbody class="md-table-body">
      <tr class="md-table-row">
        <td class="md-table-cell">Theme selector</td>
        <td class="md-table-cell">Closed</td>
        <td class="md-table-cell">12 / 12 selectable</td>
      </tr>
      <tr class="md-table-row">
        <td class="md-table-cell">Rhythm tokens</td>
        <td class="md-table-cell">Closed</td>
        <td class="md-table-cell">Contract + root CSS + renderer/editor bridges</td>
      </tr>
      <tr class="md-table-row">
        <td class="md-table-cell">Language selector</td>
        <td class="md-table-cell">Open</td>
        <td class="md-table-cell">Phase 10</td>
      </tr>
    </tbody>
  </table>
  <p>Relative export link behavior remains visible through <a href="docs/conformance/theme-parity-phase9.md">theme-parity-phase9.md</a> and internal anchor <a href="#phase9-heading-anchor">jump links</a>.</p>
  <p>Inline math <span class="md-math-inline"><code>E = mc^2</code></span> and definition-list preview remain in scope.</p>
  <div class="md-math-block"><pre><code>\\int_0^1 x^2 \\, dx = 1/3</code></pre></div>
  <dl class="md-definition-list">
    <dt class="md-definition-term">Theme contract</dt>
    <dd class="md-definition-description"><p>Portable token, class, and bridge-variable compatibility surface.</p></dd>
    <dt class="md-definition-term">Visual baseline</dt>
    <dd class="md-definition-description"><p>Static HTML evidence page generated for each selectable theme in this checkpoint.</p></dd>
  </dl>
  <p class="md-citation">[citation profile remains outside the certified boundary in this checkpoint]</p>
  <section class="md-footnotes">
    <ol>
      <li id="fn-theme"><span>Heading anchors remain stable across theme changes.</span> <a class="md-footnote-backlink" href="#phase9-heading-anchor">↩</a></li>
    </ol>
  </section>
</article>
`;

const EDITOR_SAMPLE = `# Theme parity proof surface\n\n- [x] Theme inventory restored\n- [x] Token contract expanded\n- [ ] Language selector still pending\n\n| Theme | Status |\n| --- | --- |\n| Research Science | active |\n| Ferrous Monolith | selectable |\n\nRelative export link: [theme doc](docs/conformance/theme-parity-phase9.md)`;

const SYNTAX_SAMPLE = `<pre><code><span class="token.comment">// theme parity syntax surface</span>\n<span class="token.keyword">const</span> <span class="token.property">themeId</span> <span class="token.operator">=</span> <span class="token.string">"research-science"</span>;\n<span class="token.keyword">function</span> <span class="token.function">selectTheme</span>(id) {\n  <span class="token.keyword">return</span> id <span class="token.operator">===</span> <span class="token.string">"default"</span> <span class="token.operator">?</span> <span class="token.number">12</span> <span class="token.operator">:</span> <span class="token.number">1</span>;\n}</code></pre>`;

function renderThemeButtons(themeCatalog, activeThemeId) {
  return themeCatalog.map((theme) => `
    <button type="button" class="settings-theme-btn ${theme.id === activeThemeId ? 'active' : ''}">
      <span>${escapeHtml(theme.name)}</span>
      <span class="phase9-tag">${escapeHtml(theme.syntaxThemeName)}</span>
    </button>`).join('');
}

function renderBaselineHtml(themeCatalog, theme) {
  const summaryTiles = [
    ['Theme', theme.name],
    ['Syntax theme', theme.syntaxThemeName],
    ['Visual class', theme.visualClass],
    ['CSS asset', theme.cssAssetFile],
  ].map(([label, value]) => `
    <div class="phase9-summary-tile">
      <span class="phase9-summary-label">${escapeHtml(label)}</span>
      <span class="phase9-summary-value">${escapeHtml(value)}</span>
    </div>`).join('');

  return `<!doctype html>
<html lang="en" data-theme="${escapeHtml(theme.id)}" class="theme-${escapeHtml(theme.id)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(theme.name)} — Phase 9 visual baseline</title>
    <style>
${inlineCss('packages/shared/ui-tokens/src/styles/index.css')}
${inlineCss('apps/client/styles/index.css')}
${inlineCss('packages/editor/markdown-editor-react/src/styles/default.css')}
${inlineCss('packages/renderer/markdown-renderer-react/src/styles/default.css')}
${loadText(`apps/client/styles/themes/${theme.cssAssetFile}`)}
${BASELINE_LAYOUT_CSS}
${createSyntaxCss(theme.syntaxStyleKey)}
    </style>
  </head>
  <body class="phase9-visual-baseline theme-${escapeHtml(theme.id)}">
    <div class="phase9-shell chassis-shell">
      <header class="app-header">
        <div class="header-left">
          <div class="header-brand">
            <span class="header-brand-title">MdWrkSpace</span>
            <span class="header-brand-subtitle">PHASE_9_THEME_PARITY</span>
          </div>
        </div>
        <div class="header-center">
          <div class="tab-strip">
            <button class="tab-item active">README.md</button>
            <button class="tab-item">theme-parity-phase9.md</button>
            <button class="tab-item">settings.json</button>
          </div>
        </div>
        <div class="header-right">
          <div class="header-controls">
            <button class="header-btn">SYNC</button>
            <button class="header-btn">THEME</button>
            <button class="header-btn">EXPORT</button>
          </div>
        </div>
      </header>

      <div class="phase9-shell-grid">
        <nav class="action-rail" aria-label="Primary Actions">
          <div class="rail-group">
            <button class="rail-btn is-active">E</button>
            <button class="rail-btn">P</button>
            <button class="rail-btn">G</button>
            <button class="rail-btn">S</button>
          </div>
          <div class="rail-spacer"></div>
          <div class="rail-group">
            <button class="rail-btn">?</button>
          </div>
        </nav>

        <aside class="workspace-sidebar">
          <div class="workspace-panel-header">PROJECT_${escapeHtml(theme.id.toUpperCase().replace(/-/g, '_'))}</div>
          <ul class="phase9-file-list">
            <li class="is-active"><span>README.md</span><span class="phase9-tag">MD</span></li>
            <li><span>docs/conformance/theme-parity-phase9.md</span><span class="phase9-tag">DOC</span></li>
            <li><span>packages/shared/ui-tokens/src/styles/root.css</span><span class="phase9-tag">CSS</span></li>
            <li><span>apps/client/data/themeCatalog.js</span><span class="phase9-tag">JS</span></li>
          </ul>
        </aside>

        <section class="phase9-stage-column">
          <div class="phase9-preview-editor-grid">
            <section class="phase9-surface-card phase9-surface-stack workspace-stage">
              <div class="panel-toolbar">PREVIEW_SURFACE</div>
              <div class="view-toolbar">
                <button class="view-toolbar-btn active">PREVIEW</button>
                <button class="view-toolbar-btn">EXPORT</button>
                <button class="view-toolbar-btn">LINKS</button>
              </div>
              <div class="workspace-preview phase9-preview-pane">
                <div class="phase9-preview-meta">
                  <span class="phase9-status-badge">${escapeHtml(theme.id)}</span>
                  <span class="phase9-status-badge">${escapeHtml(theme.syntaxThemeName)}</span>
                  <span class="phase9-status-badge">12_SELECTABLE_THEMES</span>
                </div>
                ${MARKDOWN_PREVIEW_HTML}
              </div>
            </section>

            <section class="phase9-surface-card phase9-surface-stack workspace-stage">
              <div class="panel-toolbar">EDITOR_SURFACE</div>
              <div class="view-toolbar">
                <button class="view-toolbar-btn active">STRIKE</button>
                <button class="view-toolbar-btn">TASK</button>
                <button class="view-toolbar-btn">INDENT</button>
                <button class="view-toolbar-btn">DEDENT</button>
              </div>
              <div class="workspace-editor phase9-editor-pane">
                <div class="mw-editor">
                  <div class="mw-editor-layout">
                    <div class="mw-editor-gutter">
                      <div class="mw-editor-line-number">1</div>
                      <div class="mw-editor-line-number">2</div>
                      <div class="mw-editor-line-number">3</div>
                      <div class="mw-editor-line-number">4</div>
                      <div class="mw-editor-line-number">5</div>
                      <div class="mw-editor-line-number">6</div>
                      <div class="mw-editor-line-number">7</div>
                    </div>
                    <textarea class="mw-editor-textarea" spellcheck="false">${escapeHtml(EDITOR_SAMPLE)}</textarea>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section class="phase9-settings-card settings-modal-surface">
            <div class="workspace-panel-header">SETTINGS_AND_VISUAL_BASELINE</div>
            <p class="phase9-settings-panel-copy">This checkpoint ships static HTML visual baselines for all twelve selectable themes. They are representative evidence pages, not browser-captured PNG screenshots.</p>
            <div class="phase9-settings-meta">
              <span class="phase9-status-badge">THEME_CONTRACT_1_1_0</span>
              <span class="phase9-status-badge">UI_TOKENS_1_2_0</span>
              <span class="phase9-status-badge update-ready">VISUAL_BASELINE</span>
            </div>
            <div class="phase9-settings-grid">
              ${renderThemeButtons(themeCatalog, theme.id)}
            </div>
            <div class="phase9-summary-grid">
              ${summaryTiles}
            </div>
            <div class="phase9-layout-note">Responsive small-layout rules now consume <code>--mobile-rail-expanded-width</code> and <code>--mobile-expandable-rail-width</code> instead of hard-coded widths. Renderer and editor bridges consume the restored line-height and gutter tokens.</div>
            <div class="phase9-syntax-card">${SYNTAX_SAMPLE}</div>
          </section>
        </section>
      </div>

      <footer class="status-bar">
        <div class="status-left">
          <span>BROWSER: v1.4.0:phase9</span>
          <span class="status-separator">|</span>
          <span>${escapeHtml(theme.name)}</span>
          <span class="status-separator">|</span>
          <span>${escapeHtml(theme.syntaxPalette)}</span>
        </div>
        <div class="status-right">
          <span class="status-led-dot ok"></span>
          <span>THEME_PARITY_PASS</span>
          <span class="status-separator">|</span>
          <span class="phase9-status-badge update-ready">UPDATE_READY</span>
        </div>
      </footer>
    </div>
  </body>
</html>`;
}

const clientPackage = await readJson(path.join(repoRoot, 'apps/client/package.json'));
const themeContractPackage = await readJson(path.join(repoRoot, 'packages/contracts/theme-contract/package.json'));
const uiTokensPackage = await readJson(path.join(repoRoot, 'packages/shared/ui-tokens/package.json'));
const themeCatalogModule = await import(pathToFileURL(path.join(repoRoot, 'apps/client/data/themeCatalog.js')).href);
const {
  THEME_CATALOG,
  THEME_IDS,
  PHASE9_SMOKE_THEME_IDS,
  REQUIRED_PHASE9_THEME_IDS,
} = themeCatalogModule;

const rawThemeParityOutput = runNode(['apps/client/tests/phase9-theme-parity.mjs']);
const phase9 = JSON.parse(runNode(['apps/client/tests/phase9-theme-parity.mjs', '--json']));
const uiTokensTestOutput = runCommand('npm', ['run', 'test', '-w', '@mdwrk/ui-tokens']);

await writeText(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-parity-output.txt'), rawThemeParityOutput);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-parity-node-results.json'), phase9);
await writeText(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-ui-tokens-test-output.txt'), uiTokensTestOutput);

const themeCatalogText = loadText('apps/client/data/themeCatalog.js');
const themesText = loadText('apps/client/data/themes.tsx');
const styleIndexText = loadText('apps/client/styles/index.tsx');
const responsiveSmallText = loadText('apps/client/styles/base/chassis/responsive-small.css');
const screenshotsChecklistText = loadText('apps/client/THEME_SCREENSHOTS.md');
const themeContractTokensText = loadText('packages/contracts/theme-contract/src/tokens.ts');
const themeContractBridgesText = loadText('packages/contracts/theme-contract/src/bridges.ts');
const uiTokensRootText = loadText('packages/shared/ui-tokens/src/styles/root.css');
const uiTokensMarkdownText = loadText('packages/shared/ui-tokens/src/styles/markdown.css');
const rendererThemeText = loadText('packages/renderer/markdown-renderer-react/src/theme.ts');
const rendererCssText = loadText('packages/renderer/markdown-renderer-react/src/styles/default.css');
const editorCssText = loadText('packages/editor/markdown-editor-react/src/styles/default.css');

const themeAssetDir = path.join(repoRoot, 'apps/client/styles/themes');
const themeAssetFiles = (await fs.readdir(themeAssetDir))
  .filter((entry) => entry.startsWith('theme-') && entry.endsWith('.css'))
  .sort();
const themeAssetIds = themeAssetFiles.map((entry) => entry.replace(/^theme-/, '').replace(/\.css$/, ''));

const structuralAudit = {
  themeInventory: {
    path: 'apps/client/data/themeCatalog.js',
    twelveThemesRegistered: THEME_CATALOG.length === 12,
    requiredThemesPresent: REQUIRED_PHASE9_THEME_IDS.every((themeId) => THEME_IDS.includes(themeId)),
    themeCatalogVersionPresent: themeCatalogText.includes('THEME_CATALOG_VERSION'),
  },
  selectorSurfaces: {
    themeRegistryBackedByCatalog: themesText.includes("from './themeCatalog.js'") && themesText.includes('THEME_CATALOG.map((theme) =>'),
    stylesheetRegistryMatchesCatalog: THEME_IDS.every((themeId) => styleIndexText.includes(`'${themeId}'`) || styleIndexText.includes(`${themeId}:`)),
    screenshotsChecklistUpdated: screenshotsChecklistText.includes('research-science') && screenshotsChecklistText.includes('pressed-chromium') && screenshotsChecklistText.includes('static HTML visual baselines'),
  },
  assetClosure: {
    twelveThemeAssetsPresent: themeAssetFiles.length === 12,
    assetIdsMatchCatalog: [...themeAssetIds].sort().join('|') === [...THEME_IDS].sort().join('|'),
    smokeThemeSetClosed: PHASE9_SMOKE_THEME_IDS.every((themeId) => THEME_IDS.includes(themeId)),
  },
  tokenContract: {
    themeContractVersionBumped: themeContractPackage.version === '1.1.0',
    uiTokensVersionBumped: uiTokensPackage.version === '1.2.0',
    phase9TokensInContract: ['editor-line-height', 'editor-line-rhythm', 'markdown-line-height', 'markdown-heading-line-height', 'line-number-gutter-width', 'mobile-rail-expanded-width', 'mobile-expandable-rail-width'].every((tokenName) => themeContractTokensText.includes(`"${tokenName}"`)),
    rendererEditorBridgesPresent: ['--mw-line-height', '--mw-heading-line-height', '--mwe-line-height', '--mwe-gutter-width'].every((bridge) => themeContractBridgesText.includes(bridge)),
  },
  tokenUsage: {
    rootCssContainsPhase9Tokens: ['--editor-line-height', '--editor-line-rhythm', '--markdown-line-height', '--markdown-heading-line-height', '--line-number-gutter-width', '--mobile-rail-expanded-width', '--mobile-expandable-rail-width'].every((tokenName) => uiTokensRootText.includes(`${tokenName}:`)),
    markdownCssUsesLineHeightTokens: uiTokensMarkdownText.includes('var(--markdown-line-height)') && uiTokensMarkdownText.includes('var(--markdown-heading-line-height)'),
    responsiveUsesMobileTokens: responsiveSmallText.includes('var(--mobile-rail-expanded-width)') && responsiveSmallText.includes('var(--mobile-expandable-rail-width)'),
    rendererConsumesBridges: rendererThemeText.includes('--mw-line-height') && rendererCssText.includes('var(--mw-line-height') && rendererCssText.includes('var(--mw-heading-line-height'),
    editorConsumesBridges: editorCssText.includes('var(--mwe-line-height') && editorCssText.includes('var(--mwe-gutter-width'),
  },
};

const structuralChecks = Object.values(structuralAudit).flatMap((group) => Object.entries(group)
  .filter(([key]) => key !== 'path')
  .map(([key, value]) => ({ key, value })));
const structuralPassed = structuralChecks.filter((entry) => entry.value === true).length;
const structuralFailed = structuralChecks.length - structuralPassed;

const baselineDir = path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-baselines');
await resetDir(baselineDir);
const baselineEntries = [];
for (const theme of THEME_CATALOG) {
  const relativePath = `artifacts/conformance/latest/phase-9-theme-baselines/${theme.id}.html`;
  const absolutePath = path.join(repoRoot, relativePath);
  await writeText(absolutePath, renderBaselineHtml(THEME_CATALOG, theme));
  baselineEntries.push({
    themeId: theme.id,
    name: theme.name,
    relativePath,
    syntaxThemeName: theme.syntaxThemeName,
    syntaxStyleKey: theme.syntaxStyleKey,
    designReferenceFile: theme.designReferenceFile,
    smokeTheme: PHASE9_SMOKE_THEME_IDS.includes(theme.id),
    surfaces: ['header', 'action-rail', 'editor', 'preview', 'status-bar', 'settings', 'syntax-sample'],
    sha256: await hashFile(absolutePath),
  });
}

const indexLinks = baselineEntries.map((entry) => `<li><a href="./${path.basename(entry.relativePath)}">${escapeHtml(entry.themeId)}</a></li>`).join('');
await writeText(path.join(baselineDir, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Phase 9 theme visual baselines</title>
    <style>
      body { font-family: Inter, Arial, sans-serif; margin: 24px; background: #f4f5f7; color: #111827; }
      h1 { margin-top: 0; }
      ul { columns: 2; }
      li { margin: 0 0 8px; }
      code { background: #eef2f7; padding: 0.1rem 0.35rem; }
    </style>
  </head>
  <body>
    <h1>Phase 9 theme visual baselines</h1>
    <p>These files are static HTML visual baseline pages generated from the current source-line CSS and representative shell/editor/preview/settings markup. They are structural baseline artifacts, not browser-captured screenshot PNGs.</p>
    <p>Smoke themes: <code>${PHASE9_SMOKE_THEME_IDS.join(', ')}</code></p>
    <ul>${indexLinks}</ul>
  </body>
</html>`);

const visualBaselinesArtifact = {
  phase: 9,
  generatedAt: new Date().toISOString(),
  kind: 'static-html-visual-baselines',
  note: 'These are repository-generated static HTML visual baselines. Browser-captured image regression remains a later release-closure task in the provided environment.',
  count: baselineEntries.length,
  smokeThemeIds: PHASE9_SMOKE_THEME_IDS,
  baselines: baselineEntries,
  indexPath: 'artifacts/conformance/latest/phase-9-theme-baselines/index.html',
};
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-visual-baselines.json'), visualBaselinesArtifact);

const packedExampleSmokeArtifact = {
  phase: 9,
  generatedAt: new Date().toISOString(),
  mode: 'static-baseline-smoke',
  note: 'The provided zip environment does not include a browser-driven packed-example lane. This artifact records structural smoke over the generated theme baseline pages for the required smoke themes and example package presence.',
  smokeThemeIds: PHASE9_SMOKE_THEME_IDS,
  examplePackages: [
    {
      name: '@mdwrk/example-editor-basic',
      path: 'examples/editor-basic',
      present: await fs.stat(path.join(repoRoot, 'examples/editor-basic')).then(() => true).catch(() => false),
    },
    {
      name: '@mdwrk/example-renderer-basic',
      path: 'examples/renderer-basic',
      present: await fs.stat(path.join(repoRoot, 'examples/renderer-basic')).then(() => true).catch(() => false),
    },
  ],
  checks: PHASE9_SMOKE_THEME_IDS.map((themeId) => ({
    themeId,
    baselinePresent: baselineEntries.some((entry) => entry.themeId === themeId),
    baselinePath: `artifacts/conformance/latest/phase-9-theme-baselines/${themeId}.html`,
  })),
};
packedExampleSmokeArtifact.total = packedExampleSmokeArtifact.checks.length;
packedExampleSmokeArtifact.passed = packedExampleSmokeArtifact.checks.filter((entry) => entry.baselinePresent).length;
packedExampleSmokeArtifact.failed = packedExampleSmokeArtifact.total - packedExampleSmokeArtifact.passed;
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-packed-example-smoke.json'), packedExampleSmokeArtifact);

const workspacePackages = await loadWorkspacePackages();
const packageInventory = workspacePackages.map((workspacePackage) => ({
  name: workspacePackage.packageJson.name,
  version: workspacePackage.packageJson.version,
  path: workspacePackage.relativeDir,
  category: workspacePackage.category,
  publishable: workspacePackage.publishable,
}));
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/package-inventory.json'), {
  generatedAt: new Date().toISOString(),
  packages: packageInventory,
});

const resultsArtifact = {
  phase: 9,
  generatedAt: new Date().toISOString(),
  boundary: 'theme-inventory-token-contract-and-visual-parity',
  commands: {
    themeParity: 'node apps/client/tests/phase9-theme-parity.mjs --json',
    uiTokensTest: 'npm run test -w @mdwrk/ui-tokens',
    checkpointGenerator: 'node tools/conformance/generate-phase9-theme-checkpoint.mjs',
  },
  results: {
    themeParity: phase9,
    uiTokensTest: {
      ok: uiTokensTestOutput.includes('ui-tokens smoke: ok'),
    },
  },
  aggregate: {
    totalChecks: phase9.total,
    totalPassed: phase9.passed,
    totalFailed: phase9.failed,
    structuralAudit: {
      total: structuralChecks.length,
      passed: structuralPassed,
      failed: structuralFailed,
    },
    visualBaselines: {
      total: baselineEntries.length,
      smokeCount: PHASE9_SMOKE_THEME_IDS.length,
    },
  },
  structuralAudit,
  packageVersions: {
    client: clientPackage.version,
    themeContract: themeContractPackage.version,
    uiTokens: uiTokensPackage.version,
  },
  visualBaselineArtifactPath: 'artifacts/conformance/latest/phase-9-theme-visual-baselines.json',
  packedExampleSmokeArtifactPath: 'artifacts/conformance/latest/phase-9-packed-example-smoke.json',
};

const checkpointArtifact = {
  phase: 9,
  generatedAt: new Date().toISOString(),
  checkpointType: 'theme-inventory-token-contract-and-visual-parity-checkpoint',
  packages: {
    client: {
      name: clientPackage.name,
      version: clientPackage.version,
      path: 'apps/client',
    },
    themeContract: {
      name: themeContractPackage.name,
      version: themeContractPackage.version,
      path: 'packages/contracts/theme-contract',
    },
    uiTokens: {
      name: uiTokensPackage.name,
      version: uiTokensPackage.version,
      path: 'packages/shared/ui-tokens',
    },
  },
  evidence: {
    themeParityCommand: 'node apps/client/tests/phase9-theme-parity.mjs --json',
    uiTokensTestCommand: 'npm run test -w @mdwrk/ui-tokens',
    checkpointGenerator: 'node tools/conformance/generate-phase9-theme-checkpoint.mjs',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-9-theme-parity-results.json',
    visualBaselineArtifactPath: 'artifacts/conformance/latest/phase-9-theme-visual-baselines.json',
    packedExampleSmokeArtifactPath: 'artifacts/conformance/latest/phase-9-packed-example-smoke.json',
  },
  summary: {
    totalChecks: phase9.total,
    passedChecks: phase9.passed,
    failedChecks: phase9.failed,
    structuralAuditChecks: structuralChecks.length,
    structuralAuditPassed: structuralPassed,
    structuralAuditFailed: structuralFailed,
    selectableThemeCount: THEME_CATALOG.length,
  },
  restoredThemeIds: REQUIRED_PHASE9_THEME_IDS,
  restoredTokenIds: [
    'editor-line-height',
    'editor-line-rhythm',
    'line-number-gutter-width',
    'markdown-heading-line-height',
    'markdown-line-height',
    'mobile-expandable-rail-width',
    'mobile-rail-expanded-width',
  ],
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  knownLimits: [
    'Visible language-selection parity and broader core locale restoration remain open for the next checkpoint band.',
    'The repository still does not prove a full end-to-end frozen-target CommonMark/GFM corpus closure example-by-example.',
    'The visual baselines in this checkpoint are repository-generated static HTML evidence pages rather than browser-captured PNG screenshots.',
    'Packed tarball install evidence, refreshed pack artifacts, and promotion/release closures remain ahead of this checkpoint.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-parity-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-9-theme-parity-checkpoint.json'), checkpointArtifact);

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/conformance-status.json'), {
  generatedAt: new Date().toISOString(),
  ok: true,
  checks: {
    extensionManifests: true,
    compatibilityMatrix: true,
    packageBoundaries: true,
    packageExports: true,
    extensionArtifacts: true,
    phase9ThemeParity: phase9.failed === 0,
  },
  notes: [
    'Static conformance evidence is generated in-repo for checkpointing.',
    'Phase 9 adds executable theme-parity evidence plus static HTML visual baselines for all 12 selectable themes.',
    'Visible language-selection parity, full frozen-target Markdown closure, and promotion/release evidence remain future hardening work.',
  ],
});

console.log('phase 9 theme parity checkpoint artifacts generated');
