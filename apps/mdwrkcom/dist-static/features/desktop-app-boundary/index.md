# Desktop App Boundary

The desktop app boundary explains how MdWrk separates the browser workspace, Electron shell, preload bridge, and host filesystem access.

## Boundary Summary

The MdWrk desktop app packages the same client workspace behind a native shell. The client remains the authoring surface, while the desktop shell owns host-only responsibilities such as native windows, file-open handoff, folder selection, and build targets.

The boundary is visible in the repository:

- `apps/client` owns the browser workspace experience.
- `apps/desktop` owns Electron and native shell packaging.
- `apps/desktop/src/preload.ts` exposes the narrow host bridge.
- `apps/desktop/src/main.ts` owns native process behavior.

## What Belongs In The Client

The client owns Markdown editing, preview, settings, extension hosting, PWA version state, project selection, and browser-backed persistence. Code that can run in a normal web runtime should stay in the client or reusable packages.

## What Belongs In The Desktop Shell

The desktop shell owns native capabilities that the web runtime cannot provide directly:

- opening Markdown files from the operating system
- mounting a desktop folder as a workspace source
- packaging Windows, Linux, macOS, and Android targets
- exposing host APIs through the preload bridge

Desktop features should cross into the client through explicit bridge methods instead of importing native modules into client code.

## Operator Commands

```bash
npm run build:desktop
npm run build:desktop:dist
npm run build:desktop:win
npm run build:desktop:linux
npm run build:desktop:mac
```

The release scripts under `tools/ci` select the desktop or Android build path from the same workspace package graph.

## Related Docs

- [PWA Installation](/docs/getting-started/pwa-installation)
- [Local-First Markdown Workspace](/features/local-first-markdown-workspace)
- [Extension Platform](/docs/extensions/extension-platform)

## Frequently Asked Questions

### What will I learn from Desktop App Boundary?

The desktop app boundary explains how MdWrk separates the browser workspace, Electron shell, preload bridge, and host filesystem access.

### Who should read Desktop App Boundary?

Read this page if you need practical MdWrk guidance for desktop app boundary, including the relevant workflow, product surface, and follow-up documentation paths.
