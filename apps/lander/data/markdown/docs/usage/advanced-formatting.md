---
title: mdwrk Markdown Formatting
slug: usage/advanced-formatting
section: Product
sectionOrder: 2
order: 2
toc: true
---

The mdwrk renderer supports GitHub Flavored Markdown plus the optional profile surfaces documented elsewhere in the repo.

## Core Syntax
Use standard Markdown for headings, paragraphs, links, emphasis, blockquotes, code, and lists.

```markdown
# Release Notes

MdWork keeps drafts local by default.
```

## GitHub-Flavored Markdown
MdWork supports common GitHub-Flavored Markdown patterns, including tables and task lists.

```markdown
| Area | Status |
| :--- | :--- |
| Local storage | Ready |
| GitHub sync | Optional |

- [x] Draft locally
- [ ] Sync when ready
```

## Code Blocks
Fence code blocks with a language name to preserve readable source snippets.

````markdown
```ts
const storageMode = "local-first";
```
````

## Preview Contract
The preview surface on the client and on this lander both run through `@mdwrk/markdown-renderer-react`, so list rendering, code blocks, tables, and callouts stay aligned across documentation and application views.

## Production Guidance
Keep documents portable. Prefer Markdown syntax that renders cleanly across mdwrk, GitHub, npm, and static documentation sites.
