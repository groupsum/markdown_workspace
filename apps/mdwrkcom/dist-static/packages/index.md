# Packages

Use the packages hub to find the reusable MdWrk modules behind rendering, editing, theme contracts, and extension behavior.

MdWrk packages are the reusable module surfaces behind the broader MdWrk product story. They help teams adopt rendering, editing, theming, and extension behavior without pulling in the full MdWrk application shell.

## Current public package pages

- [@mdwrk/markdown-renderer-core](/packages/markdown-renderer-core/) is the self-contained Markdown parsing and rendering surface for HTML output and preview pipelines.
- [@mdwrk/markdown-renderer-react](/packages/markdown-renderer-react/) provides React bindings for MdWrk-aligned Markdown rendering.
- [@mdwrk/markdown-editor-react](/packages/markdown-editor-react/) exposes React editor components for embedding MdWrk-style authoring surfaces.
- [@mdwrk/theme-contract](/packages/theme-contract/) documents the governed token and compatibility contract for editor, preview, extension, and lander styling.
- [@mdwrk/extension-runtime](/packages/extension-runtime/) covers the reusable runtime boundary for extension lifecycle and host-facing behavior.

## Broader package families in the repo

The public package pages cover only part of the current workspace package surface. The broader repo also includes the packaged workspace app, editor and renderer families, extension packages, shared utilities, lander packages, and the MdWrk content pack.

## How to use this section

Start here if you are evaluating MdWrk as a package platform rather than only as an end-user application. The package pages clarify install surfaces, public APIs, and how each reusable module fits into the broader Markdown workflow.

## Frequently Asked Questions

### What are MdWrk packages?

MdWrk packages are reusable modules for Markdown rendering, editor behavior, theme contracts, extension runtime behavior, and related adoption paths.

### Why does MdWrk separate packages from the product site?

The package section makes reusable module boundaries explicit so teams can evaluate adoption without treating every capability as an app-only feature.
