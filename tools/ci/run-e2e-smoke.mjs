import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  pathExists,
  readText,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

const REQUIRED_FILES = [
  'apps/client/src/extensions/runtime/ExtensionRuntimeProvider.tsx',
  'packages/extensions/extension-manager/src/createExtensionManagerBundledEntry.tsx',
  'packages/extensions/extension-gemini-agent/src/createGeminiAgentBundledEntry.tsx',
  'packages/extensions/extension-theme-studio/src/createThemeStudioBundledEntry.tsx',
  'apps/client/src/shell/ActionRailHost.tsx',
];

export async function runE2ESmoke() {
  const checks = [];
  const failures = [];

  for (const relativePath of REQUIRED_FILES) {
    const absolutePath = path.join(repoRoot, relativePath);
    const exists = await pathExists(absolutePath);
    checks.push({ name: `file:${relativePath}`, pass: exists, detail: exists ? 'present' : 'missing' });
    if (!exists) {
      failures.push({ name: `file:${relativePath}`, detail: 'required runtime/e2e surface missing' });
    }
  }

  const providerPath = path.join(repoRoot, 'apps/client/src/extensions/runtime/ExtensionRuntimeProvider.tsx');
  if (await pathExists(providerPath)) {
    const providerSource = await readText(providerPath);
    const providerChecks = [
      { needle: 'extension-manager', name: 'provider-registers-extension-manager' },
      { needle: 'extension-gemini-agent', name: 'provider-registers-gemini' },
      { needle: 'extension-theme-studio', name: 'provider-registers-theme-studio' },
    ];

    for (const providerCheck of providerChecks) {
      const pass = providerSource.includes(providerCheck.needle);
      checks.push({ name: providerCheck.name, pass, detail: providerCheck.needle });
      if (!pass) {
        failures.push({ name: providerCheck.name, detail: `Missing ${providerCheck.needle} in ExtensionRuntimeProvider.` });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    kind: 'e2e-smoke',
    ok: failures.length === 0,
    checks,
    failures,
    note: 'This checkpoint uses static structural end-to-end smoke assertions. Full browser-driven E2E remains a later hardening step.',
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'ci'));
  await writeJson(path.join(repoRoot, 'artifacts', 'ci', 'e2e-smoke.json'), report);

  return report;
}

async function main() {
  const report = await runE2ESmoke();
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
