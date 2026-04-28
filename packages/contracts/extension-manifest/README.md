# mdwrk/extension-manifest

Normative manifest, catalog, signature, settings, capability, i18n, icon, contribution, distribution, integrity, support, and compatibility contracts for MdWork extensions.

## Package purpose

This package is the authoring source of truth for extension metadata and manifest structure.

## What it exports

- manifest version constants
- extension manifest interface
- capabilities
- advisory capability preset descriptors and composition helpers
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

## Capability Presets

`capabilities` remain the runtime permission boundary. Presets are authoring and testing shortcuts only: they recommend API capabilities, workspace-module shape profiles, and contribution kinds, but they do not grant permissions and do not block activation.

Use `capabilityPresetIds` on a manifest or workspace module to communicate the intended profile set. Use `composeCapabilityPresetSet`, `recommendCapabilityPresets`, and `evaluateCapabilityPresetSet` in tests/docs to check advisory gaps without changing runtime security policy.

## Build

```bash
npm run build -w @mdwrk/extension-manifest
```

## Publishability

This package is structured as a standalone publishable npm package with typed exports and generated build output under `dist/`.
