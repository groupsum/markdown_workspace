# @mdwrk/markdown-editor-react

React bindings for the portable Markdown Workspace source editor.

## Public responsibilities

- `MarkdownSourceEditor` React component
- controlled and uncontrolled editor modes
- keyboard shortcut and command wiring
- line-number gutter support
- theme bridge/style helpers
- stylesheet entry for package consumers

## Typed public exports

- root module: `@mdwrk/markdown-editor-react`
- `./types`
- `./theme`
- `./version`
- `./styles/default.css`

## Integration fixtures / examples

- reusable consumer: `examples/editor-basic/`
- client integration: Phase 5 authoring checkpoint
- line-number + task/list example coverage in the editor example app

## Semver / compatibility

- current version: `1.1.0`
- depends on `@mdwrk/markdown-editor-core` public exports rather than private workspace editor wiring

## Release evidence

- typed exports in `package.json`
- build/typecheck/test scripts in `package.json`
- checkpoint evidence in `artifacts/conformance/latest/`

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-markdown-editor-react.md`
