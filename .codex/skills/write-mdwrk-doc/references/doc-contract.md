# MdWrk Doc Contract

## Role

Docs are the stable product reference for MdWrk. They explain current installation, configuration, usage, authoring, extensions, workspace behavior, and deployment surfaces from the live repository state.

## Source of Truth

- Loader: `apps/lander/data/docs.ts`
- Content root: `apps/lander/data/markdown/docs`
- Sitemap source for docs: `apps/lander/scripts/generate-sitemap.mjs`

Inspect the code or workflow you are documenting before you draft the doc.

## Frontmatter Contract

Use this shape:

```yaml
---
title: Local Setup
slug: getting-started/local-setup
section: Getting Started
sectionOrder: 1
order: 4
toc: true
date: 2026-05-02
status: published
---
```

Notes:

- `title`: user-facing Title Case title
- `slug`: route segment after `/docs/`
- `section`: visible docs group label
- `sectionOrder`: lower values sort earlier
- `order`: lower values sort earlier within a section
- `toc`: optional, use when the page benefits from a table of contents
- `date`: ISO `YYYY-MM-DD`
- `status`: use `published` for live docs

## Path Guidance

- Put getting-started docs under `apps/lander/data/markdown/docs/getting-started`
- Put broader product docs under the matching topical subtree when one already exists
- Prefer existing section names before inventing new ones

## Writing Pattern

1. Open with what the workflow or surface enables.
2. State who the path is for when that helps route the user.
3. Provide prerequisites.
4. Provide the live commands or UI flow.
5. Link to adjacent docs for the next step.

## Starter Body

```md
Use this page when you want to ...

## What it covers

...

## Prerequisites

- ...

## Workflow

1. ...
2. ...

```bash
...
```
```

