# ADR-1003: ADR-0003: renderer/editor package split

# ADR-0003: renderer/editor package split

- Status: Accepted
- Date: 2026-03-20

## Context

The current repository duplicates markdown rendering and embeds editing behavior directly in the client.

## Decision

Create separate package families for:
- markdown renderer
- markdown editor

Do not combine them into a single monolithic package.

## Consequences

- renderer can be adopted independently by apps that do not need editing
- editor can evolve independently from rendering
- both packages can share theme contracts without depending on app-local styles
