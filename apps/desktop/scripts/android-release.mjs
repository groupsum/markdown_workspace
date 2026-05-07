import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { copyAndroidReleaseOutputs } from './android-contract.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(desktopRoot, 'android');
const distRoot = path.join(desktopRoot, 'dist', 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

const run = (command, args, cwd) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('error', reject);
  child.on('exit', (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
  });
});

const workspaceRoot = path.resolve(desktopRoot, '..', '..');

await run('npm', ['run', 'build:client'], workspaceRoot);
await import('./android-prepare.mjs');

const child = spawn(gradleExecutable, ['bundleRelease', 'assembleRelease'], {
  cwd: androidRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', async (code) => {
  if (code !== 0) {
    process.exitCode = code ?? 1;
    return;
  }

  const releaseOutputs = [
    path.join(androidRoot, 'app', 'build', 'outputs', 'bundle', 'release'),
    path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'release'),
  ];

  await copyAndroidReleaseOutputs(releaseOutputs, distRoot);

  process.exitCode = 0;
});
