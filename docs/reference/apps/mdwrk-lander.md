# @mdwrk/lander

- category: app
- workspace path: `apps/lander`
- version: `0.0.11`
- publishable: no

## Typed public exports

| Export | Detail |
| --- | --- |
| _none_ | Application/example workspace without reusable package exports. |

## README / API docs

- package README: `apps/lander/README.md`
- generated API/reference page: `docs/reference/apps/mdwrk-lander.md`

## Documentation scope rule

- the lander is a documentation surface for `@mdwrk/mdwrkspace`, shared packages, and extensions
- it should not use its on-site docs to document `@mdwrk/lander` itself as the primary product

## Tests / examples / integration fixtures

- `docs/apps/lander-app.md`
- `apps/lander/README.md`

## Semver / compatibility declarations


```json
{
  "packageVersion": "0.0.11",
  "engines": null,
  "peerDependencies": null,
  "dependencies": {
    "react": "^19.2.4",
    "react-dom": "^19.2.4",
    "react-router-dom": "^7.9.3",
    "lucide-react": "^0.563.0",
    "@mdwrk/markdown-renderer-core": "^1.1.0",
    "@mdwrk/markdown-renderer-react": "^1.1.0",
    "@mdwrk/ui-tokens": "^1.0.1"
  }
}
```

## Release / checkpoint evidence


```json
{
  "version": "0.0.11",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit -p tsconfig.json",
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

## Application reference docs

- config surface doc: `docs/apps/lander-app.md`
- dependency boundary map: `docs/reference/package-boundary-map.md`
- deploy / release doc: `docs/apps/lander-app.md`
- conformance record: `docs/conformance/package-documentation-phase11.md`
- support / ownership: first-party / supporting public-facing application (repository core maintainers)
