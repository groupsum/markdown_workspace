import path from 'node:path';
import { readFileSync } from 'node:fs';

const repoRoot = path.resolve(new URL('../../..', import.meta.url).pathname);

function loadText(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const footerText = loadText('apps/client/components/Chassis/Footer/Footer.tsx');
const actionRailText = loadText('apps/client/components/Chassis/ActionRail/ActionRail.tsx');
const actionRailHostText = loadText('apps/client/src/shell/ActionRailHost.tsx');
const appShellText = loadText('apps/client/src/shell/AppShell.tsx');
const coreRegistrationsText = loadText('apps/client/src/app/runtime/useCoreSurfaceRegistrations.tsx');
const fileManagerText = loadText('apps/client/hooks/useFileManager.ts');
const useAppText = loadText('apps/client/hooks/useApp.ts');
const splitViewPolicyText = loadText('apps/client/src/features/layout/splitViewPolicy.ts');
const editorPaneText = loadText('apps/client/components/Chassis/WorkPane/Stage/EditorPane.tsx');

const isMobileLandscape = (width, height) => width <= 1024 && width > height;
const isSplitAllowed = (width, height) => width > 900 || isMobileLandscape(width, height);

const checks = [
  {
    id: 'footer.runtime-label',
    pass: footerText.includes("const runtimeLabel = `${shellLabel}: v${shellVersion}:${buildId}`") && footerText.includes('{runtimeLabel}'),
  },
  {
    id: 'footer.update-ready',
    pass: footerText.includes('UPDATE_READY') && footerText.includes('{updateAvailable && ('),
  },
  {
    id: 'action-rail.localized-aria-label',
    pass: actionRailText.includes('readonly ariaLabel?: string;') && actionRailText.includes('aria-label={ariaLabel}') && actionRailHostText.includes("key: 'core.action-rail.aria-label'"),
  },
  {
    id: 'action-rail.aria-pressed',
    pass: actionRailText.includes('aria-pressed={active === undefined ? undefined : active}'),
  },
  {
    id: 'import-flow.command-and-rail',
    pass: coreRegistrationsText.includes("id: 'core.import-markdown'") && coreRegistrationsText.includes("commandId: 'core.import-markdown'"),
  },
  {
    id: 'import-flow.file-input',
    pass: (appShellText.includes('accept=".md,.markdown,text/markdown"') || appShellText.includes('accept=".md,.markdown,text/markdown,text/plain"')) && appShellText.includes('void actions.handleImportMarkdown(files);'),
  },
  {
    id: 'import-flow.file-manager',
    pass: fileManagerText.includes('const importMarkdownFiles = async') && useAppText.includes('requestMarkdownImport') && useAppText.includes('MARKDOWN_IMPORT_REQUEST_EVENT'),
  },
  {
    id: 'split-policy.source',
    pass: splitViewPolicyText.includes('viewport.width <= 1024 && viewport.width > viewport.height') && splitViewPolicyText.includes('viewport.width > 900 || isMobileLandscapeViewport(viewport)') && editorPaneText.includes('isSplitViewAllowedForViewport'),
  },
  {
    id: 'split-policy.landscape-allows',
    pass: isSplitAllowed(960, 640) === true,
  },
  {
    id: 'split-policy.portrait-blocks',
    pass: isSplitAllowed(800, 980) === false,
  },
  {
    id: 'cloud-sync.refresh-event',
    pass: coreRegistrationsText.includes('GIT_REPO_REFRESH_REQUEST_EVENT') && coreRegistrationsText.includes('GITHUB CLOUD SYNC REQUESTED'),
  },
];

const result = {
  phase: 7,
  generatedAt: new Date().toISOString(),
  total: checks.length,
  passed: checks.filter((entry) => entry.pass).length,
  failed: checks.filter((entry) => !entry.pass).length,
  checks,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(result, null, 2));
} else {
  console.log(`phase7 shell parity: ${result.passed}/${result.total} passed`);
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
}
