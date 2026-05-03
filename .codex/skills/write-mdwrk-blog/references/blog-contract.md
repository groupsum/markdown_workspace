# MdWrk Blog Contract

## Role

Blog posts are the dated product narrative for MdWrk. They communicate launches, releases, refinements, feature rollouts, and other timeline events in a reader-facing form.

## Source of Truth

- Content loader: `apps/lander/data/content.ts`
- Blog routes: `apps/lander/components/BlogView.tsx`
- Content map: `apps/lander/data/content-sitemap.yaml`
- Sitemap generation: `apps/lander/scripts/generate-sitemap.mjs`

Inspect the actual code, docs, and commit history behind the post before drafting it.

## Frontmatter Contract

Use this shape:

```yaml
---
title: Settings Simplification Gives MdWrk a Faster Path from Installation to Daily Use
date: 2026-05-01
status: published
author: CobyCloud
excerpt: MdWrk refines its settings UX with cleaner labels and a calmer navigation model, helping users move from install to configuration with more momentum and less friction.
---
```

Notes:

- `title`: user-facing article title
- `date`: ISO `YYYY-MM-DD`
- `status`: use `published` for live posts
- `author`: set to `CobyCloud`
- `excerpt`: blog-card summary line written in present tense
- `slug`: optional; when omitted, route shape falls back to the sitemap id after `blog/`

## Required Publishing Step

Blog files are not auto-published from the folder alone. Add an entry to `apps/lander/data/content-sitemap.yaml`.

Example:

```yaml
- id: blog/settings-simplification-for-daily-flow
  file: ./markdown/blog/settings-simplification-for-daily-flow.md
```

## Writing Pattern

1. Open with the dated product event or change.
2. Ground the story in commits, docs, or release artifacts when useful.
3. Explain what improved or arrived.
4. Show how to use it or where to learn it.
5. Include a screenshot when the UI is part of the story.

Keep titles, excerpts, and body copy in present tense. The date anchors when the work lands, but the prose should describe the product state and reader value in present-tense language.

## Starter Body

```md
The [date] update focused on ...

This work is grounded in:

- [Commit title](https://github.com/groupsum/markdown_workspace/commit/<sha>)

## What changed

- ...

## How to use it

1. ...
2. ...

## Screenshot

![Descriptive alt text](/blog/media/example.png)
```
