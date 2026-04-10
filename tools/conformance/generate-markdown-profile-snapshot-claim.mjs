import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');

const npmExecPath = process.env.npm_execpath;
const command = process.execPath;
const args = npmExecPath
  ? [npmExecPath, 'run', 'test:markdown-profile-snapshot']
  : ['node_modules/npm/bin/npm-cli.js', 'run', 'test:markdown-profile-snapshot'];

let ok = true;
let output = '';

try {
  output = execFileSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (error) {
  ok = false;
  output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
}

const generatedAt = new Date().toISOString();
const artifact = {
  generatedAt,
  claimId: 'markdown-profile-snapshot-stability',
  gateId: 'gate-markdown-profile-snapshot-stability',
  status: ok ? 'green' : 'blocked',
  command: `${command} ${args.join(' ')}`,
  evidence: [
    'apps/client/src/features/markdownProfiles/profileConfig.ts',
    'apps/client/src/features/markdownProfiles/profileConfig.test.ts',
  ],
};

await mkdir(artifactRoot, { recursive: true });
await writeFile(
  path.join(artifactRoot, 'markdown-profile-snapshot-claim.json'),
  `${JSON.stringify(artifact, null, 2)}\n`,
  'utf8',
);
await writeFile(
  path.join(artifactRoot, 'markdown-profile-snapshot-claim-output.txt'),
  `${output}\n`,
  'utf8',
);

if (!ok) {
  console.error(output);
  process.exit(1);
}

console.log(JSON.stringify(artifact, null, 2));
