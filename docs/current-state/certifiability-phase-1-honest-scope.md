# Certifiability Phase 1 Honest Scope

Date: 2026-05-06

This checkpoint freezes the current certifiability target for the repository using the SSOT boundary `bnd:repo-certifiability-current-scope`.

The boundary was created and frozen through the SSOT CLI. Its snapshot is:

- `.ssot/releases/boundaries/bnd__repo-certifiability-current-scope.snapshot.json`

## Scope Counts

The frozen boundary contains:

- 137 direct current feature rows
- 5 active profile rows
- 147 resolved feature rows after profile expansion
- 93 implemented resolved features
- 46 partial resolved features
- 8 absent resolved features

The direct current feature set has no absent features and no feature missing both claims and tests. The resolved boundary still includes backlog feature rows because active profiles expand to their required profile members.

## Frozen Profiles

The boundary includes these active profiles:

- `prf:commonmark-editing-preview`
- `prf:edit-in-renderer-profile`
- `prf:editor-authoring-default`
- `prf:gfm-editing-preview`
- `prf:mdwrk-editing-preview`

## Partial Features Blocking Full Certification

The resolved boundary remains partially implemented until these feature rows are closed or intentionally rescoped:

- `feat:accessibility-shell-baseline`
- `feat:client-common`
- `feat:client-diagnostics`
- `feat:commonmark-conformance-profile`
- `feat:desktop-folder-mounting`
- `feat:desktop-preload-host-api`
- `feat:edit-in-renderer-profile-contract`
- `feat:editor-toolbar-active-state-display`
- `feat:editor-toolbar-disabled-state-display`
- `feat:editor-toolbar-divider-grouping`
- `feat:editor-toolbar-hidden-button-preference`
- `feat:editor-toolbar-overflow-scroll`
- `feat:editor-toolbar-responsive-placement`
- `feat:editor-toolbar-split-view-eligibility`
- `feat:host-capability-adapter`
- `feat:lander-aeo-appended-answer-blocks`
- `feat:lander-aieo-crawlable-text-semantic-index`
- `feat:lander-aieo-json-ld-structured-data`
- `feat:lander-article-crawlability-internal-links`
- `feat:lander-article-excerpt-embedded-metadata`
- `feat:lander-article-metadata-ci-gate`
- `feat:lander-article-metadata-schema-validation`
- `feat:lander-article-related-link-copy`
- `feat:lander-blog-article-guide-standardization`
- `feat:lander-docs-answer-section-standardization`
- `feat:lander-entity-mdwrk-brand-normalization`
- `feat:lander-metadata-favicon-logo-fallback`
- `feat:lander-seo-comparison-pages`
- `feat:lander-seo-demand-cluster-canonical-pages`
- `feat:mdwrk-shell-fixed-fit-screen`
- `feat:native-filesystem-shell-behavior`
- `feat:preview-export-artifact-generation`
- `feat:preview-export-profile-disclosure`
- `feat:preview-link-cross-file-hash-scroll`
- `feat:preview-link-export-rewrite`
- `feat:preview-link-external-pass-through`
- `feat:preview-link-internal-file-navigation`
- `feat:preview-link-same-document-hash-scroll`
- `feat:preview-link-unsafe-url-policy`
- `feat:profile-boundary-resolution`
- `feat:uix-breakpoint-token-contract`
- `feat:uix-responsive-layout-matrix`
- `feat:workspace-open-tabs-persistence`
- `feat:workspace-persistence`
- `feat:gfm-profile`
- `feat:custom-flavored-markdown-profile`

## Absent Features Blocking Full Certification

The resolved boundary is not certifiably fully featured while these profile-expanded feature rows remain absent:

- `feat:mdwrk-custom-parser-profile`
- `feat:mdwrk-custom-previewer-profiles`
- `feat:editor-link-selected-text-wrap`
- `feat:editor-link-empty-selection-stub`
- `feat:editor-link-existing-edit`
- `feat:editor-link-url-paste-wrap`
- `feat:editor-link-internal-file-authoring`
- `feat:editor-link-hash-authoring`

## Known Validation Warnings

SSOT validation passes, but the repository is not yet certifiable because validation still reports profile and dependency warnings:

- CommonMark, GFM, and custom Markdown profile dependencies do not currently pass.
- CommonMark, GFM, and custom Markdown profile rows are not fully implemented.
- Active profile evaluations do not currently pass.
- OIDC-dependent extension features have non-passed linked evidence.

## Certification Position

This phase completes an honest frozen scope. It does not certify the repository.

The next implementation phase must close the partial and absent resolved feature rows, then refresh claims, tests, evidence, and release certification against this frozen boundary.
