# Language Pack Authoring

Language pack authoring uses the first-party studio package, locale catalogs, validation flows, export behavior, and host surfaces for MdWrk localization.

## Primary surface

Language pack authoring in this repository centers on the first-party studio package:

```text
packages/extensions/extension-language-pack-studio/
```

That surface is responsible for browsing, editing, importing, exporting, and activating language packs.

## Authoring expectations

A language-pack author should expect to work with:

- locale labels and message catalogs
- import and export flows
- built-in and installed pack visibility
- activation and deactivation behavior through the host settings/runtime surfaces

## What the studio proves

Language Pack Studio demonstrates that language-pack management is not just a static bundle concern.
It is a governed workspace surface with:

- authoring UI
- import validation
- export behavior
- persistence through the local host storage model

## Artifact model

Language packs should be portable artifacts that the host can inspect, import, and activate without requiring app-local rewrites.

The authoring flow should preserve:

- stable locale identity
- portable message payloads
- compatibility with the shared i18n surfaces

## Reference surfaces

Use these repo surfaces as the concrete reference:

```text
packages/extensions/extension-language-pack-studio/
packages/shared/i18n/
docs/conformance/extension-workspace-surfaces-claim.md
```
