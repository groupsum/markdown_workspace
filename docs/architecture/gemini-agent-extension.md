# Gemini Agent extension

This document describes the Phase 10 first-party Gemini workflow extension package.

## Package

- package: `@mdwrk/extension-gemini-agent`
- path: `packages/extensions/extension-gemini-agent/`
- type: bundled first-party extension package

## Scope

The Gemini Agent extension delivers the first substantial workflow extension on top of the packaged runtime.

Implemented in this phase:
- provider abstraction for AI integration
- Gemini `generateContent` adapter
- localized manifest and bundled locale catalogs
- action rail contribution in the `assistant` group
- bundled modal/operator view
- current file and selection context attachment
- read-only summarization of the active markdown file
- selection rewrite draft generation
- opt-in explicit writeback to selection or full document
- runtime diagnostics and notification publishing
- extension settings for endpoint/model/auth/system prompt/context attachment/writeback

## Safe writeback model

The extension never auto-applies generated text.

Writeback requires all of the following:
- the extension manifest declares `editor.write`
- the host grants `editor.write`
- the extension setting `allowWriteBack` is enabled
- the user explicitly invokes an apply action
- a non-empty draft exists

If any of these conditions fail, the extension publishes a warning diagnostic and does not modify the editor.

## Context model

The extension collects:
- active project summary
- active file summary
- active document content
- current selections

The prompt builder uses these according to the current intent:
- summarize current file → always includes the active document
- rewrite selection → always includes the selected markdown and may include the full document for surrounding context
- custom prompt → includes the active document and/or current selection according to extension settings

## Commands

Implemented commands:
- open Gemini Agent
- summarize current file
- draft rewrite of selection
- apply Gemini draft to selection
- replace document with Gemini draft

## View

The packaged view provides:
- prompt composer
- summarize/rewrite quick actions
- context summary
- response area
- editable draft area
- explicit apply actions
- current effective settings summary
- surfaced last error/status message

## Provider model

The package exports a provider abstraction so the bundled entry can accept a custom provider in future phases.

Current built-in provider:
- Gemini REST `generateContent`

Exported non-UI modules include:
- settings resolution helpers
- context collection helpers
- prompt builder
- Gemini request/response helpers
- service implementation

## Verification in this phase

Verified directly for this checkpoint:
- `tsc -p packages/extensions/extension-gemini-agent/tsconfig.json`
- `node packages/extensions/extension-gemini-agent/tests/run-smoke.mjs`

The smoke test covers:
- manifest presence and expected contributions
- prompt/context construction
- request URL/body construction
- response extraction
- service request execution with a stub provider
- blocked writeback when disabled
- successful writeback when enabled
