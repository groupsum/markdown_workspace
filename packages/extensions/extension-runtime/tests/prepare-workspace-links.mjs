import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');
const nodeModulesRoot = path.join(packageRoot, 'node_modules', '@mdwrk');
const links = {
  'extension-manifest': path.resolve(packageRoot, '../../contracts/extension-manifest'),
  'extension-host': path.resolve(packageRoot, '../../contracts/extension-host'),
  'theme-contract': path.resolve(packageRoot, '../../contracts/theme-contract'),
};

await fs.mkdir(nodeModulesRoot, { recursive: true });
for (const [name, target] of Object.entries(links)) {
  const linkPath = path.join(nodeModulesRoot, name);
  try {
    await fs.rm(linkPath, { recursive: true, force: true });
  } catch {}
  await fs.symlink(target, linkPath, 'dir');
}
