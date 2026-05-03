---
name: write-mdwrk-blog
description: Write or revise a MdWrk lander blog post for apps/lander/data/markdown/blog using the live blog frontmatter, user-facing product tone, repo-history links, screenshots, and sitemap-backed publishing flow. Use when Codex needs to add a new post, rewrite an existing post, turn a release or feature milestone into a dated article, or wire a new blog file into content-sitemap.yaml.
---

# Write MdWrk Blog

Write blog posts as dated user-facing product stories about MdWrk changes, launches, milestones, and feature rollouts.

Read `references/blog-contract.md` before drafting. It contains the frontmatter contract, sitemap requirement, and a starter template.

## Workflow

1. Inspect the relevant code, docs, and commit history before writing the post.
2. Confirm the user-facing event or change the post is about.
3. Place the markdown file under `apps/lander/data/markdown/blog`.
4. Add or update the matching `blog/...` entry in `apps/lander/data/content-sitemap.yaml`.
5. Write the post with a user-facing title, `author: CobyCloud`, a dated frontmatter block, concrete usage details, and links to docs or repo history where useful.
6. Include a screenshot when the post benefits from a visible product surface.
7. Verify the post reads as product communication, not internal strategy commentary.

## Tone

- Write for readers discovering or tracking MdWrk over time.
- Lead with what changed and what it unlocks in use.
- Keep the voice vivid, technical, concrete, and product-facing.
- Keep the prose in present tense, including dated retrospective posts. Historical dates can anchor the event, but the article should describe MdWrk's capabilities and product meaning in present-tense language.
- Market the product through clarity, examples, commands, screenshots, and links.
- Do not expose internal content strategy or talk about SEO, AEO, AI-EO, search targeting, answer-engine targeting, sales intent, or copy strategy.
- Do not define a feature through negation. Describe the capability directly.

## Content Rules

- Use a user-facing title that communicates value immediately.
- Avoid redundant titles across the blog set.
- Always set `author: CobyCloud`.
- Use an excerpt that reads cleanly on blog cards.
- Keep titles, excerpts, and body copy in present tense.
- Include installation, usage, upgrade, or rollout details where applicable.
- Link to current docs with site-relative paths like `/docs/getting-started/installation`.
- Link to concrete repo history when commit links strengthen the story.
- Use screenshots from `/blog/media/...` when a visual helps.
- Keep the post focused on the product event or change itself.

## Publish Checks

- The file lives under `apps/lander/data/markdown/blog`.
- Frontmatter includes `title`, `date`, `status`, `author`, and `excerpt`.
- `status` is publish-ready and `date` is an ISO date that should be live.
- The post is listed in `apps/lander/data/content-sitemap.yaml` with a `blog/...` id and matching file path.
- The links, screenshot paths, and slug behavior make sense for the current post.
