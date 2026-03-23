# Changesets configuration

This repository adopts Changesets for workspace package versioning and publish orchestration.

Operational notes for this checkpoint:
- root scripts use `npx @changesets/cli` so the Phase 12 release workflow can run without forcing a lockfile regeneration in this container
- the intended long-term steady state is to pin `@changesets/cli` in the root devDependencies when the workspace lockfile is regenerated on the target Node/npm baseline
- release and publish workflows consume this configuration through:
  - `npm run release:status`
  - `npm run release:version`
  - `npm run publish:packages`

This checkpoint wires the repository for Changesets-based versioning, release notes, and publish automation.
