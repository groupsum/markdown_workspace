# @mdwrk/markdown-renderer-react

React bindings for the portable Markdown Workspace renderer core.

## Public responsibilities

- `MarkdownRenderer` React component
- renderer theme-style helpers
- static HTML and HTML-document helpers
- default stylesheet for package consumers
- renderer-side bridge-variable mapping from shared theme tokens

## Typed public exports

- root module: `@mdwrk/markdown-renderer-react`
- `./types`
- `./theme`
- `./server`
- `./version`
- `./styles/default.css`

## Integration fixtures / examples

- reusable consumer: `examples/renderer-basic/`
- client integration: `apps/client/tests/phase6-preview-export-policy.mjs`
- theme/token parity evidence: Phase 9 checkpoint artifacts

## Semver / compatibility

- current version: `1.1.0`
- depends on the public renderer-core contract rather than app-private preview wiring
- public consumers should use the exported theme/style helpers rather than private app theme code

## Release evidence

- typed exports in `package.json`
- build/typecheck/test scripts in `package.json`
- Phase checkpoint evidence in `artifacts/conformance/latest/`

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-markdown-renderer-react.md`
