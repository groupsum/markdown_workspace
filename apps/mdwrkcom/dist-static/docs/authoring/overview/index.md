# Authoring Overview

MdWrk authoring documentation groups extension, theme pack, and language pack workflows into focused surfaces for package and product contributors.

## Authoring domains

The current public authoring domains documented on the lander are:

- [Extension authoring](/docs/authoring/extensions)
- [Theme pack authoring](/docs/authoring/theme-packs)
- [Language pack authoring](/docs/authoring/language-packs)

## Scope

These docs are for package authors, extension maintainers, and internal builders who need to create reusable MdWrk surfaces.

They are not the same as:

- browser or PWA usage flows
- local client operation
- extension installation or runtime-only guidance

## Ground rules

Authoring in this repository follows a few durable rules:

- reusable surfaces should live in publishable packages
- browser hosts do not run raw `npm install` at runtime for external extensions
- host/runtime trust, manifest, and compatibility declarations are part of the authoring contract
- theme and language authoring must target the shared contracts rather than app-local shortcuts

## Frequently Asked Questions

### What will I learn from Authoring Overview?

MdWrk authoring documentation groups extension, theme pack, and language pack workflows into focused surfaces for package and product contributors.

### Who should read Authoring Overview?

Read this page if you need practical MdWrk guidance for authoring overview, including the relevant workflow, product surface, and follow-up documentation paths.
