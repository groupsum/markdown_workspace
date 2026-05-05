---
title: Extension Platform
slug: extensions/extension-platform
section: Extensions
sectionOrder: 4
order: 1
toc: true
date: 2026-01-22
status: published
excerpt: MdWrk extensions are governed through manifest metadata, host APIs, runtime activation, manager UX, settings, permissions, and compatibility checks.
---

## Runtime shape

The extension stack is split into governed surfaces:

- `@mdwrk/extension-manifest` for declarative metadata
- `@mdwrk/extension-host` for host-safe APIs
- `@mdwrk/extension-runtime` for activation, registration, and lifecycle
- `@mdwrk/extension-manager` for installed and bundled extension UX

## Host responsibilities

The client owns:

- capability gating
- trust policy enforcement
- settings registration
- command, view, and action-rail registration
- theme, i18n, and diagnostics adapters

## Bundled first-party extensions

Current first-party extension surfaces documented in this repo include:

- Theme Studio
- Gemini Agent
- Extension Manager
- Language pack tooling

## External installables

External extensions do not run through ad hoc `npm install` inside the browser. They ship as signed installable artifacts with manifest, integrity, and compatibility declarations.

## Quick Reference

Use this article to understand Extension Platform in the MdWrk Extensions surface. Extension Platform explains how the MdWrk client hosts governed extension packages, runtime lifecycle, capability checks, and operator-facing extension management.

Key concepts covered here:

- extension host contracts
- developer package reuse
- `@mdwrk/extension-manifest`
- `@mdwrk/extension-host`
- `@mdwrk/extension-runtime`

Useful follow-up pages:

- [Extension Authoring](/docs/authoring/extensions)
- [MdWrk Extension Host](/features/extension-host)
- [Theme Studio And Host Surfaces](/docs/extensions/theme-studio-and-host-surfaces)

The MdWrk client is the extension host. The lander only documents that host surface.
