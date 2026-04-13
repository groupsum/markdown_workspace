import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import './android-prepare.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(desktopRoot, 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

const child = spawn(gradleExecutable, ['bundleRelease'], {
  cwd: androidRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code) => {
  process.exitCode = code ?? 0;
});
