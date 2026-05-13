# Examples

[![Hits](https://visitor-badge.laobi.icu/badge?page_id=groupsum.markdown_workspace.examples.readme&left_text=hits)](https://github.com/groupsum/markdown_workspace/blob/master/examples/README.md)
[![Downloads](https://img.shields.io/github/downloads/groupsum/markdown_workspace/total?label=downloads)](https://github.com/groupsum/markdown_workspace/releases)

Standalone example applications that validate reusable package consumption outside the main apps.

## Included examples

- `examples/editor-basic/` — demonstrates the public editor + renderer package surfaces
- `examples/renderer-basic/` — demonstrates the public renderer package surface

## Boundary Expectation

Examples must validate **public package APIs**, not private workspace wiring.
The generated package evidence matrix checks the examples for that boundary rule explicitly.
