# Packages Agent Instructions

Package work must keep the package boundary explicit: public exports, package metadata, README examples, tests, and version surfaces should move together when behavior changes.

- Prefer package-local validation commands when they exist, then broaden to the workspace only when the changed API crosses package boundaries.
- Keep package READMEs aligned with the current exported API and package name.
- Do not introduce app-only dependencies into reusable packages unless the package contract already allows them.
- For package changes that touch SSOT-governed behavior, use the `ssot_governance` custom agent or the `ssot-registry` CLI workflow.
