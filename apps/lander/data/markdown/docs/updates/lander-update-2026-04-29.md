---
title: Archive: Lander Update 2026-04-29
slug: updates/lander-update-2026-04-29
section: Archive
sectionOrder: 6
order: 1
toc: true
---
This update tightens the MdWork public lander for production deployment, discoverability, and navigation clarity.

## Public Metadata
- Added `robots.txt` and `llms.txt` for crawler and assistant discovery.
- Added a favicon and Open Graph image asset for embedded link previews.
- Updated link metadata to use current Open Graph and Twitter card fields.
- Added a generated `sitemap.xml` so public routes and docs stay discoverable.

## Deployment
- Updated the lander Nginx listener so the container serves on the expected internal port.
- Kept Docker Compose services internal-only by avoiding exposed ports.
- Added build-time site URL support for generated sitemap and robots output.

## Navigation
- Updated the GitHub repository link to `groupsum/mdwrk`.
- Updated the X link to the Swarmauri profile.
- Updated the npm link to the MdWork organization page.
- Removed the duplicate footer GitHub repository link.

## Layout
- Restored document-level vertical scrolling on the lander.
- Kept the docs sidebar independently scrollable only on desktop.
