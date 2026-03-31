# @mdwrk/example-editor-basic

- category: example
- workspace path: `examples/editor-basic`
- version: `0.1.1`
- publishable: no

## Typed public exports

| Export | Detail |
| --- | --- |
| _none_ | Application/example workspace without reusable package exports. |

## README / API docs

- package README: `examples/editor-basic/README.md`
- generated API/reference page: `docs/reference/examples/mdwrk-example-editor-basic.md`

## Tests / examples / integration fixtures

- `docs/examples/editor-basic-example.md`
- `examples/editor-basic/App.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "0.1.1",
  "engines": null,
  "peerDependencies": null,
  "dependencies": {
    "@mdwrk/markdown-editor-react": "^1.1.0",
    "@mdwrk/markdown-renderer-react": "^1.1.0",
    "@mdwrk/ui-tokens": "^1.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "0.1.1",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "npm run typecheck"
  },
  "files": [],
  "phaseArtifacts": [
    "PHASE_0_CHECKPOINT_SUMMARY.md",
    "PHASE_10_CHECKPOINT_SUMMARY.md",
    "PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected

## Example validation checklist

- listContinuation: present

- taskInsertion: present

- lineNumbers: present

- themeSupport: present

- profileToggles: present
