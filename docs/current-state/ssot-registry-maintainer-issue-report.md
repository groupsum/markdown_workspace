# SSOT Registry Maintainer Issue Report

Date: 2026-05-18

Repository: `markdown_workspace`

Environment:
- OS: Windows
- Shell: PowerShell
- Repo path: `E:\swarmauri_github\markdown_workspace`
- Repo-pinned dev dependency: `ssot-registry==0.2.17` in `pyproject.toml`

## Summary

The repo-local `uv run ssot-registry` path can validate and upgrade the registry, but the command surface shows multiple operator-facing inconsistencies on Windows:

1. Direct console-script entry points fail before running.
2. `uv run ssot-registry --version` reports `0.1.11` even though the repo pins `ssot-registry==0.2.17` and the registry tooling metadata says `0.2.17`.
3. Parallel `uv run` invocations can fail while creating the uv cache directory with `os error 183`.

This makes SSOT operations hard to diagnose because a normal operator can see different results depending on whether they use the direct script shim, `uv run`, or package metadata.

## Reproduction

From the repo root:

```powershell
ssot-registry --version
```

Observed:

```text
Failed to canonicalize script path
```

The alias behaves the same:

```powershell
ssot --version
```

Observed:

```text
Failed to canonicalize script path
```

Repo-local command through uv:

```powershell
uv run ssot-registry --version
```

Observed:

```text
ssot-registry 0.1.11
```

But the repo pins `0.2.17`:

```toml
[dependency-groups]
dev = [
    "markdown-it-py>=4.1.0",
    "ssot-registry==0.2.17",
]
```

The registry itself also reports `0.2.17` tooling metadata:

```json
"tooling": {
  "initialized_with_version": "0.2.2",
  "last_upgraded_from_version": "0.2.11",
  "ssot_registry_version": "0.2.17"
}
```

Registry validation currently succeeds through the repo-local uv path:

```powershell
uv run ssot-registry validate .
```

Observed:

```json
{"failures":[],"passed":true,"registry_path":".ssot/registry.json"}
```

Upgrade with sync docs also succeeds and writes a report:

```powershell
uv run ssot-registry upgrade . --sync-docs --write-report
```

Observed:

```json
{
  "changed": true,
  "from_schema_version": "0.4.0",
  "from_version": "0.2.17",
  "passed": true,
  "to_schema_version": "0.4.0",
  "to_version": "0.2.17"
}
```

Parallel uv invocations can also fail with a cache setup error:

```text
error: failed to create directory `C:\Users\bigman\AppData\Local\uv\cache`: Cannot create a file when that file already exists. (os error 183)
```

## Expected Behavior

- `ssot-registry --version`, `ssot --version`, and `uv run ssot-registry --version` should resolve to the same installed package version, or should clearly explain which installation context is being reported.
- Direct console-script entry points should not fail with `Failed to canonicalize script path` on Windows.
- The version printed by `--version` should match the active package metadata used by the CLI implementation.
- Concurrent `uv run` command use should not produce a misleading cache directory creation failure, or SSOT docs should warn operators not to run multiple uv-backed SSOT commands in parallel on Windows.

## Actual Behavior

- Direct `ssot-registry` and `ssot` shims fail before returning version/help output.
- Repo-local `uv run ssot-registry --version` prints `0.1.11`.
- Repo metadata and upgrade output indicate the active SSOT registry version should be `0.2.17`.
- `uv run ssot-registry validate .` passes, so the registry is not currently blocked when the repo-pinned invocation path is used.

## Operator Impact

This creates a false diagnosis risk. During normal ADR/SPEC/feature operations, post-mutation validation errors can be misattributed to registry schema drift when the underlying problem is actually command-resolution drift between global shims, uv-managed package state, and version reporting.

The failure mode is especially risky for downstream projects because the documented flow asks operators to use `ssot-registry` directly, but the direct entry point can fail while the repo-pinned uv invocation works.

## Requested Maintainer Action

1. Verify Windows console-script generation for both `ssot-registry` and `ssot`.
2. Make `--version` read from the active installed package metadata rather than a stale constant.
3. Add a diagnostic command or verbose output that prints:
   - executable path
   - imported package path
   - imported package version
   - registry schema version
4. Document the recommended Windows invocation path for repo-pinned usage, especially when projects require all SSOT operations to run through the CLI.
5. Consider a guard or clearer error for uv cache races when multiple SSOT commands are launched concurrently.

## Current Workaround

Use the repo-pinned uv invocation path:

```powershell
uv run ssot-registry validate .
uv run ssot-registry upgrade . --sync-docs --write-report
uv run ssot-registry <area> <operation> ...
```

Avoid launching multiple `uv run ssot-registry ...` commands in parallel on Windows until the cache race is clarified.
