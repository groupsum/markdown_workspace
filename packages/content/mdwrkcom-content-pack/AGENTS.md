# MdWrk Content Pack Agent Instructions

This package is the packaged MdWrk public content pack. It owns reusable SEO, AEO, and AI answer-engine oriented copy, metadata, public assets, sitemap inputs, and generated discovery artifacts mirrored from `apps/mdwrkcom`.

- Use the `content_seo_specialist` custom agent for delegated MdWrk copywriting, metadata, discoverability, FAQ, comparison, docs, answer-surface, and publishing-contract work.
- Treat this package as a copywriter surface first: sharpen titles, descriptions, excerpts, headings, FAQs, and route intent for retrieval, scanability, and grounded product truth.
- Keep `content/`, `data/`, `public/`, and `generated/` aligned with the current `apps/mdwrkcom` source corpus so the packaged output stays portable and publishable.
- Do not add frontmatter, metadata, or answer-engine fields unless the mdwrkcom schemas, validators, generators, and publishing code already support them.
- Preserve present-tense, current-state product copy. Do not write speculative roadmap copy as if it is already shipped.
- Run the package smoke test after content pack updates so drift from `apps/mdwrkcom` is caught quickly.
