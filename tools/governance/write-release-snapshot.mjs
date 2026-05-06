import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fail, repoRoot } from './common.mjs';

const registryPath = repoRoot('.ssot/registry.json');
const releaseRoot = repoRoot('.ssot/releases');

function usage() {
  fail('Usage: node ./tools/governance/write-release-snapshot.mjs --release-id <release-id>');
}

function argValue(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) usage();
  return value;
}

function readJson(targetPath) {
  try {
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (error) {
    fail(`Unable to read JSON at ${targetPath}: ${error.message}`);
  }
}

function sha256File(targetPath) {
  return crypto.createHash('sha256').update(fs.readFileSync(targetPath)).digest('hex');
}

function releaseDirName(releaseId) {
  return releaseId.replaceAll(':', '__');
}

function byId(items) {
  return new Map((Array.isArray(items) ? items : []).map((item) => [item.id, item]));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function linkedIds(items, key) {
  return unique(items.flatMap((item) => (Array.isArray(item?.[key]) ? item[key] : [])));
}

function pickRecords(index, ids) {
  return ids.map((id) => index.get(id)).filter(Boolean);
}

function collectPathHashes(records) {
  const hashes = {};
  for (const record of records) {
    const recordPath = record?.path;
    if (!recordPath) continue;
    const absolutePath = repoRoot(recordPath);
    if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) continue;
    hashes[recordPath.replaceAll('\\', '/')] = sha256File(absolutePath);
  }
  return Object.fromEntries(Object.entries(hashes).sort(([left], [right]) => left.localeCompare(right)));
}

const releaseId = argValue('--release-id');
if (!releaseId) usage();

const registry = readJson(registryPath);
const releases = Array.isArray(registry.releases) ? registry.releases : [];
const release = releases.find((candidate) => candidate.id === releaseId);
if (!release) fail(`Release ${releaseId} is not present in .ssot/registry.json`);

const boundaries = byId(registry.boundaries);
const features = byId(registry.features);
const profiles = byId(registry.profiles);
const claims = byId(registry.claims);
const tests = byId(registry.tests);
const evidence = byId(registry.evidence);

const boundary = boundaries.get(release.boundary_id);
if (!boundary) fail(`Release ${releaseId} references missing boundary ${release.boundary_id}`);

const featureIds = unique([...(boundary.feature_ids ?? []), ...linkedIds(pickRecords(profiles, boundary.profile_ids ?? []), 'feature_ids')]);
const profileIds = unique(boundary.profile_ids ?? []);
const claimIds = unique(release.claim_ids ?? []);
const evidenceIds = unique(release.evidence_ids ?? []);
const featureRecords = pickRecords(features, featureIds);
const profileRecords = pickRecords(profiles, profileIds);
const claimRecords = pickRecords(claims, claimIds);
const evidenceRecords = pickRecords(evidence, evidenceIds);
const testIds = unique([
  ...linkedIds(featureRecords, 'test_ids'),
  ...linkedIds(claimRecords, 'test_ids'),
  ...linkedIds(evidenceRecords, 'test_ids'),
]);
const testRecords = pickRecords(tests, testIds);

const snapshot = {
  schema_version: 1,
  kind: 'release_snapshot',
  generated_at: new Date().toISOString(),
  registry_path: '.ssot/registry.json',
  registry_sha256: sha256File(registryPath),
  release,
  boundary,
  features: featureRecords,
  profiles: profileRecords,
  claims: claimRecords,
  tests: testRecords,
  evidence: evidenceRecords,
  file_hashes: collectPathHashes([...testRecords, ...evidenceRecords]),
  summary: {
    release_id: release.id,
    version: release.version,
    boundary_id: release.boundary_id,
    feature_count: featureRecords.length,
    profile_count: profileRecords.length,
    claim_count: claimRecords.length,
    test_count: testRecords.length,
    evidence_count: evidenceRecords.length,
    status: release.status,
  },
};

const releaseDir = path.join(releaseRoot, releaseDirName(release.id));
fs.mkdirSync(releaseDir, { recursive: true });
const outputPath = path.join(releaseDir, 'release.snapshot.json');
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

console.log(
  JSON.stringify(
    {
      passed: true,
      release_id: release.id,
      output_path: path.relative(process.cwd(), outputPath).replaceAll('\\', '/'),
      status: release.status,
      claim_count: claimRecords.length,
      evidence_count: evidenceRecords.length,
    },
    null,
    2,
  ),
);
