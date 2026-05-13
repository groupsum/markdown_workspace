# @mdwrk/theme-contract

Use the theme contract package when styling needs to target governed tokens instead of private UI internals.

`@mdwrk/theme-contract` defines theme token and compatibility contracts for MdWrk surfaces. It helps themes travel across editor, preview, extension, and lander experiences without patching private implementation details.

Install:

```bash
npm install @mdwrk/theme-contract
```

This package anchors the difference between reusable visual shape and MdWrk-specific styling truth. Product theme packs can supply identity while generic packages keep stable token names.

The contract matters for portability because themes should not depend on private app selectors. A product-specific theme can express its own visual system while editor, preview, extension, and lander packages continue to consume documented tokens.

## Frequently Asked Questions

### What is @mdwrk/theme-contract?

It is the package that defines governed theme tokens and compatibility surfaces for MdWrk packages and apps.
