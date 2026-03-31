import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { readJson, repoRoot, writeJson } from '../lib/workspace.mjs';

function runNode(relativeArgs) {
  return execFileSync(process.execPath, relativeArgs, {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const rendererCorePackage = await readJson(path.join(repoRoot, 'packages/renderer/markdown-renderer-core/package.json'));
const rendererReactPackage = await readJson(path.join(repoRoot, 'packages/renderer/markdown-renderer-react/package.json'));
const clientPackage = await readJson(path.join(repoRoot, 'apps/client/package.json'));

const results = {
  rendererCoreSmoke: JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/run-smoke.mjs', '--json'])),
  rendererCoreCommonMark: JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/commonmark-core-corpus.mjs', '--json'])),
  rendererCoreGfm: JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs', '--json'])),
  rendererCoreOptional: JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json'])),
  rendererCorePreviewExport: JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs', '--json'])),
  rendererReactSmoke: JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/run-smoke.mjs', '--json'])),
  rendererReactGfm: JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/gfm-surface.mjs', '--json'])),
  rendererReactOptional: JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs', '--json'])),
  rendererReactPreviewExport: JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs', '--json'])),
  clientPreviewExport: JSON.parse(runNode(['apps/client/tests/phase6-preview-export-policy.mjs', '--json'])),
};

const engineText = loadText('packages/renderer/markdown-renderer-core/src/engine.ts');
const coreTypesText = loadText('packages/renderer/markdown-renderer-core/src/types.ts');
const rendererReactServerText = loadText('packages/renderer/markdown-renderer-react/src/server.tsx');
const workspaceRendererText = loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx');
const htmlExportText = loadText('apps/client/services/htmlExport.tsx');
const previewPolicyText = loadText('apps/client/services/markdownPreviewPolicy.js');
const previewPaneText = loadText('apps/client/components/Chassis/WorkPane/Stage/Preview.tsx');
const editorPaneText = loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx');
const clientTypecheckLog = loadText('artifacts/conformance/latest/phase-5-client-typecheck.txt');

const structuralAudit = {
  rendererCore: {
    path: 'packages/renderer/markdown-renderer-core/src/engine.ts',
    sanitizeModeTypePresent: coreTypesText.includes("'escape' | 'sanitize' | 'allow-trusted'"),
    sanitizeHtmlFragmentPresent: engineText.includes('function sanitizeHtmlFragment'),
    blockedInlineTagHandlingPresent: engineText.includes('getBlockedHtmlTagTokenInfo') && engineText.includes('blockedInlineTagStack'),
    unsafeUrlSanitizationPresent: engineText.includes('function sanitizeUrl') && engineText.includes('sanitizeUrl(node.url, "link")'),
    htmlHandlingDataAttributePresent: engineText.includes("'data-markdown-html-handling': withResolvedOptions.htmlHandling"),
    accessibleTaskSemanticsPresent: engineText.includes('aria-label="${escapeAttribute(checkboxLabel)}"') && engineText.includes('aria-checked="${node.checked ? "true" : "false"}"'),
    htmlSanitizeBranchPresent: engineText.includes("options.htmlHandling === 'sanitize'") || engineText.includes('options.htmlHandling === "sanitize"'),
  },
  rendererReact: {
    path: 'packages/renderer/markdown-renderer-react/src/server.tsx',
    serverUsesCoreRenderer: rendererReactServerText.includes('renderMarkdownToHtmlSync(markdown'),
    serverUsesCoreHtmlDocument: rendererReactServerText.includes('renderMarkdownToHtmlDocumentSync(markdown'),
  },
  workspaceMarkdownRenderer: {
    path: 'apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx',
    usesRendererPackage: workspaceRendererText.includes('<MarkdownRenderer'),
    normalizesEmptyListItems: workspaceRendererText.includes('normalizeEmptyListItemsForPreview(markdown)'),
    resolvesHtmlHandlingPolicy: workspaceRendererText.includes("resolveMarkdownHtmlHandlingMode(profileConfig, 'preview')"),
    policyAdvisoryPresent: workspaceRendererText.includes('PREVIEW_POLICY') && workspaceRendererText.includes('HTML_HANDLING:'),
    currentFileAware: workspaceRendererText.includes('readonly currentFile?: FileNode | null;') && workspaceRendererText.includes('currentFile = null'),
    internalLinkResolutionPresent: workspaceRendererText.includes('resolveInternalMarkdownHref(href, files, currentFile)'),
    pendingHashSupportPresent: workspaceRendererText.includes('mdwrk.pending-preview-hash.v1'),
  },
  htmlExport: {
    path: 'apps/client/services/htmlExport.tsx',
    usesRendererPackage: htmlExportText.includes('renderMarkdownToStaticHtml({'),
    normalizesEmptyListItems: htmlExportText.includes('normalizeEmptyListItemsForPreview(content)'),
    resolvesHtmlHandlingPolicy: htmlExportText.includes("resolveMarkdownHtmlHandlingMode(profileConfig, 'export')"),
    rewritesMarkdownLinks: htmlExportText.includes('rewriteRenderedMarkdownLinksForHtmlExport(renderedPreviewHtml)'),
    exportPolicyAdvisoryPresent: htmlExportText.includes('EXPORT_POLICY') && htmlExportText.includes('data-markdown-html-handling'),
  },
  previewPolicyHelpers: {
    path: 'apps/client/services/markdownPreviewPolicy.js',
    normalizationPresent: previewPolicyText.includes('export function normalizeEmptyListItemsForPreview'),
    htmlHandlingResolverPresent: previewPolicyText.includes('export function resolveMarkdownHtmlHandlingMode'),
    internalHrefResolverPresent: previewPolicyText.includes('export function resolveInternalMarkdownHref'),
    exportLinkRewritePresent: previewPolicyText.includes('export function rewriteRenderedMarkdownLinksForHtmlExport'),
    hashScrollPresent: previewPolicyText.includes('export function scrollPreviewHash'),
  },
  previewPane: {
    path: 'apps/client/components/Chassis/WorkPane/Stage/Preview.tsx',
    currentFilePropDeclared: previewPaneText.includes('currentFile?: FileNode | null;'),
    currentFilePropForwarded: previewPaneText.includes('currentFile={currentFile}'),
  },
  editorPane: {
    path: 'apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx',
    currentFileForwardedToPreview: editorPaneText.includes('currentFile={file}'),
  },
};

const structuralAuditChecks = Object.values(structuralAudit).flatMap((group) => Object.entries(group)
  .filter(([key]) => key !== 'path')
  .map(([key, value]) => ({ key, value })));
const structuralAuditPassed = structuralAuditChecks.filter((entry) => entry.value === true).length;
const structuralAuditFailed = structuralAuditChecks.length - structuralAuditPassed;

const totalChecks = Object.values(results).reduce((sum, summary) => sum + summary.total, 0);
const totalPassed = Object.values(results).reduce((sum, summary) => sum + summary.passed, 0);
const totalFailed = Object.values(results).reduce((sum, summary) => sum + summary.failed, 0);

const resultsArtifact = {
  phase: 6,
  generatedAt: new Date().toISOString(),
  boundary: 'preview-export-and-render-policy',
  commands: {
    rendererCoreSmoke: 'node packages/renderer/markdown-renderer-core/tests/run-smoke.mjs --json',
    rendererCoreCommonMark: 'node packages/renderer/markdown-renderer-core/tests/commonmark-core-corpus.mjs --json',
    rendererCoreGfm: 'node packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs --json',
    rendererCoreOptional: 'node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json',
    rendererCorePreviewExport: 'node packages/renderer/markdown-renderer-core/tests/preview-export-policy.mjs --json',
    rendererReactSmoke: 'node packages/renderer/markdown-renderer-react/tests/run-smoke.mjs --json',
    rendererReactGfm: 'node packages/renderer/markdown-renderer-react/tests/gfm-surface.mjs --json',
    rendererReactOptional: 'node packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs --json',
    rendererReactPreviewExport: 'node packages/renderer/markdown-renderer-react/tests/preview-export-policy.mjs --json',
    clientPreviewExport: 'node apps/client/tests/phase6-preview-export-policy.mjs --json',
  },
  results,
  aggregate: {
    totalChecks,
    totalPassed,
    totalFailed,
    structuralAudit: {
      total: structuralAuditChecks.length,
      passed: structuralAuditPassed,
      failed: structuralAuditFailed,
    },
  },
  structuralAudit,
  currentState: {
    clientTypecheckClosed: false,
    clientTypecheckArtifact: 'artifacts/conformance/latest/phase-5-client-typecheck.txt',
    clientTypecheckNotes: [
      'The client app still has unresolved external dependency/toolchain holes in the provided zip.',
      'The Phase 6 preview/export closures are source-complete and evidence-backed, but the overall app typecheck remains open because lucide-react, jszip, vitest, and ImportMeta.env declarations are not fully available in the provided checkpoint environment.',
      clientTypecheckLog.includes('showLineNumbers')
        ? 'The recorded app typecheck log still includes a showLineNumbers reference.'
        : 'No showLineNumbers-specific regression remains in the recorded app typecheck log from the earlier checkpoint.',
    ],
  },
};

const checkpointArtifact = {
  phase: 6,
  generatedAt: new Date().toISOString(),
  checkpointType: 'preview-export-and-render-policy-checkpoint',
  packages: {
    client: {
      name: clientPackage.name,
      version: clientPackage.version,
      path: 'apps/client',
    },
    rendererCore: {
      name: rendererCorePackage.name,
      version: rendererCorePackage.version,
      path: 'packages/renderer/markdown-renderer-core',
    },
    rendererReact: {
      name: rendererReactPackage.name,
      version: rendererReactPackage.version,
      path: 'packages/renderer/markdown-renderer-react',
    },
  },
  evidence: {
    rootRendererCommand: 'npm run test:renderer',
    clientPolicyCommand: 'node apps/client/tests/phase6-preview-export-policy.mjs --json',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-6-preview-export-results.json',
    auditedPaths: [
      structuralAudit.rendererCore.path,
      structuralAudit.rendererReact.path,
      structuralAudit.workspaceMarkdownRenderer.path,
      structuralAudit.htmlExport.path,
      structuralAudit.previewPolicyHelpers.path,
      structuralAudit.previewPane.path,
      structuralAudit.editorPane.path,
    ],
  },
  summary: {
    totalChecks,
    passedChecks: totalPassed,
    failedChecks: totalFailed,
    structuralAuditChecks: structuralAuditChecks.length,
    structuralAuditPassed,
    structuralAuditFailed,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    'explicit preview/export raw HTML policy modes in the reusable renderer family',
    'root-level html-handling audit attributes in rendered output',
    'restored empty-list-item normalization for preview/export parity',
    'internal Markdown link resolution and pending-hash navigation in the active preview shell',
    'HTML export rewriting for relative Markdown file links',
    'accessible task-checkbox semantics in preview markup',
    'preview/export advisory surfaces that make policy and boundary warnings visible',
  ],
  knownLimits: [
    'This checkpoint does not yet prove final frozen-target CommonMark/GFM closure example-by-example.',
    'Citations and markdown-in-html remain outside the currently certified optional-profile boundary even though structural support and warnings exist.',
    'Broader v1-to-v2 UIX parity gaps remain outside the Phase 6 boundary, especially Git/settings, theme exposure, language selection, and status/action-rail work.',
    'The provided zip still lacks some external app/example toolchain dependencies needed for full app-wide build/typecheck/test closure.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-6-preview-export-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-6-preview-export-checkpoint.json'), checkpointArtifact);

console.log('phase 6 preview/export checkpoint artifacts generated');
