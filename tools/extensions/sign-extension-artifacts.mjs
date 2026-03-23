import { webcrypto } from 'node:crypto';
import path from 'node:path';
import {
  collectFiles,
  ensureDir,
  hashFile,
  isCliEntry,
  pathExists,
  readJson,
  repoRoot,
  writeJson,
  writeText,
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

function bytesToBase64Url(bytes) {
  return Buffer.from(bytes).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function loadOrCreateSigner() {
  if (process.env.EXTENSION_SIGNER_PRIVATE_JWK) {
    const privateKeyJwk = JSON.parse(process.env.EXTENSION_SIGNER_PRIVATE_JWK);
    const publicKeyJwk = process.env.EXTENSION_SIGNER_PUBLIC_JWK ? JSON.parse(process.env.EXTENSION_SIGNER_PUBLIC_JWK) : null;
    return {
      keyId: process.env.EXTENSION_SIGNER_KEY_ID ?? 'env-ecdsa-p256-sha256',
      label: process.env.EXTENSION_SIGNER_LABEL ?? 'Environment signer',
      publisher: process.env.EXTENSION_SIGNER_PUBLISHER ?? 'external',
      privateKeyJwk,
      publicKeyJwk,
    };
  }

  const keyPair = await webcrypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify'],
  );
  const privateKeyJwk = await webcrypto.subtle.exportKey('jwk', keyPair.privateKey);
  const publicKeyJwk = await webcrypto.subtle.exportKey('jwk', keyPair.publicKey);
  return {
    keyId: 'dev-ecdsa-p256-sha256',
    label: 'Development sample signer',
    publisher: 'demo-catalog',
    privateKeyJwk,
    publicKeyJwk,
  };
}

async function signManifest(manifest, signer) {
  const privateKey = await webcrypto.subtle.importKey(
    'jwk',
    signer.privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const signature = await webcrypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    textEncoder.encode(canonicalizeJson(manifest)),
  );
  return {
    schemaVersion: 1,
    manifest,
    signature: {
      keyId: signer.keyId,
      algorithm: 'ecdsa-p256-sha256',
      signature: bytesToBase64Url(new Uint8Array(signature)),
      signedAt: new Date().toISOString(),
    },
  };
}

export async function signExtensionArtifacts() {
  const artifactsRoot = path.join(repoRoot, 'artifacts', 'extensions');
  const indexPath = path.join(artifactsRoot, 'index.json');
  const catalogPath = path.join(artifactsRoot, 'catalog.json');
  const index = await readJson(indexPath);
  const catalog = (await pathExists(catalogPath)) ? await readJson(catalogPath) : { extensions: [] };
  const signer = await loadOrCreateSigner();
  const signedEntries = [];

  for (const artifact of index.artifacts ?? []) {
    const artifactDir = path.join(repoRoot, artifact.artifactPath);
    const manifestPath = path.join(artifactDir, 'manifest.json');
    if (!(await pathExists(manifestPath))) {
      continue;
    }

    const manifest = await readJson(manifestPath);
    const signedManifest = await signManifest(manifest, signer);
    await writeJson(path.join(artifactDir, 'signed-manifest.json'), signedManifest);

    const files = await collectFiles(artifactDir, { includeDotFiles: true, skip: new Set(['node_modules']) });
    const digests = [];
    for (const file of files) {
      const relativeFile = path.relative(artifactDir, file).split(path.sep).join('/');
      digests.push({
        path: relativeFile,
        sha256: await hashFile(file),
      });
    }

    const integrity = {
      generatedAt: new Date().toISOString(),
      artifact,
      files: digests,
      provenance: {
        gitSha: process.env.GITHUB_SHA ?? null,
        gitRef: process.env.GITHUB_REF ?? null,
        workflow: process.env.GITHUB_WORKFLOW ?? null,
      },
      signer: {
        keyId: signer.keyId,
        label: signer.label,
        publisher: signer.publisher,
      },
    };
    await writeJson(path.join(artifactDir, 'integrity.json'), integrity);
    await writeText(
      path.join(artifactDir, 'SHA256SUMS.txt'),
      digests.map((digest) => `${digest.sha256}  ${digest.path}`).join('\n') + '\n',
    );

    signedEntries.push({
      id: artifact.id,
      packageName: artifact.packageName,
      version: artifact.version,
      artifactPath: artifact.artifactPath,
      digestCount: digests.length,
      signedManifestPath: `${artifact.artifactPath}/signed-manifest.json`,
    });
  }

  const trustPolicySample = {
    allowUnsigned: false,
    allowIntegrityOnly: false,
    allowedPublishers: Array.from(new Set((catalog.extensions ?? []).map((entry) => entry.publisher).filter(Boolean))).sort(),
    allowedPackageNames: Array.from(new Set((catalog.extensions ?? []).map((entry) => entry.packageName).filter(Boolean))).sort(),
    allowedExtensionIds: Array.from(new Set((catalog.extensions ?? []).map((entry) => entry.extensionId).filter(Boolean))).sort(),
    trustedSigners: [
      {
        keyId: signer.keyId,
        algorithm: 'ecdsa-p256-sha256',
        publicKeyJwk: signer.publicKeyJwk,
        publisher: signer.publisher,
        label: signer.label,
      },
    ],
  };

  await writeJson(path.join(artifactsRoot, 'public-signers.json'), {
    generatedAt: new Date().toISOString(),
    signers: trustPolicySample.trustedSigners,
    note: 'Public keys for verifying signed extension manifests generated by the current artifact signing run.',
  });
  await writeJson(path.join(artifactsRoot, 'trust-policy.sample.json'), trustPolicySample);

  const report = {
    generatedAt: new Date().toISOString(),
    signer: 'tools/extensions/sign-extension-artifacts.mjs',
    ok: true,
    signedEntries,
    note: 'This checkpoint generates ECDSA P-256 signed manifests plus SHA-256 integrity metadata. Production deployments should inject a managed signing key through CI secrets or HSM-backed workflows.',
  };

  await ensureDir(path.join(repoRoot, 'artifacts', 'conformance', 'latest'));
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'extension-artifact-integrity.json'), report);
  await writeJson(path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'extension-trust-policy.json'), trustPolicySample);

  return report;
}

async function main() {
  const report = await signExtensionArtifacts();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}

if (isCliEntry(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
