# Extension lifecycle

## Purpose

This document defines the normative lifecycle for Markdown Workspace extensions.

The TypeScript contract source of truth is:
- `@mdwrk/extension-host`
- `@mdwrk/extension-manifest`

## Lifecycle phases

### 1. Package discovery
The host identifies extension packages from:
- bundled workspace dependencies
- future external extension catalog entries

### 2. Manifest loading
The host loads the package manifest and validates:
- manifest schema version
- extension id
- package metadata
- contribution declarations
- capabilities
- compatibility declarations
- optional integrity metadata

### 3. Compatibility evaluation
The host evaluates compatibility against:
- manifest version
- host API version
- runtime version
- optional app version
- optional theme contract version
- optional renderer/editor version requirements

### 4. Capability evaluation
The host determines whether the extension may be activated with the requested capabilities.

### 5. Activation
The host constructs `ExtensionContext` and calls `activate(context)`.

During activation the extension may:
- register commands
- register views
- register components
- register action rail items
- register settings sections
- register locale catalogs
- register extension-local services

### 6. Runtime operation
While active, the extension:
- responds to host commands or UI interactions
- consumes host APIs only through the context/host contract
- persists namespaced configuration through `context.config`
- emits diagnostics through the host diagnostics surface

### 7. Deactivation
The host may deactivate an extension because:
- the user disabled it
- compatibility changed
- the package is being updated or removed
- the host is shutting down

The host then:
- calls `deactivate(context)` when present
- disposes all registered contributions
- clears transient runtime resources

### 8. Post-deactivation state
Persistent configuration may remain.
Transient registrations and subscriptions must not remain active.

## Authoring rules

- activation must be safe to call once per enablement cycle
- deactivation must be idempotent
- all registrations must be disposable
- extensions must not depend on activation ordering beyond documented host guarantees
- extensions must not mutate host internals outside the host contract
- extensions must not assume undeclared capabilities

## Failure handling

If activation fails:
- the runtime records a diagnostic
- the extension is marked unhealthy
- partial registrations must be disposed
- the host remains stable

## Evidence required later

Certification-phase lifecycle evidence should include:
- activation tests
- deactivation tests
- diagnostics on failure
- persistence roundtrip tests
- compatibility rejection tests
