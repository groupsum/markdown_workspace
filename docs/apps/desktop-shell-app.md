# @mdwrk/desktop shell reference

## Purpose

`@mdwrk/desktop` is the first-party thin shell that deploys `apps/client` as an installable host application.

The platform split is:

- Electron for Windows, macOS, and Linux
- Capacitor Android for Android

This split is intentional because Electron does not target Android.

## Host capabilities

- opens retained `apps/client/dist` bundles inside a native shell
- registers `.md` and `.markdown` file associations for desktop installers
- accepts launch/open intents for Markdown files and imports them into the client workspace
- saves filesystem-backed Markdown edits back to disk from the desktop shell
- prepares Android release artifacts from the same client bundle

## Build and release surface

- local dev: `npm run dev:desktop`
- desktop typecheck: `npm run typecheck:desktop`
- desktop build: `npm run build:desktop`
- Windows packaging: `npm run build:desktop:win`
- Linux packaging: `npm run build:desktop:linux`
- macOS packaging: `npm run build:desktop:mac`
- Android prepare: `npm run build:android`
- CI desktop build entry: `npm run ci:desktop:build`
- CI release entry: `npm run ci:desktop:release`
- CI publish entry: `npm run ci:desktop:publish`

## CI workflows

- `.github/workflows/desktop-shell-ci.yml` validates buildability for Windows, macOS, Linux, and Android preparation
- `.github/workflows/desktop-shell-release.yml` creates release artifacts for Windows, macOS, Linux, and Android
- `.github/workflows/desktop-shell-publish.yml` publishes platform artifacts using a per-platform matrix

## Support / ownership

- status: first-party maintained
- ownership: repository core maintainers
- support level: application shell for native distribution
