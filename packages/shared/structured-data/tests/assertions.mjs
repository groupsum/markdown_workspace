import assert from "node:assert/strict";
import { jsonLdGraph } from "../dist/index.js";
import { expectedTypes, generatedGraph, legacyFaq, nodes } from "./fixtures.mjs";

export function runSmokeAssertions() {
  assert.deepEqual(nodes.map((node) => node["@type"]), expectedTypes);
  assert.equal(legacyFaq["@type"], "FAQPage");
  assert.equal(jsonLdGraph(nodes)["@graph"].length, expectedTypes.length);
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "WebPage"));
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "BlogPosting"));
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "FAQPage"));
}
