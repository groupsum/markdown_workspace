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

const editorCorePackage = await readJson(path.join(repoRoot, 'packages/editor/markdown-editor-core/package.json'));
const editorReactPackage = await readJson(path.join(repoRoot, 'packages/editor/markdown-editor-react/package.json'));
const uiTokensPackage = await readJson(path.join(repoRoot, 'packages/shared/ui-tokens/package.json'));
const clientPackage = await readJson(path.join(repoRoot, 'apps/client/package.json'));

const editorCoreSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-core/tests/run-smoke.mjs', '--json']));
const editorReactSmoke = JSON.parse(runNode(['packages/editor/markdown-editor-react/tests/run-smoke.mjs', '--json']));

const editorPanePath = 'apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx';
const workPanePath = 'apps/client/components/Chassis/WorkPane/WorkPane.tsx';
const appShellPath = 'apps/client/src/shell/AppShell.tsx';
const uiStatePath = 'apps/client/hooks/useUIState.ts';
const useAppPath = 'apps/client/hooks/useApp.ts';
const settingsPath = 'apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx';
const uiEditorCssPath = 'apps/client/styles/base/ui-editor.css';
const uiTokensRootPath = 'packages/shared/ui-tokens/src/styles/root.css';
const uiTokensMarkdownPath = 'packages/shared/ui-tokens/src/styles/markdown.css';
const examplePath = 'examples/editor-basic/App.tsx';

const editorPane = loadText(editorPanePath);
const workPane = loadText(workPanePath);
const appShell = loadText(appShellPath);
const uiState = loadText(uiStatePath);
const useApp = loadText(useAppPath);
const settings = loadText(settingsPath);
const uiEditorCss = loadText(uiEditorCssPath);
const uiTokensRoot = loadText(uiTokensRootPath);
const uiTokensMarkdown = loadText(uiTokensMarkdownPath);
const exampleText = loadText(examplePath);
const clientTypecheckLog = loadText('artifacts/conformance/latest/phase-5-client-typecheck.txt');

const appAudit = {
  editorPane: {
    path: editorPanePath,
    bulletListToolbarActionPresent: editorPane.includes("runCommand('bullet-list')"),
    taskListToolbarActionPresent: editorPane.includes("runCommand('task-list')"),
    indentToolbarActionPresent: editorPane.includes("runCommand('indent')"),
    outdentToolbarActionPresent: editorPane.includes("runCommand('outdent')"),
    selectionStateWired: editorPane.includes('onSelectionFormatChange={setSelectionState}'),
    lineNumbersPropWired: editorPane.includes('showLineNumbers={showLineNumbers}'),
    activeBoldClassPresent: editorPane.includes("selectionState.bold ? 'active' : ''"),
    activeItalicClassPresent: editorPane.includes("selectionState.italic ? 'active' : ''"),
    activeStrikeClassPresent: editorPane.includes("selectionState.strikethrough ? 'active' : ''"),
    activeBulletClassPresent: editorPane.includes("selectionState.bulletList ? 'active' : ''"),
    activeTaskClassPresent: editorPane.includes("selectionState.taskList ? 'active' : ''"),
  },
  workPane: {
    path: workPanePath,
    propDeclared: workPane.includes('showLineNumbers: boolean;'),
    propForwarded: workPane.includes('showLineNumbers={showLineNumbers}'),
  },
  appShell: {
    path: appShellPath,
    showLineNumbersPropPassed: appShell.includes('showLineNumbers={state.showLineNumbers}'),
  },
  uiState: {
    path: uiStatePath,
    stateFieldPresent: uiState.includes('showLineNumbers: boolean;'),
    localStoragePersisted: uiState.includes('showLineNumbers,') && uiState.includes('JSON.stringify(payload)'),
    indexedDbRestorePresent: uiState.includes("typeof storedState.showLineNumbers === 'boolean'"),
  },
  useApp: {
    path: useAppPath,
    sessionStateFieldPresent: useApp.includes('showLineNumbers: boolean;'),
    restorePresent: useApp.includes("typeof storedSession.showLineNumbers === 'boolean'"),
    persistPresent: useApp.includes('showLineNumbers: ui.showLineNumbers,'),
    stateExposurePresent: useApp.includes('showLineNumbers: ui.showLineNumbers,'),
    actionExposurePresent: useApp.includes('setShowLineNumbers: ui.setShowLineNumbers,'),
  },
  settings: {
    path: settingsPath,
    lineNumbersCardPresent: settings.includes('LINE_NUMBERS'),
    lineNumbersToggleWired: settings.includes('snapshot.app.actions.setShowLineNumbers(event.target.checked)'),
  },
  uiEditorCss: {
    path: uiEditorCssPath,
    gutterWidthTokenPresent: uiEditorCss.includes('var(--line-number-gutter-width)'),
    gutterRhythmPresent: uiEditorCss.includes('var(--editor-line-rhythm)'),
    textareaRhythmPresent: uiEditorCss.includes('line-height: var(--editor-line-rhythm);'),
  },
  uiTokens: {
    rootPath: uiTokensRootPath,
    markdownPath: uiTokensMarkdownPath,
    editorLineHeightPresent: uiTokensRoot.includes('--editor-line-height'),
    editorLineRhythmPresent: uiTokensRoot.includes('--editor-line-rhythm'),
    markdownLineHeightPresent: uiTokensRoot.includes('--markdown-line-height'),
    markdownHeadingLineHeightPresent: uiTokensRoot.includes('--markdown-heading-line-height'),
    lineNumberGutterWidthPresent: uiTokensRoot.includes('--line-number-gutter-width'),
    markdownBodyUsesToken: uiTokensMarkdown.includes('line-height: var(--markdown-line-height);'),
    headingUsesToken: uiTokensMarkdown.includes('line-height: var(--markdown-heading-line-height);'),
  },
  example: {
    path: examplePath,
    bulletButtonPresent: exampleText.includes("executeCommand('bullet-list')"),
    taskButtonPresent: exampleText.includes("executeCommand('task-list')"),
    indentButtonPresent: exampleText.includes("executeCommand('indent')"),
    outdentButtonPresent: exampleText.includes("executeCommand('outdent')"),
    lineNumbersTogglePresent: exampleText.includes('Line numbers'),
    editorPropWired: exampleText.includes('showLineNumbers={showLineNumbers}'),
  },
};

const structuralAuditChecks = Object.values(appAudit).flatMap((group) => Object.entries(group)
  .filter(([key]) => key !== 'path' && key !== 'rootPath' && key !== 'markdownPath')
  .map(([key, value]) => ({ key, value })),
);
const structuralAuditPassed = structuralAuditChecks.filter((entry) => entry.value === true).length;
const structuralAuditFailed = structuralAuditChecks.length - structuralAuditPassed;

const resultsArtifact = {
  phase: 5,
  generatedAt: new Date().toISOString(),
  boundary: 'editor-semantics-and-authoring-ux',
  commands: {
    editorCoreSmoke: 'node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json',
    editorReactSmoke: 'node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json',
  },
  results: {
    editorCoreSmoke,
    editorReactSmoke,
  },
  aggregate: {
    testChecks: {
      total: editorCoreSmoke.total + editorReactSmoke.total,
      passed: editorCoreSmoke.passed + editorReactSmoke.passed,
      failed: editorCoreSmoke.failed + editorReactSmoke.failed,
    },
    structuralAudit: {
      total: structuralAuditChecks.length,
      passed: structuralAuditPassed,
      failed: structuralAuditFailed,
    },
  },
  appAudit,
  currentState: {
    clientTypecheckClosed: false,
    clientTypecheckArtifact: 'artifacts/conformance/latest/phase-5-client-typecheck.txt',
    clientTypecheckNotes: [
      'The client app still has unresolved external dependency/toolchain holes in the provided zip.',
      'The Phase 5 showLineNumbers session-state wiring is present in source, but the overall app typecheck remains open because lucide-react, jszip, vitest, and ImportMeta.env declarations are not fully available in the provided checkpoint environment.',
      clientTypecheckLog.includes('showLineNumbers')
        ? 'A showLineNumbers-specific app typecheck error is still present.'
        : 'No showLineNumbers-specific typecheck failure was observed in the recorded Phase 5 client typecheck output.',
    ],
  },
};

const checkpointArtifact = {
  phase: 5,
  generatedAt: new Date().toISOString(),
  checkpointType: 'editor-semantics-and-authoring-ux-checkpoint',
  packages: {
    client: {
      name: clientPackage.name,
      version: clientPackage.version,
      path: 'apps/client',
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
    uiTokens: {
      name: uiTokensPackage.name,
      version: uiTokensPackage.version,
      path: 'packages/shared/ui-tokens',
    },
  },
  evidence: {
    editorCoreCommand: 'node packages/editor/markdown-editor-core/tests/run-smoke.mjs --json',
    editorReactCommand: 'node packages/editor/markdown-editor-react/tests/run-smoke.mjs --json',
    resultsArtifactPath: 'artifacts/conformance/latest/phase-5-editor-authoring-results.json',
    clientTypecheckArtifactPath: 'artifacts/conformance/latest/phase-5-client-typecheck.txt',
    appPaths: [
      editorPanePath,
      workPanePath,
      appShellPath,
      uiStatePath,
      useAppPath,
      settingsPath,
      uiEditorCssPath,
      uiTokensRootPath,
      uiTokensMarkdownPath,
      examplePath,
    ],
  },
  summary: {
    totalTestChecks: resultsArtifact.aggregate.testChecks.total,
    passedTestChecks: resultsArtifact.aggregate.testChecks.passed,
    failedTestChecks: resultsArtifact.aggregate.testChecks.failed,
    structuralAuditChecks: resultsArtifact.aggregate.structuralAudit.total,
    structuralAuditPassed: resultsArtifact.aggregate.structuralAudit.passed,
    structuralAuditFailed: resultsArtifact.aggregate.structuralAudit.failed,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    'bullet-list, task-list, indent, and outdent authoring commands in the portable editor family',
    'Enter continuation and termination behavior for ordered, unordered, and task list items',
    'selection-state format detection for toolbar active highlighting',
    'shell-exposed and persisted line-number toggle wiring',
    'editor and markdown rhythm token restoration for gutter fidelity',
    'example-level coverage for bullet/task/indent/outdent and line-number toggling',
  ],
  knownLimits: [
    'This checkpoint does not yet close broader v1-to-v2 regressions outside the Phase 5 boundary, including Git PAT parity, restore-from-JSON, theme exposure parity, language selection, and status/action-rail parity.',
    'The client app still does not typecheck end-to-end in the provided zip because of unresolved external dependency/toolchain holes unrelated to the Phase 5 editor-source changes.',
    'This checkpoint is not final frozen-target CommonMark/GFM certification closure; it closes the editor semantics and authoring UX lane only.',
    'Underline remains outside the standard Markdown authoring model and was not implemented as __...__.',
  ],
};

await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-5-editor-authoring-results.json'), resultsArtifact);
await writeJson(path.join(repoRoot, 'artifacts/conformance/latest/phase-5-editor-authoring-checkpoint.json'), checkpointArtifact);

console.log('phase 5 editor authoring checkpoint artifacts generated');
