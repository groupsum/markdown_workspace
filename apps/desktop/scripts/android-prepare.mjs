import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { patchAndroidManifestFile } from './android-contract.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(desktopRoot, 'android');
const manifestPath = path.join(androidRoot, 'app', 'src', 'main', 'AndroidManifest.xml');

const run = (command, args) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: desktopRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  child.on('exit', (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
  });
});

const ensureAndroidProject = async () => {
  try {
    await fs.access(androidRoot);
  } catch {
    await run('npx', ['cap', 'add', 'android']);
  }
};

await ensureAndroidProject();
await patchAndroidManifestFile(manifestPath);
await run('npx', ['cap', 'sync', 'android']);
