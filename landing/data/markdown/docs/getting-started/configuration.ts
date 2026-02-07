export const configurationContent = `---
title: Configuration
toc: true
---
# Configuration

MarkSpace is designed to be zero-config by default, but there are a few ways to customize your experience.

## Appearance
### Dark Mode
MarkSpace respects your system preference by default. You can manually toggle the theme using the **Sun/Moon** icon in the top navigation bar.

## Data Management
### Local Storage
Your documents are stored in **IndexedDB**. 
- **Persistence**: Data persists until you explicitly clear your browser's site data.
- **Privacy**: No data is sent to our servers.

### Resetting
If you need to wipe all local data:
1. Open your browser's Developer Tools (F12).
2. Go to the **Application** tab.
3. Select **Clear storage** and click **Clear site data**.
*Warning: This action is irreversible unless you have backed up your data.*`;