# Lander SEO/AEO/AiEO profile closure evidence

Date: 2026-05-13

Scope:
- `feat:schemaorg-vocabulary-baseline`
- `feat:bcp47-language-metadata-normalization`
- `feat:iso8601-temporal-metadata-normalization`
- `feat:rfc6570-entrypoint-urltemplate-validation`
- `prf:lander-seo-aeo-aieo-discovery`

Implementation evidence:
- `packages/shared/structured-data/src/core.ts` exports a governed Schema.org baseline with supported type validation and absolute URL validation.
- `apps/mdwrkcom/src/cli.mjs` enforces canonical BCP 47 locale tags, calendar-valid ISO 8601 dates, Schema.org baseline node checks, and RFC 6570 level 1 `EntryPoint.urlTemplate` validation.
- `apps/mdwrkcom/src/cli.mjs` emits a `WebSite` `SearchAction` with an `EntryPoint` target template using `{search_term_string}`.
- `apps/mdwrkcom/scripts/validate-international-seo.mjs` asserts canonical BCP 47 hreflang tags.
- `packages/shared/structured-data/tests/assertions.mjs` asserts the reusable Schema.org baseline behavior.

Verification commands:
- `npx --yes --package typescript@5.9.3 tsc -p packages/shared/structured-data/tsconfig.json`
- `node packages/shared/structured-data/tests/run-smoke.mjs`
- `npm run ci:static -w apps/mdwrkcom`
- `uv --cache-dir .uv-cache run ssot-registry claim evaluate . --claim-id clm:lander-seo-aeo-aieo-discovery`
- `uv --cache-dir .uv-cache run ssot-registry claim evaluate . --claim-id clm:lander-international-seo`
- `uv --cache-dir .uv-cache run ssot-registry profile evaluate . --profile-id prf:lander-seo-aeo-aieo-discovery`
- `uv --cache-dir .uv-cache run ssot-registry validate .`

Observed results:
- Structured-data TypeScript compilation passed.
- Structured-data smoke assertions passed.
- MdWrk static lander validation, build, verification, sitemap XML validation, international SEO validation, discoverability validation, AEO content parity validation, and AI crawler policy validation passed.
- `clm:lander-seo-aeo-aieo-discovery` passed evaluation with recommended status `certified`.
- `clm:lander-international-seo` passed evaluation with recommended status `certified`.
- `prf:lander-seo-aeo-aieo-discovery` passed all feature proof checks.
- SSOT registry validation passed with all profiles passing.
