# Client Version Delivery

The client is now published as a retained, versioned static bundle instead of a single mutable root build.

## Output Layout

- `/` serves a lightweight bootstrap shell.
- `/client/versions/index.json` is the retained-version manifest.
- `/client/versions/<appVersion>/` contains the immutable client bundle for that release.

## Version Meanings

- `runningVersion`: the version compiled into the UI currently executing.
- `installedVersion`: the service-worker-controlled version active for the current retained scope.
- `selectedVersion`: the retained version the user is currently navigating under.
- `latestVersion`: the most recent retained version listed in `index.json`.
- `UPDATE_READY`: a waiting worker exists for the current retained scope.
- `NEWER_VERSION_AVAILABLE`: a newer retained version exists, but no waiting worker is ready for the current scope.

## Storage Compatibility

- Client storage compatibility is gated by `storageSchema`.
- The current schema token is `lattice-idb-v3`.
- Only retained versions with an exact schema match are selectable in the UI.
- Version switching does not migrate data; incompatible versions remain visible but disabled.

## Release Flow

- `npm run build -w apps/client` builds the current app version into `/client/versions/<appVersion>/`.
- The build also emits `/client/versions/index.json` and a root bootstrap shell in `apps/client/dist`.
- If `CLIENT_RETAINED_SOURCE_DIR` points at a prior retained bundle root, the build imports its retained manifest/directories, appends the new version, and prunes to the latest 5.

## Rollback Notes

- Service workers are scoped per retained version directory.
- Cache metadata and failed-version tracking are isolated per version scope.
- Fallback behavior only serves cached app shell content from the same selected version scope.
