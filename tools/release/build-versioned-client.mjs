import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');
const clientRoot = path.join(workspaceRoot, 'apps', 'client');
const packageJson = JSON.parse(await fs.readFile(path.join(clientRoot, 'package.json'), 'utf-8'));
const appVersion = packageJson.version;
const releasedAt = process.env.RELEASED_AT || new Date().toISOString();
const buildSeed = process.env.BUILD_ID || process.env.GITHUB_SHA || `${appVersion}:${releasedAt}`;
const buildId = createHash('sha256').update(buildSeed).digest('hex').slice(0, 12);
const storageSchema = `lattice-idb-v3`;
const retainedSourceRoot = process.env.CLIENT_RETAINED_SOURCE_DIR
  ? path.resolve(workspaceRoot, process.env.CLIENT_RETAINED_SOURCE_DIR)
  : null;
const outputRoot = path.join(clientRoot, 'dist');
const versionedBasePath = `/client/versions/${appVersion}/`;
const versionOutDir = path.join(outputRoot, 'client', 'versions', appVersion);
const versionManifestPath = path.join(outputRoot, 'client', 'versions', 'index.json');
const viteBin = path.join(clientRoot, 'node_modules', 'vite', 'bin', 'vite.js');

const run = (command, args, options = {}) => new Promise((resolve, reject) => {
  const child = spawn(command, args, {
    cwd: clientRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      BUILD_ID: buildId,
      CLIENT_BASE_PATH: versionedBasePath,
      CLIENT_OUT_DIR: versionOutDir,
      ...options.env,
    },
  });
  child.on('exit', (code) => {
    if (code === 0) {
      resolve();
      return;
    }
    reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}`));
  });
});

const safeReadJson = async (targetPath) => {
  try {
    return JSON.parse(await fs.readFile(targetPath, 'utf-8'));
  } catch {
    return null;
  }
};

const ensureDir = async (targetPath) => {
  await fs.mkdir(targetPath, { recursive: true });
};

const copyDir = async (source, target) => {
  await ensureDir(path.dirname(target));
  await fs.cp(source, target, { recursive: true, force: true });
};

const relativeFromRoot = (...segments) => segments.join('/').replaceAll('\\', '/');

const writeBootstrapFiles = async (manifest) => {
  const bootstrapHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MdWork Bootstrap</title>
  <style>
    :root { color-scheme: dark; font-family: "Segoe UI", sans-serif; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050505; color: #f2f2f2; }
    main { width: min(480px, 92vw); border: 1px solid #3a3a3a; padding: 24px; background: #111; }
    h1 { margin: 0 0 12px; font-size: 18px; letter-spacing: 0.08em; text-transform: uppercase; }
    p { margin: 0; font-size: 13px; line-height: 1.5; color: #c9c9c9; }
    code { color: #fff; }
  </style>
</head>
<body>
  <main>
    <h1>MdWork</h1>
    <p id="bootstrap-status">Resolving retained client version...</p>
  </main>
  <script type="module" src="/bootstrap.js"></script>
</body>
</html>`;
  const bootstrapJs = `const INDEX_PATH = '/client/versions/index.json';
const SELECTED_VERSION_STORAGE_KEY = 'lattice-selected-client-version';
const statusNode = document.getElementById('bootstrap-status');

const setStatus = (message) => {
  if (statusNode) statusNode.textContent = message;
};

const resolveSelectedVersion = (manifest) => {
  const available = Array.isArray(manifest.available) ? manifest.available : [];
  const stored = window.localStorage.getItem(SELECTED_VERSION_STORAGE_KEY);
  const latest = manifest.latest || available[0]?.version || ${JSON.stringify(appVersion)};
  const storedEntry = stored ? available.find((entry) => entry.version === stored && entry.isSelectable) : null;
  return storedEntry?.version || latest;
};

const goToVersion = (version) => {
  window.localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, version);
  const target = '/client/versions/' + encodeURIComponent(version) + '/';
  if (window.location.pathname !== target) {
    window.location.replace(target);
  }
};

fetch(INDEX_PATH, { cache: 'no-store' })
  .then(async (response) => {
    if (!response.ok) throw new Error('Unable to load retained client manifest');
    const manifest = await response.json();
    const version = resolveSelectedVersion(manifest);
    setStatus('Loading version ' + version + '...');
    goToVersion(version);
  })
  .catch((error) => {
    console.error(error);
    setStatus('Unable to load retained client manifest. Verify /client/versions/index.json is present.');
  });`;
  await fs.writeFile(path.join(outputRoot, 'index.html'), bootstrapHtml, 'utf-8');
  await fs.writeFile(path.join(outputRoot, 'bootstrap.js'), bootstrapJs, 'utf-8');
  await ensureDir(path.dirname(versionManifestPath));
  await fs.writeFile(versionManifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
};

await fs.rm(outputRoot, { recursive: true, force: true });
await ensureDir(versionOutDir);

const retainedEntries = [];

if (retainedSourceRoot) {
  const retainedManifest = await safeReadJson(path.join(retainedSourceRoot, 'client', 'versions', 'index.json'));
  const retainedAvailable = Array.isArray(retainedManifest?.available) ? retainedManifest.available : [];
  for (const entry of retainedAvailable) {
    if (entry.version === appVersion) {
      continue;
    }
    const sourceDir = path.join(retainedSourceRoot, 'client', 'versions', entry.version);
    try {
      await fs.access(sourceDir);
      retainedEntries.push(entry);
      await copyDir(sourceDir, path.join(outputRoot, 'client', 'versions', entry.version));
    } catch {
      // Ignore missing retained versions.
    }
  }
}

await run('node', [viteBin, 'build', '--configLoader', 'runner']);

const nextEntries = [
  {
    version: appVersion,
    buildId,
    releasedAt,
    storageSchema,
    isSelectable: true,
  },
  ...retainedEntries,
]
  .sort((left, right) => new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime())
  .slice(0, 5);

const manifest = {
  latest: nextEntries.find((entry) => entry.isSelectable)?.version || appVersion,
  available: nextEntries,
};

await writeBootstrapFiles(manifest);

const manifestWeb = {
  name: 'MdWork Bootstrap',
  short_name: 'MdWork',
  start_url: '/',
  display: 'standalone',
  background_color: '#050505',
  theme_color: '#050505',
};
await fs.writeFile(path.join(outputRoot, 'manifest.webmanifest'), JSON.stringify(manifestWeb, null, 2), 'utf-8');

const latestVersionDir = path.join(outputRoot, 'client', 'versions', appVersion);
for (const asset of ['favicon.svg', 'icons']) {
  const source = path.join(latestVersionDir, asset);
  try {
    await fs.access(source);
    await copyDir(source, path.join(outputRoot, asset));
  } catch {
    // Ignore optional root bootstrap assets.
  }
}

console.log(`Built retained client output for ${appVersion} -> ${relativeFromRoot('apps', 'client', 'dist')}`);
