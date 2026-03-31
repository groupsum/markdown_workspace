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
const editorCorePackage = await readJson(path.join(repoRoot, 'packages/editor/markdown-editor-core/package.json'));
const editorReactPackage = await readJson(path.join(repoRoot, 'packages/editor/markdown-editor-react/package.json'));
const profileMatrix = await readJson(path.join(repoRoot, 'docs/conformance/markdown-profile-matrix.json'));

const rendererCoreOptional = JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs', '--json']));
const rendererReactOptional = JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs', '--json']));
const editorCoreSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-core/tests/run-smoke.mjs', '--json']));
const editorReactSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-react/tests/run-smoke.mjs', '--json']));

const appAudit = {
  workspaceMarkdownRenderer: {
    path: 'apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx',
    profileConfigHookPresent: loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx').includes('useMarkdownProfileConfig'),
    extensionsPropWired: loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx').includes('extensions={profileConfig.enabledExtensions}'),
    trustedHtmlPreviewWired: loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx').includes("profileConfig.trustedHtmlPreview ? 'allow-trusted' : 'escape'"),
    previewWarningsPresent: loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx').includes('PROFILE_WARNINGS'),
  },
  htmlExport: {
    path: 'apps/client/services/htmlExport.tsx',
    profileConfigReadPresent: loadText('apps/client/services/htmlExport.tsx').includes('readStoredMarkdownProfileConfigSync'),
    extensionsPropWired: loadText('apps/client/services/htmlExport.tsx').includes('extensions: profileConfig.enabledExtensions'),
    trustedHtmlExportWired: loadText('apps/client/services/htmlExport.tsx').includes("profileConfig.trustedHtmlPreview ? 'allow-trusted' : 'escape'"),
    exportWarningsPresent: loadText('apps/client/services/htmlExport.tsx').includes('export-advisory'),
  },
  settingsPanel: {
    path: 'apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx',
    settingsPanelExists: loadText('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx').includes('MarkdownProfileSettingsPanel'),
    inScopeSectionPresent: loadText('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx').includes('CERTIFIED_OPTIONAL_PROFILES'),
    experimentalSectionPresent: loadText('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx').includes('EXPERIMENTAL_OR_OUT_OF_BOUNDARY'),
    trustedHtmlTogglePresent: loadText('apps/client/src/features/markdownProfiles/MarkdownProfileSettingsPanel.tsx').includes('TRUSTED_HTML_PREVIEW_AND_EXPORT'),
  },
  settingsRegistration: {
    path: 'apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx',
    markdownProfilesSectionRegistered: loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx').includes("id: 'core.settings.markdown-profiles'"),
    markdownProfilesTitleRegistered: loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx').includes("'core.markdown-profiles.title'"),
  },
  editorPane: {
    path: 'apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx',
    inlineMathToolbarActionPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes("runCommand('inline-math')"),
    footnoteToolbarActionPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes("runCommand('footnote')"),
    superscriptToolbarActionPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes("runCommand('superscript')"),
    subscriptToolbarActionPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes("runCommand('subscript')"),
  },
};

const exampleAudit = {
  rendererBasic: {
    path: 'examples/renderer-basic/App.tsx',
    optionalExtensionsWired: loadText('examples/renderer-basic/App.tsx').includes('extensions={extensions}'),
    showsDefinitionList: loadText('examples/renderer-basic/App.tsx').includes(': Definition list support can be enabled per profile.'),
    showsMath: loadText('examples/renderer-basic/App.tsx').includes('Equation: $E=mc^2$'),
    showsFootnote: loadText('examples/renderer-basic/App.tsx').includes('[^1]'),
  },
  editorBasic: {
    path: 'examples/editor-basic/App.tsx',
    previewExtensionsWired: loadText('examples/editor-basic/App.tsx').includes('extensions={optionalExtensions}'),
    inlineMathButtonPresent: loadText('examples/editor-basic/App.tsx').includes("'inline-math'"),
    footnoteButtonPresent: loadText('examples/editor-basic/App.tsx').includes("'footnote'"),
  },
};

const profileStatusMatrix = profileMatrix.profiles.map((profile) => ({
  id: profile.id,
  name: profile.name,
  enabledByDefault: profile.enabledByDefault,
  certificationBoundaryStatus: profile.certificationBoundaryStatus ?? null,
  toggleable: profile.toggleable ?? null,
  implementedSurfaces: profile.implementedSurfaces ?? [],
}));

const resultSummaries = {
  rendererCoreOptionalProfiles: rendererCoreOptional,
  rendererReactOptionalProfiles: rendererReactOptional,
  editorCoreSmoke,
  editorReactSmoke,
};

const totalChecks = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.total, 0);
const totalPassed = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.passed, 0);
const totalFailed = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.failed, 0);

const resultsArtifact = {
  phase: 4,
  generatedAt: new Date().toISOString(),
  boundary: 'optional-profiles',
  commands: {
    rendererCoreOptionalProfiles: 'node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json',
    rendererReactOptionalProfiles: 'node packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs --json',
    editorCoreSmoke: 'node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json',
    editorReactSmoke: 'node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json',
  },
  results: resultSummaries,
  aggregate: {
    totalChecks,
    totalPassed,
    totalFailed,
  },
  appAudit,
  exampleAudit,
  profileStatusMatrix,
};

const checkpointArtifact = {
  phase: 4,
  generatedAt: new Date().toISOString(),
  checkpointType: 'optional-profile-boundary-checkpoint',
  packages: {
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
    editorCore: {
      name: editorCorePackage.name,
      version: editorCorePackage.version,
      path: 'packages/editor/markdown-editor-core',
    },
    editorReact: {
      name: editorReactPackage.name,
      version: editorReactPackage.version,
      path: 'packages/editor/markdown-editor-react',
    },
  },
  optionalProfiles: {
    inScope: profileStatusMatrix.filter((profile) => profile.certificationBoundaryStatus === 'in-scope').map((profile) => profile.id),
    outOfScope: profileStatusMatrix.filter((profile) => profile.certificationBoundaryStatus === 'out-of-scope').map((profile) => profile.id),
  },
  evidence: {
    rendererCoreOptionalCommand: 'node packages/renderer/markdown-renderer-core/tests/optional-profiles.mjs --json',
    rendererReactOptionalCommand: 'node packages/renderer/markdown-renderer-react/tests/optional-profile-surface.mjs --json',
    editorCoreCommand: 'node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json',
    editorReactCommand: 'node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-4-optional-profiles-results.json',
    appPaths: [
      appAudit.workspaceMarkdownRenderer.path,
      appAudit.htmlExport.path,
      appAudit.settingsPanel.path,
      appAudit.settingsRegistration.path,
      appAudit.editorPane.path,
    ],
  },
  summary: {
    totalChecks,
    totalPassed,
    totalFailed,
    rendererCoreOptionalCases: rendererCoreOptional.total,
    rendererReactOptionalChecks: rendererReactOptional.total,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    'named optional-profile registry in the renderer core',
    'policy-aware front matter, footnotes, definition lists, math, superscript, subscript, and smart punctuation rendering',
    'experimental citations and markdown-in-html warnings with explicit out-of-boundary status',
    'React renderer and static-document propagation for optional profiles',
    'editor-core optional-profile command surface',
    'client settings, preview, export, and toolbar alignment for optional profiles',
  ],
  knownLimits: [
    'This checkpoint does not yet prove final frozen-target CommonMark/GFM closure example-by-example.',
    'Citations remain outside the certified optional-profile boundary because bibliography resolution is not implemented.',
    'Markdown-in-html remains outside the certified optional-profile boundary because it depends on trusted HTML policy and is still experimental.',
    'Broader v1-to-v2 UIX parity gaps remain outside the Phase 4 boundary.',
    'The provided zip still lacks some external app/example toolchain dependencies needed for full app-wide build/typecheck/test closure.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-4-optional-profiles-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-4-optional-profiles-checkpoint.json'), checkpointArtifact);

console.log('phase 4 optional profile checkpoint artifacts generated');
