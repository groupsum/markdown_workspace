import fs from 'node:fs';
import path from 'node:path';
import { fail, repoRoot } from './common.mjs';

const registryPath = repoRoot('.ssot/registry.json');
const graphPath = repoRoot('.ssot/graphs/registry-graph.json');
const reportPath = repoRoot('.ssot/reports/ssot-graph-export-governance.json');
const writeReport = process.argv.includes('--write-report');

function readJson(targetPath) {
  try {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (error) {
    fail(`Unable to read JSON at ${targetPath}: ${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function collectRegistryIds(registry) {
  const sections = {
    features: 'feature',
    tests: 'test',
    claims: 'claim',
    evidence: 'evidence',
    issues: 'issue',
    risks: 'risk',
    boundaries: 'boundary',
    releases: 'release',
    adrs: 'adr',
    specs: 'spec',
    profiles: 'profile',
  };
  const ids = new Map();
  for (const [section, kind] of Object.entries(sections)) {
    for (const entity of asArray(registry[section])) {
      ids.set(entity.id, { kind, section });
    }
  }
  return ids;
}

function edgeKey(edge) {
  return `${edge.type}\u0000${edge.from}\u0000${edge.to}`;
}

const registry = readJson(registryPath);
const graph = readJson(graphPath);
const registryIds = collectRegistryIds(registry);
const nodes = asArray(graph.nodes);
const edges = asArray(graph.edges);
const nodeIds = new Set();
const duplicateNodeIds = [];
const malformedNodes = [];

for (const node of nodes) {
  if (!node?.id || !node?.kind) {
    malformedNodes.push(node);
    continue;
  }
  if (nodeIds.has(node.id)) {
    duplicateNodeIds.push(node.id);
  }
  nodeIds.add(node.id);
}

const missingRegistryNodeIds = [...registryIds.keys()].filter((id) => !nodeIds.has(id)).sort();
const danglingEdges = [];
const duplicateEdges = [];
const seenEdges = new Set();
const edgeKeys = new Set();
const edgeTypeCounts = new Map();

for (const edge of edges) {
  if (!edge?.type || !edge?.from || !edge?.to) {
    danglingEdges.push(edge);
    continue;
  }
  if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
    danglingEdges.push(edge);
  }
  const key = edgeKey(edge);
  if (seenEdges.has(key)) {
    duplicateEdges.push(edge);
  }
  seenEdges.add(key);
  edgeKeys.add(key);
  edgeTypeCounts.set(edge.type, (edgeTypeCounts.get(edge.type) ?? 0) + 1);
}

const missingExpectedEdges = [];
for (const feature of asArray(registry.features)) {
  for (const specId of asArray(feature.spec_ids)) {
    const key = edgeKey({ type: 'SPECIFIED_BY', from: feature.id, to: specId });
    if (!edgeKeys.has(key)) missingExpectedEdges.push(key);
  }
  for (const testId of asArray(feature.test_ids)) {
    const key = edgeKey({ type: 'COVERED_BY', from: feature.id, to: testId });
    if (!edgeKeys.has(key)) missingExpectedEdges.push(key);
  }
  for (const claimId of asArray(feature.claim_ids)) {
    const key = edgeKey({ type: 'ASSERTS', from: claimId, to: feature.id });
    if (!edgeKeys.has(key)) missingExpectedEdges.push(key);
  }
}

const failures = [
  malformedNodes.length > 0 ? `${malformedNodes.length} malformed nodes` : null,
  duplicateNodeIds.length > 0 ? `${duplicateNodeIds.length} duplicate node ids` : null,
  missingRegistryNodeIds.length > 0 ? `${missingRegistryNodeIds.length} registry entities missing graph nodes` : null,
  danglingEdges.length > 0 ? `${danglingEdges.length} malformed or dangling edges` : null,
  duplicateEdges.length > 0 ? `${duplicateEdges.length} duplicate edges` : null,
  missingExpectedEdges.length > 0 ? `${missingExpectedEdges.length} missing expected feature relationship edges` : null,
].filter(Boolean);

const report = {
  generated_at: new Date().toISOString(),
  registry_path: path.relative(process.cwd(), registryPath).replaceAll('\\', '/'),
  graph_path: path.relative(process.cwd(), graphPath).replaceAll('\\', '/'),
  node_count: nodes.length,
  edge_count: edges.length,
  registry_entity_count: registryIds.size,
  edge_type_counts: Object.fromEntries([...edgeTypeCounts.entries()].sort(([left], [right]) => left.localeCompare(right))),
  duplicate_node_ids: duplicateNodeIds.sort(),
  missing_registry_node_ids: missingRegistryNodeIds,
  dangling_edges: danglingEdges,
  duplicate_edges: duplicateEdges,
  missing_expected_edges: missingExpectedEdges.sort(),
};

if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (failures.length > 0) {
  fail(`SSOT graph export governance failed: ${failures.join('; ')}`);
}

console.log(`SSOT graph export governance passed: ${nodes.length} nodes and ${edges.length} edges validated.`);
