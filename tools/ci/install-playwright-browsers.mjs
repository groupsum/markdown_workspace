import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import { browserAvailabilitySnapshot } from './playwright-browser-utils.mjs';

const require = createRequire(import.meta.url);
const playwright = require('playwright');
const playwrightPackageJsonPath = require.resolve('playwright/package.json');
const playwrightCliPath = path.join(path.dirname(playwrightPackageJsonPath), 'cli.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const artifactRoot = path.join(repoRoot, 'artifacts', 'conformance', 'latest');
const reportPath = path.join(artifactRoot, 'phase-22-browser-install-report.json');
const outputPath = path.join(artifactRoot, 'phase-22-browser-install-output.txt');

mkdirSync(artifactRoot, { recursive: true });

function classifyFailure(result) {
  const text = `${result.stdout}\n${result.stderr}`;
  if (text.includes('Temporary failure resolving')) {
    return 'apt-dns-resolution-failure';
  }
  if (text.includes('getaddrinfo EAI_AGAIN')) {
    return 'browser-cdn-dns-resolution-failure';
  }
  if (result.timedOut || result.exitCode === 124) {
    return 'timed-out';
  }
  return result.exitCode === 0 ? 'none' : 'other';
}

function runInstall(command, args, timeoutMs) {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: {
        ...process.env,
        DEBIAN_FRONTEND: 'noninteractive',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    let settled = false;
    let timedOut = false;

    const finish = (payload) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve({ stdout, stderr, timedOut, ...payload });
    };

    child.stdout.on('data', (chunk) => {
      stdout += String(chunk);
    });

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      finish({ exitCode: null, signal: null, error: String(error?.message || error) });
    });

    child.on('close', (code, signal) => {
      finish({ exitCode: code, signal, error: null });
    });

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5_000).unref();
    }, timeoutMs);
  });
}

const beforeAvailability = browserAvailabilitySnapshot(playwright);
const attempts = [
  {
    label: 'with-deps',
    timeoutMs: 90_000,
    command: 'node',
    args: [playwrightCliPath, 'install', '--with-deps', 'chromium', 'firefox', 'webkit'],
  },
  {
    label: 'browser-only',
    timeoutMs: 120_000,
    command: 'node',
    args: [playwrightCliPath, 'install', 'chromium', 'firefox', 'webkit'],
  },
];

const results = [];
for (const attempt of attempts) {
  const result = await runInstall(attempt.command, attempt.args, attempt.timeoutMs);
  results.push({
    label: attempt.label,
    command: [attempt.command, ...attempt.args].join(' '),
    timeoutMs: attempt.timeoutMs,
    exitCode: result.exitCode,
    signal: result.signal,
    timedOut: result.timedOut,
    error: result.error,
    stdout: result.stdout,
    stderr: result.stderr,
    failureClass: classifyFailure(result),
  });
}

const afterAvailability = browserAvailabilitySnapshot(playwright);
const report = {
  generatedAt: new Date().toISOString(),
  phase: 22,
  beforeAvailability,
  afterAvailability,
  attempts: results,
  installSucceeded: afterAvailability.every((entry) => entry.executableExists),
};

writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
writeFileSync(
  outputPath,
  [
    'Phase 22 Playwright browser installation attempts',
    '',
    `beforeAvailability: ${JSON.stringify(beforeAvailability, null, 2)}`,
    '',
    ...results.flatMap((result) => [
      `--- ${result.label} command ---`,
      result.command,
      `timeoutMs: ${result.timeoutMs}`,
      `exitCode: ${result.exitCode}`,
      `signal: ${result.signal}`,
      `timedOut: ${result.timedOut}`,
      `error: ${result.error}`,
      `failureClass: ${result.failureClass}`,
      '',
      'stdout:',
      result.stdout,
      '',
      'stderr:',
      result.stderr,
      '',
    ]),
    `afterAvailability: ${JSON.stringify(afterAvailability, null, 2)}`,
  ].join('\n'),
  'utf8',
);

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
