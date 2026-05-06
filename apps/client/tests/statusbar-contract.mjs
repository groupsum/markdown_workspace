import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function read(relativePath) {
  return readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

const footer = read('apps/client/components/Chassis/Footer/Footer.tsx');
const css = read('apps/client/styles/base/chassis/status-bar.css');

const checks = [
  {
    id: 'statusbar.storage-label-removed',
    pass: !footer.includes("core.status.storage.persistent") && !footer.includes("IDB: PERSISTENT"),
  },
  {
    id: 'statusbar.saved-state-removed',
    pass: !footer.includes("core.status.state.saved") && !footer.includes("core.status.state.unsaved"),
  },
  {
    id: 'statusbar.autosave-remains-visible',
    pass: footer.includes("core.status.auto-save") && footer.includes("autoSaveEnabled ? 'ON' : 'OFF'"),
  },
  {
    id: 'statusbar.separator-dom-removed',
    pass: !footer.includes('status-sep'),
  },
  {
    id: 'statusbar.adjacent-separator-css',
    pass: css.includes('.status-item + .status-item') && css.includes('border-left: 1px solid var(--border-color);'),
  },
  {
    id: 'statusbar.hidden-leading-separators-reset',
    pass: css.includes('.status-right .status-item--network') && css.includes('.status-runtime') && css.includes('border-left: 0;'),
  },
];

const failed = checks.filter((check) => !check.pass);

if (failed.length > 0) {
  for (const check of checks) {
    console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.id}`);
  }
  process.exitCode = 1;
} else {
  console.log(`statusbar contract: ${checks.length}/${checks.length} passed`);
}
