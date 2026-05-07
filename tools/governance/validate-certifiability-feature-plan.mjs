import fs from 'node:fs';
import path from 'node:path';
import { fail, repoRoot } from './common.mjs';

const registryPath = repoRoot('.ssot/registry.json');
const reportPath = repoRoot('.ssot/reports/certifiability-feature-plan.json');
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

function sorted(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function domainFor(feature) {
  const id = feature.id.replace(/^feat:/, '');
  const title = `${feature.title} ${feature.description ?? ''}`.toLowerCase();
  if (id.startsWith('lander-aeo') || id.startsWith('lander-aieo') || id.startsWith('lander-seo') || title.includes('seo') || title.includes('aeo') || title.includes('aieo')) return 'lander-discovery';
  if (id.startsWith('lander-')) return 'lander-content';
  if (id.startsWith('desktop') || id.includes('filesystem') || title.includes('desktop')) return 'desktop-shell';
  if (id.startsWith('mobile') || title.includes('mobile')) return 'mobile-uix';
  if (id.startsWith('editor') || id.startsWith('preview') || title.includes('toolbar')) return 'editor-preview';
  if (id.includes('markdown') || id.includes('profile') || id.includes('commonmark') || id.includes('gfm') || id.includes('cfm')) return 'markdown-profiles';
  if (id.startsWith('extension') || id.includes('git-ops') || id.includes('oidc')) return 'extensions-git-oidc';
  if (id.startsWith('workspace') || id.includes('persistence') || id.includes('indexeddb')) return 'workspace-persistence';
  if (id.startsWith('uix') || id.includes('responsive')) return 'uix-responsive';
  if (id.startsWith('repo') || id.startsWith('ssot') || id.includes('governance') || id.includes('package-publish') || id.includes('readme')) return 'repo-governance';
  return 'product-surface';
}

function phaseFor(domain) {
  const phases = {
    'repo-governance': 'phase-2-repo-governance-and-hygiene',
    'markdown-profiles': 'phase-3-markdown-profile-conformance',
    'editor-preview': 'phase-4-editor-and-preview-completion',
    'workspace-persistence': 'phase-5-persistence-and-workspace-state',
    'uix-responsive': 'phase-6-uix-responsive-and-mobile',
    'mobile-uix': 'phase-6-uix-responsive-and-mobile',
    'desktop-shell': 'phase-7-desktop-shell',
    'extensions-git-oidc': 'phase-8-extensions-git-and-oidc',
    'lander-discovery': 'phase-9-lander-seo-aeo-aieo',
    'lander-content': 'phase-9-lander-seo-aeo-aieo',
  };
  return phases[domain] ?? 'phase-10-certification-closure';
}

function dispositionFor(feature) {
  if (feature.plan?.horizon === 'out_of_bounds') return 'out_of_bounds';
  if (feature.lifecycle?.stage && feature.lifecycle.stage !== 'active') return 'excluded_non_active';
  return 'in_bounds_unresolved';
}

function proofStateFor(feature, claimsById, testsById, evidenceById) {
  const claimIds = asArray(feature.claim_ids);
  const testIds = asArray(feature.test_ids);
  const claimRows = claimIds.map((id) => claimsById.get(id)).filter(Boolean);
  const testRows = testIds.map((id) => testsById.get(id)).filter(Boolean);
  const linkedEvidenceIds = new Set();

  for (const claim of claimRows) {
    for (const evidenceId of asArray(claim.evidence_ids)) linkedEvidenceIds.add(evidenceId);
  }
  for (const test of testRows) {
    for (const evidenceId of asArray(test.evidence_ids)) linkedEvidenceIds.add(evidenceId);
  }

  const evidenceRows = [...linkedEvidenceIds].map((id) => evidenceById.get(id)).filter(Boolean);
  const passingTests = testRows.filter((test) => test.status === 'passing').length;
  const passingEvidence = evidenceRows.filter((evidence) => evidence.status === 'passed' || evidence.status === 'collected').length;

  return {
    claim_count: claimIds.length,
    test_count: testIds.length,
    linked_evidence_count: evidenceRows.length,
    passing_test_count: passingTests,
    passing_or_collected_evidence_count: passingEvidence,
    missing_claims: claimIds.length === 0,
    missing_tests: testIds.length === 0,
    missing_evidence: evidenceRows.length === 0,
    has_nonpassing_tests: testRows.some((test) => test.status !== 'passing'),
    has_nonpassing_evidence: evidenceRows.some((evidence) => !['passed', 'collected'].includes(evidence.status)),
  };
}

const registry = readJson(registryPath);
const features = asArray(registry.features);
const claimsById = new Map(asArray(registry.claims).map((claim) => [claim.id, claim]));
const testsById = new Map(asArray(registry.tests).map((test) => [test.id, test]));
const evidenceById = new Map(asArray(registry.evidence).map((evidence) => [evidence.id, evidence]));
const unresolved = features.filter((feature) => ['absent', 'partial'].includes(feature.implementation_status));

const items = unresolved.map((feature) => {
  const domain = domainFor(feature);
  const disposition = dispositionFor(feature);
  return {
    id: feature.id,
    title: feature.title,
    implementation_status: feature.implementation_status,
    lifecycle_stage: feature.lifecycle?.stage ?? null,
    horizon: feature.plan?.horizon ?? null,
    disposition,
    domain,
    phase: disposition === 'in_bounds_unresolved' ? phaseFor(domain) : 'phase-0-truth-freeze',
    spec_ids: sorted(asArray(feature.spec_ids)),
    claim_ids: sorted(asArray(feature.claim_ids)),
    test_ids: sorted(asArray(feature.test_ids)),
    requires: sorted(asArray(feature.requires)),
    proof_state: proofStateFor(feature, claimsById, testsById, evidenceById),
  };
}).sort((left, right) => `${left.phase}:${left.domain}:${left.id}`.localeCompare(`${right.phase}:${right.domain}:${right.id}`));

const summary = {
  total_features: features.length,
  implemented_features: features.filter((feature) => feature.implementation_status === 'implemented').length,
  absent_features: features.filter((feature) => feature.implementation_status === 'absent').length,
  partial_features: features.filter((feature) => feature.implementation_status === 'partial').length,
  unresolved_features: unresolved.length,
  in_bounds_unresolved: items.filter((item) => item.disposition === 'in_bounds_unresolved').length,
  out_of_bounds: items.filter((item) => item.disposition === 'out_of_bounds').length,
};

const countsByPhase = {};
const countsByDomain = {};
const proofGaps = {
  missing_claims: [],
  missing_tests: [],
  missing_evidence: [],
  nonpassing_tests: [],
  nonpassing_evidence: [],
};

for (const item of items) {
  countsByPhase[item.phase] = (countsByPhase[item.phase] ?? 0) + 1;
  countsByDomain[item.domain] = (countsByDomain[item.domain] ?? 0) + 1;
  if (item.disposition !== 'in_bounds_unresolved') continue;
  if (item.proof_state.missing_claims) proofGaps.missing_claims.push(item.id);
  if (item.proof_state.missing_tests) proofGaps.missing_tests.push(item.id);
  if (item.proof_state.missing_evidence) proofGaps.missing_evidence.push(item.id);
  if (item.proof_state.has_nonpassing_tests) proofGaps.nonpassing_tests.push(item.id);
  if (item.proof_state.has_nonpassing_evidence) proofGaps.nonpassing_evidence.push(item.id);
}

const report = {
  generated_at: new Date().toISOString(),
  registry_path: path.relative(process.cwd(), registryPath).replaceAll('\\', '/'),
  certification_state: summary.unresolved_features === 0 ? 'certifiable_feature_complete' : 'not_certifiable_feature_incomplete',
  summary,
  counts_by_phase: Object.fromEntries(Object.entries(countsByPhase).sort(([left], [right]) => left.localeCompare(right))),
  counts_by_domain: Object.fromEntries(Object.entries(countsByDomain).sort(([left], [right]) => left.localeCompare(right))),
  proof_gaps: Object.fromEntries(Object.entries(proofGaps).map(([key, value]) => [key, sorted(value)])),
  items,
};

if (items.length !== summary.unresolved_features) {
  fail('Certifiability feature plan did not classify every unresolved feature.');
}

if (writeReport) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

console.log(`Certifiability feature plan ${report.certification_state}: ${summary.unresolved_features} unresolved features classified across ${Object.keys(countsByPhase).length} phases.`);
