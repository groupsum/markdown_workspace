# MdWrk migration status

## Summary

This repository is operating as the MdWrk workspace and package platform.

- published npm package scope remains the valid npm scope `@mdwrk/*`
- human-readable package references are standardized as `mdwrk/*`
- user-facing branding is standardized as `MdWrk` or `MdWrk`
- package metadata now points at the MdWrk organization website (`https://mdwrk.com`)
- package authorship metadata now uses `Jacob Stewart <jacob@swarmauri.com>`
- no `swarmauri` organization/package references remain in source or docs; the remaining `swarmauri.com` string is the author email supplied for package metadata

## Current repository state

The repository contains:

- a client application and published package at `apps/client` (`@mdwrk/mdwrkspace`)
- a private landing-site workspace at `apps/mdwrkcom` (`@mdwrk/mdwrkcom`)
- legacy bridge releases for extracted contracts, renderer, editor, extension, shared, lander, structured-data, and page-template-demo packages under `packages/*`
- the actively maintained `@mdwrk/mdwrkcom-content-pack` under `packages/content/*`
- example applications under `examples/*`
- generated release, conformance, pack, and extension artifacts under `artifacts/*`

## Extracted package maintenance

The reusable package maintenance surface is now split across three repos:

- `groupsum/markdown_workspace`
  - application surfaces
  - `@mdwrk/mdwrkcom-content-pack`
  - legacy bridge releases for extracted package names
- `groupsum/mdwrk`
  - contracts
  - shared primitives except `@mdwrk/structured-data`
  - renderer
  - editor
  - extension packages
- `groupsum/mdwrk-pages`
  - lander packages
  - `@mdwrk/structured-data`
  - `@mdwrk/page-template-demo-content-pack`

## Bridge release policy

When a package has moved to `mdwrk` or `mdwrk-pages`, `markdown_workspace` keeps a transition release line with these rules:

- the npm package name stays the same
- package metadata points at the extracted repo and exact package directory
- install-time `postinstall` output warns that active maintenance moved
- follow-up feature work lands in the extracted repo, not here

## Package reference convention

Two conventions are used intentionally:

1. **Technical npm specifiers** remain `@mdwrk/*` because scoped npm package identifiers require that syntax.
2. **Human-readable package references** in prose are rendered as `mdwrk/*` per the MdWrk naming convention.

## Verification completed

The following checks were executed successfully on March 26, 2026:

### Build verification

- TypeScript builds succeeded for all contract, shared, renderer, editor, and extension packages.
- `apps/client` application build was verified with:
  - `npx tsc -p apps/client/tsconfig.json`
  - `cd apps/client && npx vite build`
- `apps/client` library build was verified with:
  - `npm run build:lib -w apps/client`
- `apps/mdwrkcom` build was verified with:
  - `npm run build -w apps/mdwrkcom`
- example builds were verified with:
  - `npm run build -w @mdwrk/example-renderer-basic`
  - `npm run build -w @mdwrk/example-editor-basic`

### Conformance and release verification

- `npm run validate:manifests`
- `npm run validate:compatibility`
- `npm run validate:boundaries`
- `npm run validate:exports`
- `npm run extension:bundle`
- `npm run extension:sign`
- `npm run validate:extension-artifacts`
- `npm run conformance`
- `npm run ci:package-matrices`
- `npm run pack:packages`
- `npm run release:evidence`

All of the commands above completed successfully in this updated checkpoint.

## Important build-output note

`apps/client` uses the same `dist/` directory for both the browser application build and the publishable library build. Because of that, whichever of `build` or `build:lib` runs last will determine the final contents of `apps/client/dist/`.

In this checkpoint, `build:lib` was run last so that the packaged MdWrk client library output is present in `apps/client/dist/` and matches the package export metadata.

## Compliance note

This repository passes its own build, packaging, and conformance tooling in this checkpoint. That is a meaningful internal validation signal, but it is not an external independent certification of universal RFC compliance.
