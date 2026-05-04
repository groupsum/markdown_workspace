# Extension Platform

MdWrk extensions are governed through manifest metadata, host APIs, runtime activation, manager UX, settings, permissions, and compatibility checks.

## Runtime shape

The extension stack is split into governed surfaces:

- `@mdwrk/extension-manifest` for declarative metadata
- `@mdwrk/extension-host` for host-safe APIs
- `@mdwrk/extension-runtime` for activation, registration, and lifecycle
- `@mdwrk/extension-manager` for installed and bundled extension UX

## Host responsibilities

The client owns:

- capability gating
- trust policy enforcement
- settings registration
- command, view, and action-rail registration
- theme, i18n, and diagnostics adapters

## Bundled first-party extensions

Current first-party extension surfaces documented in this repo include:

- Theme Studio
- Gemini Agent
- Extension Manager
- Language pack tooling

## External installables

External extensions do not run through ad hoc `npm install` inside the browser. They ship as signed installable artifacts with manifest, integrity, and compatibility declarations.

## Frequently Asked Questions

### What will I learn from Extension Platform?

MdWrk extensions are governed through manifest metadata, host APIs, runtime activation, manager UX, settings, permissions, and compatibility checks.

### Who should read Extension Platform?

Read this page if you need practical MdWrk guidance for extension platform, including the relevant workflow, product surface, and follow-up documentation paths.
