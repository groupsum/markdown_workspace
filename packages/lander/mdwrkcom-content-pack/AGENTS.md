# Mdwrkcom Content Pack Agent Instructions

This package is the packaged MdWrk public lander content pack. It should mirror `apps/mdwrkcom` authored content, public assets, sitemap data, and generated discovery artifacts that belong to the lander content contract.

- Use the `content_seo_specialist` custom agent for delegated content pack, SEO, AEO, AI answer-engine, metadata, and publishing-contract work.
- Keep `content/`, `data/`, `public/`, and `generated/` aligned with the current `apps/mdwrkcom` content sources.
- Do not add unsupported frontmatter fields here unless the mdwrkcom schema, validators, and publishing code understand them.
- Run the package smoke test after content pack updates so drift from `apps/mdwrkcom` is caught.
