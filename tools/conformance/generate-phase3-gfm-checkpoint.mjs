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

const rendererCoreGfm = JSON.parse(runNode(['packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs', '--json']));
const rendererReactGfm = JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/gfm-surface.mjs', '--json']));
const rendererReactSmoke = JSON.parse(runNode(['packages/renderer/markdown-renderer-react/tests/run-smoke.mjs', '--json']));
const editorCoreSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-core/tests/run-smoke.mjs', '--json']));
const editorReactSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-react/tests/run-smoke.mjs', '--json']));

const appAdapterAudit = {
  workspaceMarkdownRenderer: {
    path: 'apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx',
    profileWiredToDefaultGfm: loadText('apps/client/components/Markdown/WorkspaceMarkdownRenderer.tsx').includes('profile="gfm-default"'),
  },
  htmlExport: {
    path: 'apps/client/services/htmlExport.tsx',
    profileWiredToDefaultGfm: loadText('apps/client/services/htmlExport.tsx').includes('profile: "gfm-default"'),
  },
  editorPaneToolbar: {
    path: 'apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx',
    taskListToolbarActionPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes("runCommand('task-list')"),
    taskListIconPresent: loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx').includes('ListChecks'),
  },
};

const exampleAudit = {
  rendererBasic: {
    path: 'examples/renderer-basic/App.tsx',
    showsTaskLists: loadText('examples/renderer-basic/App.tsx').includes('- [x]'),
    showsStrikethrough: loadText('examples/renderer-basic/App.tsx').includes('~~'),
    showsTables: loadText('examples/renderer-basic/App.tsx').includes('| Package | Responsibility | Status |'),
    showsAutolinkLiteral: loadText('examples/renderer-basic/App.tsx').includes('https://example.com') || loadText('examples/renderer-basic/App.tsx').includes('docs@example.com'),
  },
  editorBasic: {
    path: 'examples/editor-basic/App.tsx',
    taskButtonPresent: loadText('examples/editor-basic/App.tsx').includes("'task-list'"),
    previewProfileWiredToDefaultGfm: loadText('examples/editor-basic/App.tsx').includes('profile="gfm-default"'),
  },
};

const resultSummaries = {
  rendererCoreGfmDefault: rendererCoreGfm,
  rendererReactGfmSurface: rendererReactGfm,
  rendererReactSmoke,
  editorCoreSmoke,
  editorReactSmoke,
};

const totalChecks = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.total, 0);
const totalPassed = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.passed, 0);
const totalFailed = Object.values(resultSummaries).reduce((sum, summary) => sum + summary.failed, 0);

const defaultFeatureFamilies = profileMatrix.targets.defaultProfile.featureFamilies;

const resultsArtifact = {
  phase: 3,
  generatedAt: new Date().toISOString(),
  profile: 'gfm-default',
  defaultFeatureFamilies,
  commands: {
    rendererCoreGfmDefault: 'node packages/renderer/markdown-renderer-core/tests/gfm-default-profile.mjs --json',
    rendererReactGfmSurface: 'node packages/renderer/markdown-renderer-react/tests/gfm-surface.mjs --json',
    rendererReactSmoke: 'node packages/renderer/markdown-renderer-react/tests/run-smoke.mjs --json',
    editorCoreSmoke: 'node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json',
    editorReactSmoke: 'node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json',
  },
  results: resultSummaries,
  aggregate: {
    totalChecks,
    totalPassed,
    totalFailed,
  },
  appAdapterAudit,
  exampleAudit,
};

const checkpointArtifact = {
  phase: 3,
  generatedAt: new Date().toISOString(),
  checkpointType: 'default-gfm-profile-checkpoint',
  defaultProfile: {
    id: 'gfm-default',
    specReference: 'GitHub Flavored Markdown 0.29-gfm on top of CommonMark 0.31.2',
    enabledByDefaultFeatures: defaultFeatureFamilies,
  },
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
  evidence: {
    namedTestLane: 'npm run test:renderer:gfm',
    rendererPackageCommand: 'npm run test -w @mdwrk/markdown-renderer-react',
    editorCoreCommand: 'npm run test -w @mdwrk/markdown-editor-core',
    editorReactCommand: 'npm run test -w @mdwrk/markdown-editor-react',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-3-gfm-default-profile-results.json',
    appAdapterPaths: [
      appAdapterAudit.workspaceMarkdownRenderer.path,
      appAdapterAudit.htmlExport.path,
      appAdapterAudit.editorPaneToolbar.path,
    ],
  },
  summary: {
    totalChecks,
    totalPassed,
    totalFailed,
    rendererCoreGfmCases: rendererCoreGfm.total,
    rendererReactGfmChecks: rendererReactGfm.total,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    'default GFM profile activation in renderer core and React renderer',
    'GFM tables with alignment metadata and stable HTML output',
    'GFM task list items with preview classes and checkbox semantics',
    'GFM strikethrough rendering through <del>',
    'GFM autolink literal rendering for URL, www, and email forms',
    'default-GFM export/document pipeline propagation',
    'editor-core task-list command for source authoring',
    'client and example wrapper alignment to the default GFM profile',
  ],
  knownLimits: [
    'This checkpoint does not yet prove full frozen-target GFM corpus closure.',
    'Clipboard and browser-native paste behavior for complex tables are not yet separately certified in a browser lane.',
    'The provided zip still lacks some external app/example toolchain dependencies needed for full app-wide build/typecheck/test closure.',
    'Broader v1-to-v2 UIX parity gaps remain outside the Phase 3 boundary.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-3-gfm-default-profile-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-3-gfm-default-profile-checkpoint.json'), checkpointArtifact);

console.log('phase 3 GFM default profile checkpoint artifacts generated');
