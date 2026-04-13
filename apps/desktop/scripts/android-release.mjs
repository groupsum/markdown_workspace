import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import './android-prepare.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const desktopRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(desktopRoot, 'android');
const distRoot = path.join(desktopRoot, 'dist', 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

const child = spawn(gradleExecutable, ['bundleRelease'], {
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

  await fs.rm(distRoot, { recursive: true, force: true });
  await fs.mkdir(distRoot, { recursive: true });

  for (const outputDir of releaseOutputs) {
    try {
      const entries = await fs.readdir(outputDir);
      for (const entry of entries) {
        await fs.copyFile(path.join(outputDir, entry), path.join(distRoot, entry));
      }
    } catch {
      // Some variants may be absent depending on local Gradle configuration.
    }
  }

  process.exitCode = 0;
});
