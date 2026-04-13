import { promises as fs } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

const patchAndroidManifest = async () => {
  let manifest = await fs.readFile(manifestPath, 'utf8');
  if (manifest.includes('Open Markdown')) {
    return;
  }

  const intentFilter = `
        <intent-filter android:label="Open Markdown" android:priority="1">
            <action android:name="android.intent.action.VIEW" />
            <category android:name="android.intent.category.DEFAULT" />
            <category android:name="android.intent.category.BROWSABLE" />
            <data android:mimeType="text/markdown" />
            <data android:scheme="content" android:pathPattern=".*\\\\.md" />
            <data android:scheme="content" android:pathPattern=".*\\\\.markdown" />
            <data android:scheme="file" android:pathPattern=".*\\\\.md" />
            <data android:scheme="file" android:pathPattern=".*\\\\.markdown" />
        </intent-filter>`;

  manifest = manifest.replace('</activity>', `${intentFilter}
        </activity>`);
  await fs.writeFile(manifestPath, manifest, 'utf8');
};

await ensureAndroidProject();
await patchAndroidManifest();
await run('npx', ['cap', 'sync', 'android']);
