# Root operational tooling

This directory contains repository-level scripts used by the Phase 13 CI/CD, release, conformance, extension artifact, and evidence workflows.

## Areas
- `tools/lib/` — shared workspace/package helpers
- `tools/ci/` — matrix generation and smoke evidence scripts
- `tools/conformance/` — manifest, compatibility, boundary, export, and external-artifact validation plus conformance report generation
- `tools/extensions/` — browser-installable extension artifact, signing, integrity, and trust-metadata generation
- `tools/release/` — package pack evidence and release evidence generation
