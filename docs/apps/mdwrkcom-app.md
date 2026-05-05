# @mdwrk/mdwrkcom application reference

## Purpose

`@mdwrk/mdwrkcom` is the public-facing lander/documentation application for the Markdown Workspace repository.
It should document the mdwrk client, reusable packages, and extension platform rather than treating itself as the main documentation subject.

## Public configuration surface

The lander app is intentionally narrow in surface area.
Its public configuration is primarily the static site build/deploy environment and the content/docs data sources under `apps/mdwrkcom/data/*`.
Documentation authored for the lander should point outward to client and extension surfaces, not inward to the lander as product scope.

## Dependency boundary map

The lander consumes reusable package surfaces and app-local content utilities, but it is **not** allowed to reach into `apps/client/*` internals.
This separation is part of the Phase 11 boundary audit.

## Release / deploy notes

- build command: `npm run build -w @mdwrk/mdwrkcom`
- preview command: `npm run preview -w @mdwrk/mdwrkcom`
- deploy target: static-site output from the Vite build

## Conformance record

The lander app is documented in the Phase 11 package evidence matrix as a deployable app workspace with explicit dependency boundaries.

## Support / ownership

- status: first-party maintained
- ownership: repository core maintainers
- support level: supporting public-facing application
