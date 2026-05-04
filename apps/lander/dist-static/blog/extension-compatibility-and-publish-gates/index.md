# Extension Compatibility Gates Turn MdWrk Publishing into a Clear Quality Signal

MdWrk sharpens extension compatibility checks, persistence flows, and publish gates, helping teams ship installable extensions with stronger confidence and cleaner runtime expectations.

## Why this matters for extension teams

A governed extension platform works best when it communicates:

- the host version it supports
- the tests that protect installation and runtime
- the UX where users manage extensions and settings

## Example compatibility-focused workflow

```bash
npm run test -w @mdwrk/extension-runtime
npm run test -w @mdwrk/extension-manager
npm run validate:compatibility
```

## Screenshot

![MdWrk settings and extension-related configuration surfaces](/blog/media/mdwrk-settings-visual.png)

## What to read next

- [Extension platform](/docs/extensions/extension-platform)
- [Extension authoring](/docs/authoring/extensions)
- [April 1 repository history](https://github.com/groupsum/markdown_workspace/commits/master/?since=2026-04-01T00:00:00Z&until=2026-04-02T00:00:00Z)

This post marks the point where MdWrk's extension system becomes easier to trust, easier to document, and easier to carry into release workflows.

## Frequently Asked Questions

### What does this MdWrk article cover?

MdWrk sharpens extension compatibility checks, persistence flows, and publish gates, helping teams ship installable extensions with stronger confidence and cleaner runtime expectations.

### What should readers take away from this article?

This article explains the MdWrk product change, the workflow it affects, and where readers can continue in the related documentation.
