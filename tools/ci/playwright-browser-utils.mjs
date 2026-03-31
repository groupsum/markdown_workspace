import { existsSync } from 'node:fs';

export function candidatePaths(name, playwrightPath) {
  const envOverride = process.env[`PLAYWRIGHT_${name.toUpperCase()}_EXECUTABLE`];
  const paths = [];

  if (envOverride) {
    paths.push({ path: envOverride, source: 'env' });
  }

  if (playwrightPath) {
    paths.push({ path: playwrightPath, source: 'playwright-cache' });
  }

  if (name === 'chromium') {
    for (const candidate of [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/usr/bin/google-chrome-stable',
    ]) {
      paths.push({ path: candidate, source: 'system-fallback' });
    }
  }

  if (name === 'firefox') {
    for (const candidate of ['/usr/bin/firefox', '/usr/bin/firefox-esr']) {
      paths.push({ path: candidate, source: 'system-fallback' });
    }
  }

  if (name === 'webkit') {
    for (const candidate of [
      '/usr/bin/epiphany-browser',
      '/usr/libexec/webkit2gtk-4.1/MiniBrowser',
      '/usr/libexec/webkit2gtk-4.0/MiniBrowser',
    ]) {
      paths.push({ path: candidate, source: 'system-fallback' });
    }
  }

  return paths;
}

export function probeBrowser(name, browserType) {
  const playwrightExecutablePath = browserType.executablePath();
  const candidates = candidatePaths(name, playwrightExecutablePath);
  const resolved = candidates.find((candidate) => existsSync(candidate.path)) || null;

  return {
    browser: name,
    playwrightExecutablePath,
    resolvedExecutablePath: resolved?.path ?? playwrightExecutablePath,
    resolvedFrom: resolved?.source ?? 'unavailable',
    executableExists: Boolean(resolved),
    candidates,
  };
}

export function browserAvailabilitySnapshot(playwright) {
  return [
    probeBrowser('chromium', playwright.chromium),
    probeBrowser('firefox', playwright.firefox),
    probeBrowser('webkit', playwright.webkit),
  ];
}

export function parsePlaywrightJsonSummary(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    const stats = parsed?.stats ?? {};
    return {
      expected: stats.expected ?? null,
      unexpected: stats.unexpected ?? null,
      skipped: stats.skipped ?? null,
      flaky: stats.flaky ?? null,
      duration: stats.duration ?? null,
      ok: (stats.unexpected ?? 0) === 0,
    };
  } catch {
    return null;
  }
}
