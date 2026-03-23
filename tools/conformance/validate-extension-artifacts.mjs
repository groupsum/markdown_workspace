import { webcrypto } from 'node:crypto';
import path from 'node:path';
import {
  hashFile,
  isCliEntry,
  pathExists,
  readJson,
  repoRoot,
  writeJson,
} from '../lib/workspace.mjs';

const textEncoder = new TextEncoder();

function sortJson(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => sortJson(entry));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  return Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .reduce((output, key) => {
      output[key] = sortJson(value[key]);
      return output;
    }, {});
}

function canonicalizeJson(value) {
  return JSON.stringify(sortJson(value));
}

function base64UrlToBytes(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  return new Uint8Array(Buffer.from(padded, 'base64'));
}

async function verifySignedManifest(signedManifest, signer) {
  const key = await webcrypto.subtle.importKey(
    'jwk',
    signer.publicKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['verify'],
  );
  return await webcrypto.subtle.verify(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    base64UrlToBytes(signedManifest.signature.signature),
    textEncoder.encode(canonicalizeJson(signedManifest.manifest)),
  );
}

export async function validateExtensionArtifacts() {
  const artifactsRoot = path.join(repoRoot, 'artifacts', 'extensions');
  const catalogPath = path.join(artifactsRoot, 'catalog.json');
  const signersPath = path.join(artifactsRoot, 'public-signers.json');
  const trustPolicyPath = path.join(artifactsRoot, 'trust-policy.sample.json');

  const catalog = await readJson(catalogPath);
  const publicSigners = await readJson(signersPath);
  const trustPolicy = await readJson(trustPolicyPath);

  const results = [];
  let ok = true;

  for (const entry of catalog.extensions ?? []) {
    const manifestPath = path.join(repoRoot, entry.urls.manifest);
    const signedManifestPath = path.join(repoRoot, entry.urls.signedManifest);
    const modulePath = path.join(repoRoot, entry.urls.module);
    const outcome = {
      entryId: entry.entryId,
      extensionId: entry.extensionId,
      manifestExists: await pathExists(manifestPath),
      signedManifestExists: await pathExists(signedManifestPath),
      moduleExists: await pathExists(modulePath),
      manifestIntegrityVerified: false,
      moduleIntegrityVerified: false,
      signatureVerified: false,
      trustedBySamplePolicy: false,
      issues: [],
    };

    if (!outcome.manifestExists) {
      outcome.issues.push(`Missing manifest '${entry.urls.manifest}'.`);
    }
    if (!outcome.signedManifestExists) {
      outcome.issues.push(`Missing signed manifest '${entry.urls.signedManifest}'.`);
    }
    if (!outcome.moduleExists) {
      outcome.issues.push(`Missing module '${entry.urls.module}'.`);
    }

    if (outcome.manifestExists && entry.integrity?.manifest) {
      const digest = await hashFile(manifestPath);
      outcome.manifestIntegrityVerified = digest === entry.integrity.manifest.digest;
      if (!outcome.manifestIntegrityVerified) {
        outcome.issues.push(`Manifest integrity mismatch for '${entry.entryId}'.`);
      }
    }

    if (outcome.moduleExists && entry.integrity?.module) {
      const digest = await hashFile(modulePath);
      outcome.moduleIntegrityVerified = digest === entry.integrity.module.digest;
      if (!outcome.moduleIntegrityVerified) {
        outcome.issues.push(`Module integrity mismatch for '${entry.entryId}'.`);
      }
    }

    if (outcome.manifestExists && outcome.signedManifestExists) {
      const manifest = await readJson(manifestPath);
      const signedManifest = await readJson(signedManifestPath);
      if (canonicalizeJson(manifest) !== canonicalizeJson(signedManifest.manifest)) {
        outcome.issues.push(`Signed manifest payload mismatch for '${entry.entryId}'.`);
      } else {
        const signer = (publicSigners.signers ?? []).find((candidate) => candidate.keyId === signedManifest.signature?.keyId);
        if (!signer) {
          outcome.issues.push(`No public signer registered for '${entry.entryId}'.`);
        } else {
          outcome.signatureVerified = await verifySignedManifest(signedManifest, signer);
          if (!outcome.signatureVerified) {
            outcome.issues.push(`Signature verification failed for '${entry.entryId}'.`);
          }
        }
      }
    }

    outcome.trustedBySamplePolicy =
      (trustPolicy.allowedPublishers ?? []).includes(entry.publisher) &&
      (trustPolicy.allowedPackageNames ?? []).includes(entry.packageName) &&
      (trustPolicy.allowedExtensionIds ?? []).includes(entry.extensionId);
    if (!outcome.trustedBySamplePolicy) {
      outcome.issues.push(`Sample trust policy does not allow '${entry.entryId}'.`);
    }

    if (outcome.issues.length > 0) {
      ok = false;
    }
    results.push(outcome);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    ok,
    catalogEntries: results,
  };

  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'extension-artifact-validation.json'), report);
  return report;
}

async function main() {
  const report = await validateExtensionArtifacts();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) {
    process.exitCode = 1;
  }
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
