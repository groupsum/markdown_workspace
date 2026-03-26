# mdwrk/extension-catalog-hello

Sample third-party extension package used to prove the external catalog distribution path.

This package is intentionally small and self-contained so the generated browser-installable artifact does not depend on any unbundled runtime imports.

It is not bundled into `apps/client`; it is published as a source package and transformed by the CI extension artifact pipeline into a signed external catalog artifact.
