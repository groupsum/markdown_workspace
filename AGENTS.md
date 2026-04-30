Always use screenshots to show all views, modes, panes, and modals for each and every theme such that we can validate each and every theme for each and every view, mode, pane, modal.
Always increment the package version on every commit, using only minor or patch releases.
Docker Compose must never expose ports.
Viewport + aspect ratio breakpoints are defined once in client/public/css/base/viewports.css and must remain consistent across themes; themes are responsible for unique styling per band. The contract includes portrait, square/hybrid, landscape, wide, and ultra-wide aspect ratios plus XS/SM/MD/LG/XL/XXL width tiers, short/compact/tall/ultra-tall height tiers, and touch/precision device classes.

## SSOT Registry (Required)
Agents are required to use the `ssot-registry` CLI command for all SSOT operations (feature-tracking, test-tracking, claim-tracking, evidence-tracking, and release-management). Do not bypass the CLI by hand-editing `.ssot` records except when explicitly instructed.

### Source + baseline
- Reference command surface from `ssot-registry -h` and subcommand help (`ssot-registry <area> -h`, `ssot-registry <area> <operation> -h`).
- PyPI package: `ssot-registry` (requires Python >=3.10). Latest observed package during this guidance update: `0.2.2` (uploaded 2026-04-15).
- Tool mission: a portable single-source-of-truth registry for features, tests, claims, evidence, issues, risks, boundaries, releases, ADRs, and specs.

### Standard operating flow
1. Initialize once per repo (if missing):
   - `ssot-registry init .`
2. Validate before and after any registry change:
   - `ssot-registry validate .`
3. If package/schema changed, migrate intentionally:
   - `ssot-registry upgrade . --sync-docs --write-report`
4. Export machine-readable artifacts when needed for CI/reporting:
   - `ssot-registry registry export . --output-format json`
   - `ssot-registry graph export . --output-format json`

### Feature-tracking
Use feature records as the canonical product capability ledger.
- Create: `ssot-registry feature create . --id <feature_id> --title "..." --description "..."`
- Plan lifecycle/roadmap dimensions (horizon, tier, target lifecycle):
  - `ssot-registry feature plan . --id <feature_id> --horizon <current|next|future|explicit|backlog|out_of_bounds> --claim-tier <T0|T1|T2|T3|T4> --target-lifecycle-stage <active|deprecated|obsolete|removed>`
- Set implementation/lifecycle facts:
  - `ssot-registry feature update . --id <feature_id> --implementation-status <absent|partial|implemented> --lifecycle-stage <active|deprecated|obsolete|removed>`
- Link related entities:
  - `ssot-registry feature link . --id <feature_id> --claim-ids <claim_ids...> --test-ids <test_ids...> --requires <feature_ids...>`

### Feature-test tracking
Use test records to track verification coverage and execution readiness.
- Create test rows:
  - `ssot-registry test create . --id <test_id> --title "..." --kind <kind> --test-path <repo/relative/path>`
- Maintain execution state:
  - `ssot-registry test update . --id <test_id> --status <planned|passing|failing|blocked|skipped>`
- Connect tests to features/claims/evidence:
  - `ssot-registry test link . --id <test_id> --feature-ids <feature_ids...> --claim-ids <claim_ids...> --evidence-ids <evidence_ids...>`

### Claim management
Use claims to represent normative assertions and certification state.
- Create claims:
  - `ssot-registry claim create . --id <claim_id> --title "..." --kind <kind> --tier <T0|T1|T2|T3|T4>`
- Evaluate claim satisfaction (single/all):
  - `ssot-registry claim evaluate . --claim-id <claim_id>`
  - `ssot-registry claim evaluate .`
- Maintain claim progression:
  - `ssot-registry claim set-status . --id <claim_id> --status <proposed|declared|implemented|asserted|evidenced|certified|promoted|published|blocked|retired>`
  - `ssot-registry claim set-tier . --id <claim_id> --tier <T0|T1|T2|T3|T4>`
- Link to supporting features/tests/evidence:
  - `ssot-registry claim link . --id <claim_id> --feature-ids <feature_ids...> --test-ids <test_ids...> --evidence-ids <evidence_ids...>`

### Evidence management
Use evidence rows for auditable artifacts proving tests/claims.
- Create evidence:
  - `ssot-registry evidence create . --id <evidence_id> --title "..." --kind <kind> --evidence-path <repo/relative/path>`
- Verify evidence integrity (single/all):
  - `ssot-registry evidence verify . --evidence-id <evidence_id>`
  - `ssot-registry evidence verify .`
- Track evidence freshness:
  - `ssot-registry evidence update . --id <evidence_id> --status <planned|collected|passed|failed|stale>`
- Link evidence to tests/claims:
  - `ssot-registry evidence link . --id <evidence_id> --claim-ids <claim_ids...> --test-ids <test_ids...>`

### Release management
Use release objects as promotion gates; never treat releases as informal notes.
- Create draft/candidate release:
  - `ssot-registry release create . --id <release_id> --version <semver> --boundary-id <boundary_id>`
- Associate quality inputs:
  - `ssot-registry release add-claim . --id <release_id> --claim-ids <claim_ids...>`
  - `ssot-registry release add-evidence . --id <release_id> --evidence-ids <evidence_ids...>`
- Drive gate progression:
  - `ssot-registry release certify . --release-id <release_id> --write-report`
  - `ssot-registry release promote . --release-id <release_id>`
  - `ssot-registry release publish . --release-id <release_id>`
- Use revoke when required:
  - `ssot-registry release revoke . --release-id <release_id>`

### CI + reporting expectations
- Preferred output formats for automation: `json`, `yaml`, `toml`, `csv`, or `df` via `--output-format`.
- Use `--output-file` to persist command output into build artifacts.
- Store validation/certification/upgrade reports under `.ssot/reports` using `--write-report` where supported.
- Treat failed validation/evaluation/verification/certification as blockers for promotion.
