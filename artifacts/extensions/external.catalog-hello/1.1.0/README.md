# @mdwrk/extension-catalog-hello

Sample third-party external extension package used to validate the signed catalog installation path.

## Manifest and compatibility

- manifest export: `./manifest`
- manifest kind: external
- compatibility declarations: host API, runtime, app, and theme contract ranges are declared in `src/manifest.ts`
- distribution mode: external signed catalog artifact

## Capabilities

This sample demonstrates a deliberately small capability footprint:

- `view.register`
- `actionRail.register`
- `notification.publish`
- `settings.read`

## Settings schema

The sample manifest includes a minimal settings schema with a single `greeting` string field.
That keeps the package suitable as a catalog/install/activation fixture without dragging in extra runtime surface area.

## i18n readiness

The manifest uses `I18nLabel` descriptors for display name, description, view title, and action-rail title.
The shipped catalog sample keeps `en` as the only bundled locale, which is intentional for the minimal external-fixture path.

## Lifecycle and host/runtime tests

- `tests/run-smoke.mjs` validates the manifest export and extension entry shape
- `tests/integration.mjs` activates the extension against a mock host/runtime context and verifies view registration, action-rail registration, and notification behavior

## Installation / configuration guidance

This package is **not bundled** into `apps/client`.
It is published as a source package and transformed by the CI catalog/signing pipeline into an external browser-installable artifact.
Use it when validating:

- external catalog metadata generation
- signed-manifest verification
- install/enable/activate flows in the runtime
- minimal schema-backed settings behavior for external extensions

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-extension-catalog-hello.md`
