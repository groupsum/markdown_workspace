import path from 'node:path';
import {
  ensureDir,
  isCliEntry,
  loadWorkspacePackages,
  pathExists,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

export async function runIntegrationSmoke() {
  const workspaces = await loadWorkspacePackages();
  const byName = new Map(workspaces.map((workspacePackage) => [workspacePackage.packageJson.name, workspacePackage]));
  const client = workspaces.find((workspacePackage) => workspacePackage.relativeDir === 'apps/client');
  const lander = workspaces.find((workspacePackage) => workspacePackage.relativeDir === 'apps/lander');
  const rendererExample = byName.get('@mdwrk/example-renderer-basic');
  const editorExample = byName.get('@mdwrk/example-editor-basic');

  const checks = [];
  const failures = [];

  function record(name, pass, detail) {
    checks.push({ name, pass, detail });
    if (!pass) {
      failures.push({ name, detail });
    }
  }

  record(
    'client-depends-on-runtime-and-first-party-extensions',
    Boolean(
      client?.packageJson.dependencies?.['@mdwrk/extension-runtime'] &&
        client.packageJson.dependencies['@mdwrk/extension-manager'] &&
        client.packageJson.dependencies['@mdwrk/extension-gemini-agent'] &&
        client.packageJson.dependencies['@mdwrk/extension-theme-studio'],
    ),
    client?.packageJson.dependencies ?? null,
  );

  record(
    'lander-depends-on-shared-renderer-packages',
    Boolean(
      lander?.packageJson.dependencies?.['@mdwrk/markdown-renderer-core'] &&
        lander.packageJson.dependencies['@mdwrk/markdown-renderer-react'] &&
        lander.packageJson.dependencies['@mdwrk/ui-tokens'],
    ),
    lander?.packageJson.dependencies ?? null,
  );

  record(
    'renderer-example-exists',
    Boolean(rendererExample) && (await pathExists(path.join(rendererExample.dir, 'App.tsx'))) && (await pathExists(path.join(rendererExample.dir, 'index.tsx'))),
    rendererExample?.relativeDir ?? null,
  );

  record(
    'editor-example-exists',
    Boolean(editorExample) && (await pathExists(path.join(editorExample.dir, 'App.tsx'))) && (await pathExists(path.join(editorExample.dir, 'index.tsx'))),
    editorExample?.relativeDir ?? null,
  );

  const report = {
    generatedAt: new Date().toISOString(),
    kind: 'integration-smoke',
    ok: failures.length === 0,
    checks,
    failures,
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'ci'));
  await writeJson(path.join(repoRoot, 'artifacts', 'ci', 'integration-smoke.json'), report);

  return report;
}

async function main() {
  const report = await runIntegrationSmoke();
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
