import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { copyAndroidReleaseOutputs, injectMarkdownIntentFilter } from '../scripts/android-contract.mjs';

test('android manifest patch is idempotent and injects markdown intent filters', () => {
  const baseManifest = '<activity android:name=".MainActivity"></activity>';
  const patched = injectMarkdownIntentFilter(baseManifest);

  assert.match(patched, /Open Markdown/);
  assert.equal(injectMarkdownIntentFilter(patched), patched);
});

test('android release output copier gathers bundle and apk artifacts', async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'mdwrk-android-contract-'));
  const bundleDir = path.join(tempRoot, 'bundle');
  const apkDir = path.join(tempRoot, 'apk');
  const distDir = path.join(tempRoot, 'dist');

  await fs.mkdir(bundleDir, { recursive: true });
  await fs.mkdir(apkDir, { recursive: true });
  await fs.writeFile(path.join(bundleDir, 'app-release.aab'), 'bundle', 'utf8');
  await fs.writeFile(path.join(apkDir, 'app-release.apk'), 'apk', 'utf8');

  await copyAndroidReleaseOutputs([bundleDir, apkDir], distDir);

  assert.equal(await fs.readFile(path.join(distDir, 'app-release.aab'), 'utf8'), 'bundle');
  assert.equal(await fs.readFile(path.join(distDir, 'app-release.apk'), 'utf8'), 'apk');

  await fs.rm(tempRoot, { recursive: true, force: true });
});
