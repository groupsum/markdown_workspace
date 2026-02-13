# MarkSpace Style Guide: Supported Viewports

This document defines the supported device-size and aspect-ratio matrix for UI validation.

## Aspect Ratio Bands
- **Portrait**: `max-aspect-ratio: 3/4`
- **Square / Hybrid**: `min-aspect-ratio: 3/4` and `max-aspect-ratio: 4/3`
- **Landscape**: `min-aspect-ratio: 4/3` and `max-aspect-ratio: 16/9`
- **Wide**: `min-aspect-ratio: 16/9` and `max-aspect-ratio: 21/9`
- **Ultra-wide**: `min-aspect-ratio: 21/9`

## Width Tiers
- **XS**: `max-width: 480px`
- **SM**: `max-width: 640px`
- **MD**: `max-width: 900px`
- **LG**: `max-width: 1200px`
- **XL**: `min-width: 1600px`
- **XXL**: `min-width: 1920px`

## Height Tiers
- **Short**: `max-height: 520px`
- **Compact**: `max-height: 720px`
- **Tall**: `min-height: 900px`
- **Ultra-tall**: `min-height: 1200px`

## Device Class
- **Touch**: `hover: none` + `pointer: coarse`
- **Precision**: `hover: hover` + `pointer: fine`

## Test Profiles We Validate
- Portrait
- Landscape
- Mobile PWA
- Mobile web browser
- Tablet
- Half-screen desktop
- Full-screen desktop
- Ultra-wide desktop

Source of truth: `client/public/css/base/viewports.css`.
