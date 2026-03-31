# Generated Artifact Protection Spec

Generated artifacts that should not be committed must stay untracked.

Forbidden tracked patterns:

- `**/__pycache__/**`
- `**/*.pyc`
- `**/.DS_Store`

The root `.gitignore` must include ignore rules for these patterns.

Automated validator: `tools/governance/validate-generated-artifacts.mjs`.
