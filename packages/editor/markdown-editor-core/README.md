# @mdwrk/markdown-editor-core

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.packages.editor.markdown_editor_core.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/packages/editor/markdown-editor-core/README.md)
[![Downloads](https://img.shields.io/npm/dm/%40mdwrk%2Fmarkdown-editor-core?label=downloads)](https://www.npmjs.com/package/@mdwrk/markdown-editor-core)

Portable source-mode Markdown editor primitives for MdWrk.

## Public responsibilities

- selection transforms
- formatting commands
- list/task insertion helpers
- indent/outdent helpers
- history state and undo/redo primitives
- editor class-name contract

## Typed public exports

- root module: `@mdwrk/markdown-editor-core`
- `./types`
- `./class-names`
- `./selection`
- `./transforms`
- `./commands`
- `./history`
- `./version`

## Integration fixtures / examples

- reusable consumer: `examples/editor-basic/`
- client integration: Phase 5 authoring checkpoint
- list/task/continuation behavior demonstrated in the editor example and package-level tests

## Semver / compatibility

- current version: `1.1.2`
- package boundary: editor logic only; no React or app-shell dependency

## Release evidence

- typed exports in `package.json`
- build/typecheck/test scripts in `package.json`
- checkpoint evidence in `artifacts/conformance/latest/`

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-markdown-editor-core.md`
