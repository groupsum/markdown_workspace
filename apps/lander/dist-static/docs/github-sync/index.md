# Github Sync

Repository Access Use a GitHub personal access token with the narrowest permissions your workflow requires. Store the token only when you want mdwrk to read from or write to a repository.

## Repository Access
Use a GitHub personal access token with the narrowest permissions your workflow requires. Store the token only when you want mdwrk to read from or write to a repository.

## Pull and Push
Typical sync flow:

1. Pull repository content into the local workspace.
2. Edit documents in mdwrk.
3. Review changes before pushing.
4. Push intentionally when the local draft is ready to leave the browser.

## Privacy Boundary
Mdwrk does not need a backend server for normal editing. Content stays on the device unless you choose to sync, export, or otherwise send it somewhere else.

## Operational Notes
For production deployments, keep GitHub links current through `VITE_GITHUB_REPO_URL`. The public lander currently points to:

```text
https://github.com/groupsum/mdwrk
```

## Frequently Asked Questions

### What is Github Sync?

Repository Access Use a GitHub personal access token with the narrowest permissions your workflow requires. Store the token only when you want mdwrk to read from or write to a repository.

### When should I use Github Sync?

Use this docs when you need direct MdWrk guidance for github sync.
