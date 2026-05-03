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
- a private landing-site workspace at `apps/lander` (`@mdwrk/lander`)
- shared contracts, renderer, editor, extension, and shared utility packages under `packages/*`
- example applications under `examples/*`
- generated release, conformance, pack, and extension artifacts under `artifacts/*`

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
- `apps/lander` build was verified with:
  - `npm run build -w apps/lander`
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
