# @mdwrk/example-renderer-basic

- category: example
- workspace path: `examples/renderer-basic`
- version: `0.1.1`
- publishable: no

## Typed public exports

| Export | Detail |
| --- | --- |
| _none_ | Application/example workspace without reusable package exports. |

## README / API docs

- package README: `examples/renderer-basic/README.md`
- generated API/reference page: `docs/reference/examples/mdwrk-example-renderer-basic.md`

## Tests / examples / integration fixtures

- `docs/examples/renderer-basic-example.md`
- `examples/renderer-basic/App.tsx`

## Semver / compatibility declarations


```json
{
  "packageVersion": "0.1.1",
  "engines": null,
  "peerDependencies": null,
  "dependencies": {
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
    "docs/current-state/checkpoints/PHASE_0_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_10_CHECKPOINT_SUMMARY.md",
    "docs/current-state/checkpoints/PHASE_11_CHECKPOINT_SUMMARY.md",
    "docs/operations/release-evidence-phase11.md"
  ]
}
```

## Boundary audit

- forbidden app-level source leakage: none detected

## Example validation checklist

- commonmarkCore: present

- gfmTables: present

- gfmTasks: present

- gfmStrike: present

- gfmAutolinks: present

- optionalExtensions: present
