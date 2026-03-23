# ADR-0005: extension distribution model

- Status: Accepted
- Date: 2026-03-20

## Context

The browser cannot safely or practically perform raw `npm install` of packages at runtime.

## Decision

Use two distribution paths:
- bundled first-party extensions are installed at build time as npm dependencies
- external extensions are authored as npm packages, built in CI into browser-ready ESM artifacts, then installed via signed or integrity-checked manifests/catalogs

## Consequences

- npm remains the authoring and publishing surface for extension developers
- the browser install path is artifact-based, not raw npm-based
- compatibility and integrity checks become part of the extension platform
