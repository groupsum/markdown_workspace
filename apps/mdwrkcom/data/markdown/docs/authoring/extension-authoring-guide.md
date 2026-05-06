---
title: Extension Authoring Guide
slug: authoring/extension-authoring-guide
section: Authoring
sectionOrder: 3.5
order: 3
toc: true
date: 2026-05-06
status: published
excerpt: The extension authoring guide gives package authors the current MdWrk workflow for manifests, host APIs, runtime activation, tests, bundles, and publishing artifacts.
---

## Authoring Model

MdWrk extensions are normal workspace packages that declare a manifest, activate through the extension runtime, and use host APIs for commands, views, settings, diagnostics, themes, editor access, and workspace access.

The core package surfaces are:

- `@mdwrk/extension-manifest`
- `@mdwrk/extension-host`
- `@mdwrk/extension-runtime`
- `@mdwrk/extension-manager`

## Package Shape

A first-party or installable extension package should include:

- `package.json`
- `README.md`
- `src/manifest.ts`
- `src/index.ts`
- tests for manifest validity and runtime behavior
- `src/version.ts` for package version exports

Use `packages/extensions/extension-catalog-hello` as the smallest reference extension and `packages/extensions/extension-manager` as a fuller operator-facing surface.

## Manifest Responsibilities

The manifest declares identity, version, display metadata, activation mode, requested capabilities, compatibility ranges, contribution points, and settings schema. The runtime uses it before activation to evaluate compatibility and host capability access.

## Runtime Responsibilities

Extension code should register through the provided context:

- commands through `context.registerCommand`
- views through `context.registerView`
- action rail items through `context.registerActionRailItem`
- settings through manifest settings schema
- diagnostics through host diagnostics APIs

Extensions should clean up registered work with disposables returned by the runtime.

## Publish Workflow

```bash
npm run build:extensions
npm run extension:bundle
npm run extension:sign
npm run validate:extension-artifacts
```

The generated artifacts include installable payloads, integrity metadata, signed manifests, and catalog entries under `artifacts/extensions`.

## Related Docs

- [Extension Authoring](/docs/authoring/extensions)
- [Extension Platform](/docs/extensions/extension-platform)
- [Extension Host](/features/extension-host)
