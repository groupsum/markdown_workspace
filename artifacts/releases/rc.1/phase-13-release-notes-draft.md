# RC.1 release notes draft

Date: 2026-03-29T19:58:02Z

## Summary

This RC.1 train bundles the Phase 13 release-family versions generated from the post-Phase-12 source line.

## Affected package families

### Client / validation apps
- @mdwrk/mdwrkspace@1.4.0-rc.1
- @mdwrk/lander@0.0.11-rc.1
- @mdwrk/example-editor-basic@0.1.1-rc.1
- @mdwrk/example-renderer-basic@0.1.1-rc.1

### Renderer
- @mdwrk/markdown-renderer-core@1.1.0-rc.1
- @mdwrk/markdown-renderer-react@1.1.0-rc.1

### Editor
- @mdwrk/markdown-editor-core@1.1.0-rc.1
- @mdwrk/markdown-editor-react@1.1.0-rc.1

### Shared / theme
- @mdwrk/theme-contract@1.1.0-rc.1
- @mdwrk/ui-tokens@1.2.0-rc.1
- @mdwrk/i18n@1.1.0-rc.1

### Extensions
- @mdwrk/extension-runtime@1.1.0-rc.1
- @mdwrk/extension-manager@1.1.0-rc.1
- @mdwrk/extension-theme-studio@1.1.0-rc.1
- @mdwrk/extension-gemini-agent@1.1.0-rc.1
- @mdwrk/extension-catalog-hello@1.1.0-rc.1

## Changeset families included

- phase13-client-rc.md: Cut the RC.1 line for the app/example validation surfaces and verify them against tarballs rather than workspace symlinks.

- phase13-editor-rc.md: Cut the RC.1 line for the editor family from the current feature-bearing baseline and validate downstream consumers against tarballs rather than workspace links.

- phase13-extension-rc.md: Cut the RC.1 line for the extension family and regenerate installable artifacts, signatures, and compatibility evidence from the RC train.

- phase13-renderer-rc.md: Cut the RC.1 line for the renderer family from the current feature-bearing baseline and validate downstream consumers against tarballs rather than workspace links.

- phase13-shared-theme-rc.md: Cut the RC.1 line for the shared/theme family after the Phase 9 and Phase 10 behavior expansions and align internal dependents to semver-compatible RC ranges.

## Release blockers still open

- Browser matrix remains blocked in the current environment.
- Browser-driven visual regression remains blocked in the current environment.
- The hard closure rule for full frozen-target corpus closure remains blocked.
- Publish readiness remains blocked without an npm auth token.

RC.1 is prepared, but not yet accepted for promotion.
