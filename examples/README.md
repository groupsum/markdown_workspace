# Examples

Standalone example applications that validate reusable package consumption outside the main apps.

## Included examples

- `examples/editor-basic/` — demonstrates the public editor + renderer package surfaces
- `examples/renderer-basic/` — demonstrates the public renderer package surface

## Boundary Expectation

Examples must validate **public package APIs**, not private workspace wiring.
The generated package evidence matrix checks the examples for that boundary rule explicitly.
