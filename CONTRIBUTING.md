# Contributing

Thanks for contributing to `markdown_workspace`.

## Development workflow
1. Install dependencies with `npm run ci:install`.
2. Run governance checks with `npm run ci:governance`.
3. Run workspace checks relevant to your changes (lint, typecheck, build, tests).
4. Add or update docs/specs when behavior or policy changes.

## Required checks
- `npm run ci:governance`
- `npm run ci:lint`
- `npm run ci:typecheck`
- `npm run ci:build`

## Documentation governance
- Keep specifications under `specs/`.
- Keep architecture and operational guidance under `docs/`.
- Ensure root README doc pointers stay current.

## Pull request hygiene
- Include a clear summary of user-visible and governance-impacting changes.
- Include evidence of commands run.
