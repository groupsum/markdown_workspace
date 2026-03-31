import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMarkdownToHtmlSync } from "../dist/index.js";

const fixturePath = fileURLToPath(new URL("./fixtures/gfm-default-profile.json", import.meta.url));
const fixtures = JSON.parse(readFileSync(fixturePath, "utf8"));

function canonicalize(html) {
  return String(html)
    .trim()
    .replace(/^<div[^>]*>/, "")
    .replace(/<\/div>$/, "")
    .replace(/<pre[^>]*>\s*<div[^>]*>[^<]*<\/div>\s*<div[^>]*>\s*<code([^>]*)>/g, "<pre><code$1>")
    .replace(/<\/code>\s*<\/div>\s*<\/pre>/g, "</code></pre>")
    .replace(/\sclass="[^"]*"/g, "")
    .replace(/\sid="[^"]*"/g, "")
    .replace(/\sdata-sourcepos="[^"]*"/g, "")
    .replace(/\starget="[^"]*"/g, "")
    .replace(/\srel="[^"]*"/g, "")
    .replace(/\sdisabled(="disabled")?/g, "")
    .replace(/\saria-label="[^"]*"/g, "")
    .replace(/\saria-checked="[^"]*"/g, "")
    .replace(/\saria-hidden="[^"]*"/g, "")
    .replace(/\stabindex="[^"]*"/g, "")
    .replace(/>\s+</g, "><")
    .replace(/\s+\/>/g, " />")
    .trim();
}

const results = [];
let passed = 0;

for (const testCase of fixtures) {
  const actual = renderMarkdownToHtmlSync(testCase.markdown, {
    htmlHandling: testCase.htmlHandling ?? "allow-trusted",
    profile: "gfm-default",
  });
  const canonicalActual = canonicalize(actual);
  const canonicalExpected = canonicalize(`<div>${testCase.expectedHtml}</div>`);
  const ok = canonicalActual === canonicalExpected;
  results.push({
    id: testCase.id,
    section: testCase.section,
    passed: ok,
    expectedHtml: canonicalExpected,
    actualHtml: canonicalActual,
  });
  if (ok) passed += 1;
}

const summary = {
  total: results.length,
  passed,
  failed: results.length - passed,
  results,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  const failures = results.filter((result) => !result.passed);
  if (failures.length) {
    writeFileSync(fileURLToPath(new URL("./fixtures/gfm-default-profile.failures.json", import.meta.url)), JSON.stringify(failures, null, 2));
  }
  assert.equal(summary.failed, 0, `gfm default profile failures: ${summary.failed}`);
  console.log(`renderer-core gfm default profile passed: ${summary.passed}/${summary.total}`);
}
