# Third-party extension authoring

## Purpose

This document explains how an external author ships a Markdown Workspace extension through the formal catalog path.

## Author workflow

1. author the extension as a normal npm package
2. export a valid Markdown Workspace extension manifest and lifecycle entry
3. publish the source/build package to npm for developer consumption
4. build browser-installable ESM output through CI
5. generate `manifest.json`, `signed-manifest.json`, `installable.json`, and integrity files
6. publish the catalog entry and signer metadata to the artifact host/CDN
7. submit the extension for trust-policy allowlisting and certification review if required

## Required package structure

At minimum, the source package should contain:
- `package.json`
- `README.md`
- `src/manifest.ts`
- `src/index.ts`
- tests for manifest, lifecycle, and runtime behavior

## Manifest requirements

External extensions must declare:
- `kind: "external"`
- `distribution.channel: "catalog"`
- compatibility declarations
- capabilities
- i18n metadata
- settings schema when configurable

## Artifact publication model

The browser host installs from generated artifacts, not from the npm tarball directly.

Recommended artifact publication outputs:
- catalog document
- signed manifest
- integrity manifest
- public signer metadata
- ESM module assets

## Trust expectations

An extension should expect the host/runtime to enforce:
- publisher allowlists
- package-name allowlists
- extension-id allowlists
- signer allowlists
- integrity verification

## Sample package in this repository

The repository includes a reference external package:
- `packages/extensions/extension-catalog-hello/`

Use it as the reference for:
- manifest structure
- external distribution metadata
- build output expectations
- runtime install/update/remove testing

## Certification preparation

Before requesting approval for broader distribution, an author should complete the checklist in:
- `docs/conformance/extension-certification-checklist.md`
