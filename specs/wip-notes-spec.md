# WIP Notes Validation Spec

Published markdown governance documents must not contain unresolved work markers.

Disallowed markers:

- `TODO`
- `FIXME`
- `TBD`
- `WIP:` or `WIP-` at line start

Validation scope:

- root `README.md`
- `docs/**/*.md`
- `specs/**/*.md`

Automated validator: `tools/governance/validate-wip-notes.mjs`.
