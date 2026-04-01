# Markdown profile snapshot stability claim

This claim covers the runtime safety gate for markdown profile toggles in the client settings surface.

## Claim

- the markdown profile store reader must return a stable snapshot reference when localStorage content is unchanged
- toggling optional markdown profiles must not induce React runtime crashes caused by unstable `useSyncExternalStore` snapshots

## Gate

- command: `npm run claim:markdown-profile-snapshot`
- generated evidence:
  - `artifacts/conformance/latest/markdown-profile-snapshot-claim.json`
  - `artifacts/conformance/latest/markdown-profile-snapshot-claim-output.txt`

## Scope

- `apps/client/src/features/markdownProfiles/profileConfig.ts`
- `apps/client/src/features/markdownProfiles/profileConfig.test.ts`
