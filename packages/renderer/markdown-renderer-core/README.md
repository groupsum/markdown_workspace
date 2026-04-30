# @mdwrk/markdown-renderer-core

Portable Markdown parser/renderer core for MdWork.

## Public responsibilities

- CommonMark-oriented parsing and AST generation
- default GFM rendering and optional-profile support
- heading extraction and slug generation
- HTML fragment rendering
- HTML document serialization for export/print flows
- raw HTML policy handling and empty-list normalization hooks

## Typed public exports

- root module: `@mdwrk/markdown-renderer-core`
- `./types`
- `./class-names`
- `./slug`
- `./frontmatter`
- `./headings`
- `./pipeline`
- `./html`
- `./engine`
- `./version`

## Integration fixtures / examples

- reusable consumer: `examples/renderer-basic/`
- client integration: `apps/client/tests/phase6-preview-export-policy.mjs`
- GFM/default-profile smoke: package-local test lane
- optional-profile smoke: package-local test lane

## Semver / compatibility

- current version: `1.1.3`
- package boundary: reusable parser/renderer core; must not depend on `apps/client/*`
- compatibility notes are recorded through the repository current-state and checkpoint artifacts

## Release evidence

- typed exports in `package.json`
- build/typecheck/test scripts in `package.json`
- Phase checkpoint evidence in `artifacts/conformance/latest/`

## API/reference docs

See the generated reference page at:

- `docs/reference/packages/mdwrk-markdown-renderer-core.md`
