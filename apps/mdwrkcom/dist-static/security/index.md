# Security notes

MdWrk security documentation focuses on package boundaries, extension trust, static build verification, link integrity, and public artifacts that can be inspected before deployment.

MdWrk security documentation explains how the public lander and product surfaces should be reviewed. The static compiler is part of that posture because it verifies source content and generated artifacts before deployment.

## Package Boundaries

Reusable packages should have clear responsibilities. Editor, renderer, extension host, theme contract, and static lander surfaces should not blur into one unreviewable runtime.

## Extension Trust

Extensions need explicit trust policy. The documentation should describe manifest metadata, compatibility expectations, package identity, and how users can reason about what an extension is allowed to do.

## Static Artifact Verification

The public lander build verifies HTML, links, JSON-LD, sitemap output, robots policy, LLM index files, Markdown mirrors, and the content registry. These checks help prevent empty app shells or hidden primary content from being treated as deployable.

## Deployment Smoke Checks

Production URL checks are post-deploy smoke checks. They should verify that the deployed response contains expected content, but they should not be required to create a valid deployable artifact.

## Frequently Asked Questions

### What security topics does this MdWrk page cover?

MdWrk security notes explain package boundaries, extension trust, static content verification, robots policy, and deployable artifact checks.

### Which MdWrk security boundaries should teams review?

Review package boundaries, extension trust, static content verification, robots policy, deployable artifact checks, and any integration that crosses the local workspace boundary.
