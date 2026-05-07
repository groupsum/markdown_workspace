import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fail, repoRoot } from './common.mjs';

const executable = process.platform === 'win32'
  ? repoRoot('.venv', 'Scripts', 'ssot-registry.exe')
  : repoRoot('.venv', 'bin', 'ssot-registry');
const outputPath = repoRoot('.ssot', 'graphs', 'registry-graph.json');

if (!fs.existsSync(executable)) {
  fail(`Missing local ssot-registry executable: ${path.relative(process.cwd(), executable).replaceAll('\\', '/')}`);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const result = spawnSync(
  executable,
  ['graph', 'export', '.', '--format', 'json', '--output', outputPath],
  {
    cwd: process.cwd(),
    stdio: 'pipe',
    encoding: 'utf8',
  },
);

if (result.status !== 0) {
  const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim();
  fail(`Unable to write SSOT graph export.${detail ? ` ${detail}` : ''}`);
}

if (!fs.existsSync(outputPath)) {
  fail(`SSOT graph export did not produce ${path.relative(process.cwd(), outputPath).replaceAll('\\', '/')}`);
}

console.log(`SSOT graph export written to ${path.relative(process.cwd(), outputPath).replaceAll('\\', '/')}.`);
