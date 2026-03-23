import path from 'node:path';
import {
  ensureDir,
  hashFile,
  isCliEntry,
  pathExists,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

const SNAPSHOT_FILES = [
  'packages/shared/ui-tokens/src/styles/root.css',
  'packages/shared/ui-tokens/src/styles/markdown.css',
  'packages/renderer/markdown-renderer-react/src/styles/default.css',
  'packages/editor/markdown-editor-react/src/styles/default.css',
];

export async function runVisualSmoke() {
  const snapshots = [];
  const failures = [];

  for (const relativePath of SNAPSHOT_FILES) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!(await pathExists(absolutePath))) {
      failures.push({ path: relativePath, reason: 'missing visual/theme asset' });
      continue;
    }
    snapshots.push({
      path: relativePath,
      sha256: await hashFile(absolutePath),
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    kind: 'visual-smoke',
    ok: failures.length === 0,
    snapshots,
    failures,
    note: 'This checkpoint captures asset-level visual snapshots as deterministic SHA-256 digests. Pixel-level regression remains a future enhancement.',
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'ci'));
  await writeJson(path.join(repoRoot, 'artifacts', 'ci', 'visual-smoke.json'), report);

  return report;
}

async function main() {
  const report = await runVisualSmoke();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
