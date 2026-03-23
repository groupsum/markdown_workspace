# Publishing rules

## Purpose

This document defines publication and distribution rules for reusable packages and extensions.

## Rule 1 — reusable code ships as npm packages

All reusable package families under `packages/` must be publishable npm packages when implemented.

Examples:
- contract packages
- renderer packages
- editor packages
- extension packages
- shared primitive packages

## Rule 2 — package metadata must be complete

A publishable package must provide at minimum:
- scoped package name
- semantic version
- license
- export map
- build output
- README
- publish configuration
- supportable Node/toolchain range

## Rule 3 — packages must compile before publication

A package must build successfully and emit its declared exports before it may be published.

## Rule 4 — runtime browser installation is not raw npm install

A browser host does not install external extensions by running `npm install` at runtime.

Instead:
- authors publish extension source packages to npm
- CI builds browser-ready ESM artifacts
- CI emits `catalog.json`, `manifest.json`, `signed-manifest.json`, `integrity.json`, and signer/trust metadata
- the client/runtime installs those artifacts through a catalog/manifest flow

## Rule 5 — bundled extensions are ordinary workspace/npm dependencies

First-party bundled extensions are installed at build time through the workspace package manager and shipped with the application.

## Rule 6 — external artifacts must be verifiable

Externally installable extension artifacts must provide:
- an external manifest with `kind: "external"`
- `distribution.channel: "catalog"`
- a browser-ready ESM entry module
- integrity metadata for manifest and module payloads
- a signed manifest compatible with the trusted signer model

## Rule 7 — publication requires documented compatibility

Each publishable package must declare the compatibility dimensions relevant to its surface.

## Rule 8 — package boundaries remain normative after publication

Publishing a package does not relax dependency-boundary rules. Packages must remain app-independent unless they are applications.

## Rule 9 — source packages and installable artifacts are separate deliverables

For third-party extensions:
- npm package publication distributes source/build artifacts for developers and CI
- browser-installable catalog artifacts distribute the runtime-consumable payload for the client

## Phase 13 operational baseline

This repository checkpoint now includes:
- publishable contract, shared, renderer, editor, and extension packages
- a sample publishable external extension package
- Changesets configuration for versioning and publish orchestration
- package dry-run pack evidence generation
- extension browser-installable artifact generation
- signed-manifest generation
- integrity and signer metadata generation
- trust-policy sample generation
- external artifact validation integrated into conformance

What remains outside this checkpoint:
- production-grade key custody and rotation
- live hosted catalog/CDN publication from this container
- independent external certification
