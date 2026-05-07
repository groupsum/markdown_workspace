import { promises as fs } from 'node:fs';
import path from 'node:path';

export const OPEN_MARKDOWN_INTENT_FILTER = `
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

export function injectMarkdownIntentFilter(manifest) {
  if (manifest.includes('Open Markdown')) {
    return manifest;
  }
  return manifest.replace('</activity>', `${OPEN_MARKDOWN_INTENT_FILTER}
        </activity>`);
}

export async function patchAndroidManifestFile(manifestPath) {
  const manifest = await fs.readFile(manifestPath, 'utf8');
  const nextManifest = injectMarkdownIntentFilter(manifest);
  if (nextManifest !== manifest) {
    await fs.writeFile(manifestPath, nextManifest, 'utf8');
  }
}

export async function copyAndroidReleaseOutputs(outputDirs, distRoot) {
  await fs.rm(distRoot, { recursive: true, force: true });
  await fs.mkdir(distRoot, { recursive: true });

  for (const outputDir of outputDirs) {
    try {
      const entries = await fs.readdir(outputDir);
      for (const entry of entries) {
        await fs.copyFile(path.join(outputDir, entry), path.join(distRoot, entry));
      }
    } catch {
      // Variants may be absent depending on local Android tooling.
    }
  }
}
