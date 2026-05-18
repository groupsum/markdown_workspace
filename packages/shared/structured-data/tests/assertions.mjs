import assert from "node:assert/strict";
import {
  assertSupportedSchemaOrgType,
  isAbsoluteSchemaUrl,
  isSupportedSchemaOrgType,
  jsonLdGraph,
  productSnippetNode,
  SUPPORTED_SCHEMA_ORG_TYPES,
} from "../dist/index.js";
import { expectedTypes, generatedGraph, legacyFaq, nodes } from "./fixtures.mjs";

export function runSmokeAssertions() {
  assert.deepEqual(nodes.map((node) => node["@type"]), expectedTypes);
  for (const type of expectedTypes) assert.ok(isSupportedSchemaOrgType(type), `${type} must be in the Schema.org baseline`);
  assert.equal(SUPPORTED_SCHEMA_ORG_TYPES.length, new Set(SUPPORTED_SCHEMA_ORG_TYPES).size, "Schema.org baseline types must be unique");
  assert.equal(assertSupportedSchemaOrgType("WebPage"), "WebPage");
  assert.throws(() => assertSupportedSchemaOrgType("UnsupportedType"), /Unsupported Schema\.org/);
  assert.ok(isAbsoluteSchemaUrl("https://example.test/docs/structured-data#web-page"));
  assert.equal(isAbsoluteSchemaUrl("/docs/structured-data#web-page"), false);
  assert.equal(legacyFaq["@type"], "FAQPage");
  assert.equal(jsonLdGraph(nodes)["@graph"].length, expectedTypes.length);
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "WebPage"));
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "BlogPosting"));
  assert.ok(generatedGraph.some((entry) => entry["@type"] === "FAQPage"));
  assert.throws(
    () => productSnippetNode({ name: "Invalid Product Snippet", url: "https://example.test/product-snippet" }),
    /requires offers, aggregateRating, or review/,
  );
}
