---
name: write-mdwrk-doc
description: Write or revise a MdWrk lander doc for apps/lander/data/markdown/docs using the live frontmatter schema, current-state product tone, and repo-grounded usage details. Use when Codex needs to add a new doc, expand installation or configuration guidance, refresh docs from source truth, or rewrite a doc so it reads as user-facing MdWrk product documentation.
---

# Write MdWrk Doc

Write docs as the canonical current-state reference for MdWrk. Keep them grounded in the live repository, product surfaces, and actual commands.

Read `references/doc-contract.md` before drafting. It contains the frontmatter contract, path rules, and a starter template.

## Workflow

1. Inspect the relevant source files before writing. Prefer the real app, package, workflow, or script over older prose.
2. Read 1-3 nearby docs in `apps/lander/data/markdown/docs` so section naming, ordering, and depth stay consistent.
3. Place the new file in the matching docs subtree and set frontmatter that fits the loader in `apps/lander/data/docs.ts`.
4. Write the body as present-state usage guidance with concrete commands, routes, options, or workflows.
5. Link to adjacent docs when they help the user move forward.
6. Verify the doc is publishable through metadata alone. Docs are discovered automatically from the docs tree and sitemap generation reads them directly.

## Tone

- Write for users, adopters, implementers, and operators.
- Explain what MdWrk is by describing its capabilities and workflows.
- Keep the voice direct, concrete, and product-facing.
- Focus on current behavior, current commands, and current boundaries.
- Use positive product language. Do not expose internal content strategy or talk about SEO, AEO, AI-EO, audience targeting, selling strategy, or narrative mechanics.
- Do not define a feature through negation. Describe what it does.

## Content Rules

- Use Title Case in `title`.
- Keep `slug` aligned with the docs route shape, such as `getting-started/local-setup`.
- Prefer short sections with actionable headings.
- Include installation, configuration, usage, or operational details when applicable.
- Include code blocks only for real commands or realistic examples.
- Cite neighboring docs with site-relative links like `/docs/getting-started/installation`.
- Keep the doc on in-bounds product surface. Do not drift into unrelated roadmap or internal process copy.

## Publish Checks

- The file lives under `apps/lander/data/markdown/docs/**`.
- Frontmatter includes `title`, `slug`, `section`, `sectionOrder`, `order`, `date`, and `status`.
- `status` is publish-ready and `date` is an ISO date that should be live.
- The body matches current repo truth.
- The doc does not need a manual `content-sitemap.yaml` entry.

