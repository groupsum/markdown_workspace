# Specs

# Specs

This directory is the canonical home for repository specifications and standards.

## Index
- `repository-governance-spec.md` — CI-enforced governance rules for repository structure, documentation pointers, root cleanliness, generated artifacts, claim language, WIP notes, and release-note hygiene.

## How specs are used
- Validation scripts under `tools/governance/` enforce these requirements.
- CI runs all governance checks through `npm run ci:governance`.
- Validation failures include explicit pointers back to the relevant specification.
