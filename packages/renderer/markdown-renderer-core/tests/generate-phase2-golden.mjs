
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseMarkdownToAst, renderMarkdownToHtmlSync } from "../dist/index.js";

const sampleMarkdown = [
  "# Sample",
  "",
  "> quoted",
  "",
  "- [x] task",
  "- item with [link](/docs)",
  "",
  "```js",
  "console.log(1)",
  "```",
].join("\n");

const ast = parseMarkdownToAst(sampleMarkdown, { htmlHandling: "allow-trusted" });
const html = renderMarkdownToHtmlSync(sampleMarkdown, {
  htmlHandling: "allow-trusted",
  sourcePositionAttributes: true,
});

const goldenDir = fileURLToPath(new URL("./golden/", import.meta.url));
mkdirSync(goldenDir, { recursive: true });
writeFileSync(resolve(goldenDir, "commonmark-phase2-sample.ast.json"), JSON.stringify(ast, null, 2));
writeFileSync(resolve(goldenDir, "commonmark-phase2-sample.html"), `${html}\n`);
console.log("renderer-core golden files generated");
