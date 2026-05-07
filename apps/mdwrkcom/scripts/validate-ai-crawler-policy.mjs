#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outIndex = process.argv.indexOf('--out');
const out = outIndex === -1 ? 'dist-static' : process.argv[outIndex + 1] || 'dist-static';

const result = spawnSync(process.execPath, ['./src/cli.mjs', 'verify', '--out', out], {
  cwd: appRoot,
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
