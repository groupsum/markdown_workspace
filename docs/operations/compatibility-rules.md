# Compatibility rules

## Purpose

This document defines repository-internal compatibility requirements across contracts, host/runtime, themes, renderer/editor packages, and extensions.

## Compatibility dimensions

### Manifest compatibility
Every extension manifest must declare:
- manifest schema version
- host API compatibility
- runtime compatibility

Optional compatibility dimensions:
- app version
- theme contract version
- renderer version
- editor version

### Host/runtime compatibility
The runtime must reject activation when:
- manifest version is unsupported
- required host API range is not satisfied
- required runtime range is not satisfied
- required capability grants are unavailable

### Theme compatibility
Themes and theme-aware extensions should declare compatibility with the published theme contract version.

### Renderer/editor compatibility
Renderer/editor packages must declare compatibility with their peer environment where relevant, especially React bindings.

### External artifact compatibility
External installable extensions must also pass:
- catalog document validation
- trust-policy evaluation
- manifest signature verification unless trust policy explicitly allows otherwise
- module integrity verification

## Compatibility evaluation order

1. catalog entry validation (external only)
2. manifest schema validation
3. signature and integrity verification (external only)
4. contract version evaluation
5. package version/range evaluation
6. capability evaluation
7. activation

## Baselines established in this checkpoint

- extension manifest version baseline: `1`
- extension host API baseline: `1.0.0`
- extension runtime baseline: `1.0.0`
- theme contract baseline: `1.0.0`
- signed-manifest schema version baseline: `1`

## Compatibility evidence now present

The checkpoint now includes:
- schema validation results
- compatibility matrix tests
- negative tests for rejected incompatible packages
- negative tests for rejected untrusted or integrity-failing external artifacts

## Compatibility evidence still outside this checkpoint

Independent certification evidence would still need:
- external audit of the compatibility policy itself
- documented long-term upgrade guidance for breaking changes
- broader client/browser compatibility execution in target environments
