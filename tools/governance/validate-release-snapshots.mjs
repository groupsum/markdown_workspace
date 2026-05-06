import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fail, repoRoot } from './common.mjs';

const registryPath = repoRoot('.ssot/registry.json');
const releaseRoot = repoRoot('.ssot/releases');
const boundaryRoot = repoRoot('.ssot/releases/boundaries');
const reportPath = repoRoot('.ssot/reports/release-snapshot-index.json');
const writeReport = process.argv.includes('--write-report');

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

function relPath(targetPath) {
  return path.relative(process.cwd(), targetPath).replaceAll('\\', '/');
}

function releaseDirName(releaseId) {
  return releaseId.replaceAll(':', '__');
}

function boundarySnapshotName(boundaryId) {
  return `${boundaryId.replaceAll(':', '__')}.snapshot.json`;
}

function listJsonFiles(targetDir) {
  if (!fs.existsSync(targetDir)) return [];
  return fs
    .readdirSync(targetDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .map((entry) => path.join(targetDir, entry.name));
}

const registry = readJson(registryPath);
const releases = Array.isArray(registry.releases) ? registry.releases : [];
const boundaries = Array.isArray(registry.boundaries) ? registry.boundaries : [];
const frozenBoundaries = boundaries.filter((boundary) => boundary.frozen === true || boundary.status === 'frozen');
const failures = [];

const releaseSnapshots = [];
for (const release of releases) {
  const releaseDir = path.join(releaseRoot, releaseDirName(release.id));
  const releaseSnapshotPath = path.join(releaseDir, 'release.snapshot.json');
  const publishedSnapshotPath = path.join(releaseDir, 'published.snapshot.json');
  const required = [{ kind: 'release_snapshot', path: releaseSnapshotPath }];
  if (release.status === 'published') {
    required.push({ kind: 'published_snapshot', path: publishedSnapshotPath });
  }

  for (const expected of required) {
    if (!fs.existsSync(expected.path)) {
      failures.push(`missing ${expected.kind} for ${release.id}: ${relPath(expected.path)}`);
      continue;
    }
    const snapshot = readJson(expected.path);
    if (snapshot.kind !== expected.kind) {
      failures.push(`${relPath(expected.path)} kind ${snapshot.kind} does not match ${expected.kind}`);
    }
    if (snapshot.release?.id !== release.id) {
      failures.push(`${relPath(expected.path)} release id ${snapshot.release?.id} does not match ${release.id}`);
    }
    if (snapshot.release?.boundary_id !== release.boundary_id) {
      failures.push(`${relPath(expected.path)} boundary ${snapshot.release?.boundary_id} does not match ${release.boundary_id}`);
    }
    releaseSnapshots.push({
      release_id: release.id,
      live_status: release.status,
      kind: expected.kind,
      path: relPath(expected.path),
      sha256: sha256File(expected.path),
      snapshot_status: snapshot.release?.status ?? null,
      boundary_id: snapshot.release?.boundary_id ?? null,
    });
  }
}

const boundarySnapshots = [];
const expectedBoundarySnapshotPaths = new Set();
for (const boundary of frozenBoundaries) {
  const snapshotPath = path.join(boundaryRoot, boundarySnapshotName(boundary.id));
  expectedBoundarySnapshotPaths.add(snapshotPath);
  if (!fs.existsSync(snapshotPath)) {
    failures.push(`missing boundary snapshot for ${boundary.id}: ${relPath(snapshotPath)}`);
    continue;
  }
  const snapshot = readJson(snapshotPath);
  if (snapshot.kind !== 'boundary_snapshot') {
    failures.push(`${relPath(snapshotPath)} kind ${snapshot.kind} does not match boundary_snapshot`);
  }
  if (snapshot.boundary?.id !== boundary.id) {
    failures.push(`${relPath(snapshotPath)} boundary id ${snapshot.boundary?.id} does not match ${boundary.id}`);
  }
  if (snapshot.boundary?.frozen !== true) {
    failures.push(`${relPath(snapshotPath)} boundary snapshot is not frozen`);
  }
  boundarySnapshots.push({
    boundary_id: boundary.id,
    path: relPath(snapshotPath),
    sha256: sha256File(snapshotPath),
    feature_count: Array.isArray(snapshot.boundary?.feature_ids) ? snapshot.boundary.feature_ids.length : 0,
    profile_count: Array.isArray(snapshot.boundary?.profile_ids) ? snapshot.boundary.profile_ids.length : 0,
  });
}

const extraBoundarySnapshots = listJsonFiles(boundaryRoot).filter((snapshotPath) => !expectedBoundarySnapshotPaths.has(snapshotPath));
for (const snapshotPath of extraBoundarySnapshots) {
  const snapshot = readJson(snapshotPath);
  if (snapshot.kind !== 'boundary_snapshot' || !boundaries.some((boundary) => boundary.id === snapshot.boundary?.id)) {
    failures.push(`unexpected boundary snapshot artifact: ${relPath(snapshotPath)}`);
  }
}

const report = {
  generated_at: new Date().toISOString(),
  registry_path: relPath(registryPath),
  release_count: releases.length,
  frozen_boundary_count: frozenBoundaries.length,
  release_snapshots: releaseSnapshots.sort((left, right) => `${left.release_id}:${left.kind}`.localeCompare(`${right.release_id}:${right.kind}`)),
  boundary_snapshots: boundarySnapshots.sort((left, right) => left.boundary_id.localeCompare(right.boundary_id)),
  failures,
};

if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (failures.length > 0) {
  fail(`Release snapshot validation failed: ${failures.join('; ')}`);
}

console.log(
  `Release snapshot validation passed: ${releaseSnapshots.length} release snapshots and ${boundarySnapshots.length} boundary snapshots indexed.`,
);
