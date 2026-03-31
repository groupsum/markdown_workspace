# Phase 22 certification gate checklist

Date: 2026-03-31

- CommonMark official corpus lane: green (`652/652`)
- GFM official corpus lane: green (`672/672`)
- Optional profiles: green (`8/8`)
- Browser matrix lane: blocked
  - Chromium: real Playwright execution `6/6` logical checks passed
  - Firefox: unavailable
  - WebKit: unavailable
  - Playwright `--with-deps`: failed due apt DNS/package resolution
  - Playwright browser-only install: failed due CDN DNS resolution
- Visual regression lane: inherited green from Phase 20
- Packed tarball install lane: inherited green from Phase 20
- Extension compatibility lane: inherited green from Phase 20
- Docs / contract-boundary lane: inherited green from Phase 20

Certification ready: **false**
