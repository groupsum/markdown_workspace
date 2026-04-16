# ADR-1002: ADR-0002: extension runtime and manifest

# ADR-0002: extension runtime and manifest

- Status: Accepted
- Date: 2026-03-20

## Context

The client must support installable, configurable, localizable extensions with services, components, views, hooks, icons, and action-rail integration.

## Decision

Adopt a hosted extension runtime with:
- a formal extension manifest contract
- a stable host API
- lifecycle-driven activation/deactivation
- contribution registries for commands, views, rail entries, and settings
- bundled first-party extensions plus future external installable extensions

## Consequences

- extensions become first-class publishable npm packages
- the client shell must be refactored into registries/providers
- extension settings and diagnostics become part of the runtime surface
