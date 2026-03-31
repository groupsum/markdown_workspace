# Root Clutter Validation Spec

Repository root cleanliness is enforced via an allowlist.

Any top-level file or directory not explicitly allowlisted is treated as clutter and fails validation.

Automated validator: `tools/governance/validate-root-clutter.mjs`.
