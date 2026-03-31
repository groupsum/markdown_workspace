import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, repoRoot, writeJson } from "../lib/workspace.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runNode(relativeArgs) {
  return execFileSync(process.execPath, relativeArgs, {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

const corePackage = await readJson(path.join(repoRoot, "packages/renderer/markdown-renderer-core/package.json"));
const reactPackage = await readJson(path.join(repoRoot, "packages/renderer/markdown-renderer-react/package.json"));
const corpusSummary = JSON.parse(
  runNode(["packages/renderer/markdown-renderer-core/tests/commonmark-core-corpus.mjs", "--json"]),
);

const checkpoint = {
  phase: 2,
  generatedAt: new Date().toISOString(),
  checkpointType: "renderer-commonmark-core-checkpoint",
  rendererPackages: {
    core: {
      name: corePackage.name,
      version: corePackage.version,
      path: "packages/renderer/markdown-renderer-core",
    },
    react: {
      name: reactPackage.name,
      version: reactPackage.version,
      path: "packages/renderer/markdown-renderer-react",
    },
  },
  evidence: {
    rendererTestCommand: "npm run test:renderer",
    commonmarkSubsetResultsPath: "artifacts/conformance/latest/phase-2-commonmark-subset-results.json",
    goldenAstPath: "packages/renderer/markdown-renderer-core/tests/golden/commonmark-phase2-sample.ast.json",
    goldenHtmlPath: "packages/renderer/markdown-renderer-core/tests/golden/commonmark-phase2-sample.html",
  },
  commonmarkSubset: {
    total: corpusSummary.total,
    passed: corpusSummary.passed,
    failed: corpusSummary.failed,
  },
  currentState: {
    certifiablyFullyFeatured: false,
    repositoryInternallyRfcCompliant: false,
    fullyMarkdownSpecCompliant: false,
  },
  implementedFocusAreas: [
    "portable internal Markdown AST",
    "CommonMark-core-oriented block and inline parsing",
    "policy-controlled raw HTML handling",
    "source-position rendering attributes",
    "self-contained committed renderer dist",
    "React wrapper backed by core renderer",
  ],
};

await writeJson(
  path.join(repoRoot, "artifacts/conformance/latest/phase-2-commonmark-subset-results.json"),
  corpusSummary,
);

await writeJson(
  path.join(repoRoot, "artifacts/conformance/latest/phase-2-renderer-commonmark-checkpoint.json"),
  checkpoint,
);

console.log("phase 2 renderer checkpoint artifacts generated");
