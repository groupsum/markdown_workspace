import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const nodeModulesRoot = path.join(packageRoot, "node_modules", "@mdwrk");
const links = {
  "markdown-renderer-core": path.resolve(packageRoot, "../../renderer/markdown-renderer-core"),
  "markdown-renderer-react": path.resolve(packageRoot, "../../renderer/markdown-renderer-react"),
  "markdown-editor-core": path.resolve(packageRoot, "../markdown-editor-core"),
  "markdown-editor-react": path.resolve(packageRoot, "../markdown-editor-react"),
  "ui-tokens": path.resolve(packageRoot, "../../shared/ui-tokens"),
};

await fs.mkdir(nodeModulesRoot, { recursive: true });
const linkKind = process.platform === "win32" ? "junction" : "dir";

for (const [name, target] of Object.entries(links)) {
  const linkPath = path.join(nodeModulesRoot, name);
  await fs.rm(linkPath, { recursive: true, force: true });
  try {
    await fs.symlink(target, linkPath, linkKind);
  } catch (error) {
    if (error && (error.code === "EISDIR" || error.code === "EPERM")) {
      await fs.cp(target, linkPath, { recursive: true, force: true });
      continue;
    }
    throw error;
  }
}
