import fs from 'node:fs';
import path from 'node:path';
import { fail, repoRoot } from './common.mjs';

const registryPath = repoRoot('.ssot/registry.json');
const defaultReportPath = repoRoot('.ssot/reports/spec-coverage-index.json');
const writeReport = process.argv.includes('--write-report');

function readRegistry() {
  try {
    return JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch (error) {
    fail(`Unable to read SSOT registry at ${registryPath}: ${error.message}`);
  }
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function isActiveInScopeFeature(feature) {
  return feature?.lifecycle?.stage === 'active' && feature?.plan?.horizon !== 'out_of_bounds';
}

function areaFromFeatureId(featureId) {
  const normalized = String(featureId).replace(/^feat:/, '');
  const [first = 'unknown', second] = normalized.split('-');
  if (['client', 'desktop', 'extension', 'lander', 'markdown', 'preview', 'workspace', 'uix', 'repo', 'ssot'].includes(first)) {
    return second ? `${first}-${second}` : first;
  }
  return first;
}

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

const registry = readRegistry();
const specsById = new Map(asArray(registry.specs).map((spec) => [spec.id, spec]));
const activeFeatures = asArray(registry.features).filter(isActiveInScopeFeature);
const missingSpecLinks = [];
const unknownSpecReferences = [];
const areas = new Map();

for (const feature of activeFeatures) {
  const specIds = asArray(feature.spec_ids);
  const areaId = areaFromFeatureId(feature.id);
  const area = areas.get(areaId) ?? {
    id: areaId,
    featureIds: new Set(),
    specIds: new Set(),
    adrIds: new Set(),
    missingSpecFeatureIds: new Set(),
    unknownSpecIds: new Set(),
  };

  area.featureIds.add(feature.id);
  if (specIds.length === 0) {
    missingSpecLinks.push(feature.id);
    area.missingSpecFeatureIds.add(feature.id);
  }

  for (const specId of specIds) {
    area.specIds.add(specId);
    const spec = specsById.get(specId);
    if (!spec) {
      unknownSpecReferences.push({ featureId: feature.id, specId });
      area.unknownSpecIds.add(specId);
      continue;
    }
    for (const adrId of asArray(spec.adr_ids)) {
      area.adrIds.add(adrId);
    }
  }

  areas.set(areaId, area);
}

const areaSummaries = sorted(areas.keys()).map((areaId) => {
  const area = areas.get(areaId);
  return {
    id: area.id,
    feature_count: area.featureIds.size,
    spec_count: area.specIds.size,
    adr_count: area.adrIds.size,
    feature_ids: sorted(area.featureIds),
    spec_ids: sorted(area.specIds),
    adr_ids: sorted(area.adrIds),
    missing_spec_feature_ids: sorted(area.missingSpecFeatureIds),
    unknown_spec_ids: sorted(area.unknownSpecIds),
  };
});

const report = {
  generated_at: new Date().toISOString(),
  registry_path: path.relative(process.cwd(), registryPath).replaceAll('\\', '/'),
  active_in_scope_feature_count: activeFeatures.length,
  spec_count: specsById.size,
  adr_count: asArray(registry.adrs).length,
  missing_spec_links: sorted(missingSpecLinks),
  unknown_spec_references: unknownSpecReferences.sort((left, right) =>
    `${left.featureId}:${left.specId}`.localeCompare(`${right.featureId}:${right.specId}`),
  ),
  areas: areaSummaries,
};

if (writeReport) {
  fs.mkdirSync(path.dirname(defaultReportPath), { recursive: true });
  fs.writeFileSync(defaultReportPath, `${JSON.stringify(report, null, 2)}\n`);
}

if (missingSpecLinks.length > 0 || unknownSpecReferences.length > 0) {
  const details = [
    missingSpecLinks.length > 0 ? `features missing SPEC links: ${missingSpecLinks.join(', ')}` : null,
    unknownSpecReferences.length > 0
      ? `unknown SPEC references: ${unknownSpecReferences.map((entry) => `${entry.featureId}->${entry.specId}`).join(', ')}`
      : null,
  ].filter(Boolean);
  fail(`SPEC coverage index validation failed: ${details.join('; ')}`);
}

console.log(
  `SPEC coverage index validation passed: ${activeFeatures.length} active in-scope features across ${areaSummaries.length} areas.`,
);
