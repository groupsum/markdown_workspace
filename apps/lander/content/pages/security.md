---
schema: "mdwrk.page.v1"
slug: "/security/"
title: "MdWrk security notes for packages, extensions, and static docs"
description: "MdWrk security notes explain package boundaries, extension trust, static content verification, robots policy, and deployable artifact checks."
h1: "Security notes"
entity: "MdWrk"
intent: "MdWrk security documentation"
contentType: "security"
updatedAt: "2026-05-04"
answer: "MdWrk security documentation focuses on package boundaries, extension trust, static build verification, link integrity, and public artifacts that can be inspected before deployment."
parent: "/"
related:
  - "/privacy/"
  - "/features/extension-platform/"
tags:
  - security
  - verification
  - extensions
---

MdWrk security documentation explains how the public lander and product surfaces should be reviewed. The static compiler is part of that posture because it verifies source content and generated artifacts before deployment.

## Package Boundaries

Reusable packages should have clear responsibilities. Editor, renderer, extension host, theme contract, and static lander surfaces should not blur into one unreviewable runtime.

## Extension Trust

Extensions need explicit trust policy. The documentation should describe manifest metadata, compatibility expectations, package identity, and how users can reason about what an extension is allowed to do.

## Static Artifact Verification

The public lander build verifies HTML, links, JSON-LD, sitemap output, robots policy, LLM index files, Markdown mirrors, and the content registry. These checks help prevent empty app shells or hidden primary content from being treated as deployable.

## Deployment Smoke Checks

Production URL checks are post-deploy smoke checks. They should verify that the deployed response contains expected content, but they should not be required to create a valid deployable artifact.
