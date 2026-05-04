---
schema: "mdwrk.page.v1"
slug: "/privacy/"
title: "MdWrk privacy policy for local-first Markdown workflows"
description: "MdWrk privacy documentation explains the local-first storage model, explicit sharing boundaries, GitHub integration expectations, and extension trust policy."
h1: "Privacy policy"
entity: "MdWrk"
intent: "MdWrk privacy policy"
contentType: "privacy"
updatedAt: "2026-05-04"
subtitle: "MdWrk is documented as a privacy-first Markdown workspace that keeps authoring local by default and treats sync, export, integrations, and extensions as explicit user choices."
faqs:
  - question: "Does MdWrk upload documents by default?"
    answer: "The public documentation should not imply default uploads. It should describe local storage and identify workflows that intentionally use networked services."
parent: "/"
related:
  - "/features/local-first-markdown/"
  - "/security/"
tags:
  - privacy
  - local-first
  - policy
---

MdWrk's privacy policy is written around the local-first Markdown model. Public documentation should make clear that writing and previewing Markdown do not require a hosted document account as the default assumption.

## Local Content Boundary

Markdown documents, workspace state, and editor preferences should be described in terms of local control. If a workflow stores data in browser-managed storage, IndexedDB, filesystem-backed surfaces, or another local mechanism, the docs should say so plainly.

## Explicit Sharing

Export, GitHub sync, package installation, and extension workflows are deliberate actions. The privacy documentation should explain that these actions may cross the local boundary and should describe which external service or package is involved.

## Extension Trust

Extensions can add useful capabilities, but they also need trust and compatibility rules. MdWrk documents extension manifests, package identity, runtime expectations, and the idea that extension behavior should not be treated as automatically trusted.

## Public Documentation

The public privacy page is statically generated, indexable when policy allows, and mirrored into machine-readable artifacts. That makes the privacy posture inspectable before deployment.
