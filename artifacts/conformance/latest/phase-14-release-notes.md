# RC.1 promotion and release notes

Date: 2026-03-30T02:30:48.319Z
Release train: rc.1
Workspace version: 0.2.0-rc.1

## Summary

This release bundle promotes the existing RC.1 artifact train into a single promotion-and-release evidence bundle.

Actual npm publication, Git tagging, and GitHub release creation were **not executed** in this environment because release blockers remain and no npm auth token is available.

## Publish order

1. contracts
2. shared packages
3. renderer packages
4. editor packages
5. extension runtime and bundled extensions
6. examples if published
7. apps where appropriate

## Certification boundary

Current certification claim status: **no final certification claim is made in this checkpoint**.

The strongest honest statement supported by the evidence is:

- repository-internal release-readiness evidence exists up to the RC.1 line;
- no final repository-internal certification claim is made;
- no repository-internal plus externally frozen CommonMark/GFM markdown target conformance claim is made.

## Markdown target boundary

The frozen external markdown target remains:

- CommonMark 0.31.2 core
- GFM 0.29-gfm as the default profile
- named optional profiles as previously documented in the repository

This promotion bundle does **not** expand that boundary and does **not** claim broader standards conformance than the recorded evidence supports.

## Optional extension profiles

The optional profile boundary remains exactly as recorded in the Phase 4 and later checkpoint documents.

Profiles currently outside the certified boundary remain outside it for this promotion bundle and are called out as known waivers rather than silently promoted.

## Compatibility baselines

The current promotion bundle preserves the existing compatibility baselines recorded through the Phase 1, Phase 9, and Phase 13 documentation set.

Key release-family versions remain:

- @mdwrk/mdwrkspace@1.4.0-rc.1
- @mdwrk/theme-contract@1.1.0-rc.1
- @mdwrk/ui-tokens@1.2.0-rc.1
- renderer/editor families at 1.1.0-rc.1
- extension runtime and bundled extension families at 1.1.0-rc.1
- @mdwrk/i18n@1.1.0-rc.1

## Known waivers

The following release blockers remain open and are therefore treated as explicit waivers/blockers, not hidden assumptions:

- browser matrix lane is still blocked
- browser-driven visual regression lane is still blocked
- the hard closure rule for full frozen-target Markdown corpus closure is still blocked
- npm publication is blocked without an auth token
- Git tag and GitHub release creation are blocked because there is no Git repository metadata or remote-auth context in this checkpoint environment

## Required outputs produced in this checkpoint

Produced locally:

- publish-order manifest
- updated extension catalog bundle
- extension artifact bundle tarball
- final evidence tarball
- Git tag / GitHub release metadata files
- release notes

Not produced in this environment:

- published npm packages
- remote Git tag
- remote GitHub release

## Honest release statement

This is a **promotion-and-release checkpoint bundle**, not a completed public release.
Published artifacts, docs, evidence, and release notes now agree on that status.
