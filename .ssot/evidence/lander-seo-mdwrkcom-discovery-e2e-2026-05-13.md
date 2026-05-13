# Lander SEO and mdwrkcom Discovery E2E Evidence

Date: 2026-05-13

Scope:
- lander-seo reusable discovery artifact builders
- mdwrkcom adoption of lander-seo discovery builders
- mdwrkcom content-pack generated artifact mirror

Verification:
- `npx --yes --package typescript@5.9.3 tsc -p packages/lander/lander-content-contract/tsconfig.json`
- `npx --yes --package typescript@5.9.3 tsc -p packages/lander/lander-core/tsconfig.json`
- `npx --yes --package typescript@5.9.3 tsc -p packages/lander/lander-seo/tsconfig.json`
- `node packages/lander/lander-seo/tests/run-smoke.mjs`
- `npm run ci:static -w apps/mdwrkcom`
- `npm run sync:content-pack-generated -w apps/mdwrkcom`

Observed result:
- lander-seo focused compile and smoke verification passed.
- mdwrkcom static pipeline passed validation, build, verify, sitemap XML, international SEO, discoverability artifacts, AEO parity, and AI crawler policy checks.
- mdwrkcom-content-pack generated mirror synced 10 generated discovery artifacts.
