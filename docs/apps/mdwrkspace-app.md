# @mdwrk/mdwrkspace application reference

## Purpose

`@mdwrk/mdwrkspace` is the primary client application for the Markdown Workspace repository.
It is the canonical integration host for the reusable editor, renderer, contracts, shared packages, and bundled extensions.
The lander should therefore document this client surface first.

## Public configuration surface

Documented public configuration inputs in this checkpoint are:

- `MDWRK_BUILD_ID`
- `VITE_BUILD_ID`
- `npm_package_version`
- the PWA/update lifecycle handled through the service worker and `usePwa()`
- persisted shell state in IndexedDB + local storage keys documented through the current-state docs

The app also exposes user-facing configuration surfaces for:

- theme selection
- language selection
- Markdown profile selection
- Git auth/provider configuration
- extension settings
- PWA/update controls
- session/data/export/restore controls

## Dependency boundary map

The client app consumes public package surfaces from:

- `@mdwrk/markdown-editor-react`
- `@mdwrk/markdown-renderer-react`
- `@mdwrk/extension-runtime`
- `@mdwrk/extension-manager`
- `@mdwrk/extension-gemini-agent`
- `@mdwrk/extension-theme-studio`
- `@mdwrk/i18n`
- `@mdwrk/ui-tokens`
- `@mdwrk/theme-contract`
- `@mdwrk/extension-host`
- `@mdwrk/extension-manifest`

Phase 11 evidence also verifies that reusable packages do **not** import `apps/client/*` internals.
The client is therefore the host integration layer, not the source of truth for reusable package APIs.

## Release / deploy notes

- build command: `npm run build -w @mdwrk/mdwrkspace`
- preview command: `npm run preview -w @mdwrk/mdwrkspace`
- library build command: `npm run build:lib -w @mdwrk/mdwrkspace`
- deploy semantics are documented through the PWA/update and static asset pipeline already present in the repo
- native shell deployment targets are documented in `docs/apps/desktop-shell-app.md`

## Conformance record

The client app participates in the following checkpoint evidence lanes:

- Phase 6 preview/export policy lane
- Phase 7 shell parity lane
- Phase 8 settings/data/session/Git parity lane
- Phase 9 theme/token/visual parity lane
- Phase 10 i18n/language UX lane
- Phase 11 package/examples/documentation evidence lane

## Support / ownership

- status: first-party maintained
- ownership: repository core maintainers
- support level: repository-primary application host
