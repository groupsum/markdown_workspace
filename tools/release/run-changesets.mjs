#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

const [, , subcommand] = process.argv;

if (!subcommand || !['status', 'version'].includes(subcommand)) {
  console.error('Usage: node tools/release/run-changesets.mjs <status|version>');
  process.exit(1);
}

const run = (args) =>
  spawnSync('npx', ['@changesets/cli', ...args], {
    stdio: 'inherit',
    env: process.env,
  });

const gitHasRef = (ref) => spawnSync('git', ['rev-parse', '--verify', '--quiet', ref]).status === 0;

const pickSinceRef = () => {
  const envRef = process.env.CHANGESETS_STATUS_BASE_REF;
  const candidates = [
    envRef,
    'origin/master',
    'master',
    'origin/main',
    'main',
    'HEAD~1',
    'HEAD',
  ].filter(Boolean);

  return candidates.find((candidate) => gitHasRef(candidate));
};

if (subcommand === 'status') {
  const ref = pickSinceRef();
  const args = ['status'];

  if (ref && ref !== 'HEAD') {
    args.push('--since', ref);
  }

  const result = run(args);
  process.exit(result.status ?? 1);
}

const versionResult = run(['version']);
process.exit(versionResult.status ?? 1);
