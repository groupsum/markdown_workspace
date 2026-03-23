# Release automation

Date: 2026-03-22

## Purpose

This document defines the Phase 13 release and publish automation baseline.

## Versioning tool

The repository adopts **Changesets** for multi-package versioning and publish orchestration.

Configuration lives in:
- `.changeset/config.json`
- `.changeset/README.md`

Root release scripts:
- `npm run release:status`
- `npm run release:version`
- `npm run publish:packages`
- `npm run release:evidence`
- `npm run release:prepare`

## Package publish flow

`publish-packages.yml` performs:
- workspace install
- workspace verification
- dry-run pack evidence generation
- release evidence generation
- Changesets versioning or publication

## Extension artifact flow

`publish-extensions.yml` performs:
- extension package build
- browser-installable ESM artifact generation
- signed-manifest generation
- integrity manifest generation
- upload of catalog and signer/trust metadata
- GitHub provenance attestation of the extension artifact bundle

## Release evidence flow

`release.yml` performs:
- package pack generation
- extension artifact generation
- signed-manifest/integrity generation
- conformance evidence generation
- release evidence aggregation
- evidence tarball creation
- optional GitHub release creation with attached evidence bundle

## Current state

This checkpoint wires the release automation surface and evidence generation path, including the external-extension artifact format.
It does **not** claim that package publication, hosted catalog publication, or release evidence publication has been fully exercised from this container.
