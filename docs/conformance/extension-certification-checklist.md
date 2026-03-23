# Extension certification checklist

## Purpose

This checklist defines the evidence expected from an externally distributed Markdown Workspace extension package.

## Package checklist

- [ ] npm package name, version, license, and README are present
- [ ] package builds successfully and emits typed exports
- [ ] package exports a manifest module
- [ ] `manifest.packageName` matches `package.json`
- [ ] `manifest.version` matches `package.json`
- [ ] manifest labels resolve to non-empty values
- [ ] manifest capabilities are declared explicitly
- [ ] compatibility ranges are declared
- [ ] i18n metadata is present
- [ ] settings schema is present and structurally valid

## External distribution checklist

- [ ] manifest kind is `external`
- [ ] distribution channel is `catalog`
- [ ] browser-installable ESM entry module is emitted
- [ ] `manifest.json` is generated in the artifact directory
- [ ] `signed-manifest.json` is generated
- [ ] `integrity.json` and `SHA256SUMS.txt` are generated
- [ ] catalog entry integrity digests match generated artifacts
- [ ] signed manifest verifies against a trusted signer
- [ ] catalog entry is present in `catalog.json`

## Runtime verification checklist

- [ ] install test passes
- [ ] update test passes
- [ ] remove test passes
- [ ] cache rehydration test passes
- [ ] compatibility rejection test passes
- [ ] untrusted extension rejection test passes
- [ ] integrity failure rejection test passes

## Documentation checklist

- [ ] extension authoring guide exists
- [ ] support/owner metadata is present
- [ ] permissions/capabilities are documented
- [ ] upgrade guidance exists when applicable

## Important note

Satisfying this checklist means the extension is aligned with the repository’s internal Phase 13 conformance model.
It does **not** itself constitute independent external certification or compliance with an unspecified RFC corpus.
