# @mdwrk/extension-manifest

Normative manifest, catalog, signature, settings, capability, i18n, icon, contribution, distribution, integrity, support, and compatibility contracts for Markdown Workspace extensions.

## Package purpose

This package is the authoring source of truth for extension metadata and manifest structure.

## What it exports

- manifest version constants
- extension manifest interface
- capabilities
- contribution descriptors
- settings schema types
- i18n label types
- icon descriptors
- compatibility declarations
- distribution and integrity metadata
- support declaration types
- external catalog document types
- signed-manifest and trusted-signer types

## Intended consumers

- extension packages
- extension runtime packages
- manifest validators
- catalog/signing tooling
- documentation and schema tooling

## Build

```bash
npm run build -w @mdwrk/extension-manifest
```

## Publishability

This package is structured as a standalone publishable npm package with typed exports and generated build output under `dist/`.
