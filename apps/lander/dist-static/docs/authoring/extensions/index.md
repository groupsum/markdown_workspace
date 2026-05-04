# Extension Authoring

Extension authoring covers manifest shape, host APIs, activation lifecycle, package-local source, generated bundles, and trust metadata for MdWrk extensions.

## What an extension author owns

The extension authoring surface in this repository is split across:

- `@mdwrk/extension-manifest` for manifest shape and metadata
- `@mdwrk/extension-host` for host-safe APIs
- `@mdwrk/extension-runtime` for activation and lifecycle expectations
- package-local source, tests, and build outputs inside an extension package

## Typical workflow

1. Create a normal npm package for the extension source.
2. Export a valid MdWrk extension manifest and lifecycle entrypoint.
3. Test the manifest, lifecycle, and runtime-facing behavior.
4. Publish the source package for developer consumption when appropriate.
5. Generate browser-installable artifacts through the formal distribution flow when targeting external installation.

## Required package shape

At minimum, an extension package should include:

- `package.json`
- `README.md`
- `src/manifest.ts`
- `src/index.ts`
- tests for manifest, lifecycle, and runtime behavior

## Runtime and distribution rules

External extensions do not install through ad hoc `npm install` inside the browser.
The browser host installs generated artifacts with manifest, integrity, compatibility, and signer metadata.

That means an extension author should expect:

- trust-policy enforcement
- capability gating
- compatibility declarations
- signed/installable artifact generation for the external path

## Reference package

This repository already includes a reference external package:

```text
packages/extensions/extension-catalog-hello/
```

Use it as the concrete reference for:

- manifest structure
- distribution metadata
- runtime install expectations
- certification preparation

## Related documents

For the deeper operator workflow, see:

```text
docs/operations/third-party-extension-authoring.md
docs/architecture/extension-package-layout.md
```
