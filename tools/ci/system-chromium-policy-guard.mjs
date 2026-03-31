import { existsSync, mkdtempSync, readdirSync, renameSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const POLICY_DIR = '/etc/chromium/policies/managed';

export function quarantineSystemChromiumPolicies(chromiumProbe) {
  const report = {
    active: false,
    policyDir: POLICY_DIR,
    backupDir: null,
    movedEntries: [],
    skippedReason: null,
    restoreErrors: [],
  };

  const runningAsRoot = typeof process.getuid === 'function' ? process.getuid() === 0 : false;
  const usingSystemChromium = chromiumProbe?.resolvedFrom === 'system-fallback';

  if (process.platform !== 'linux') {
    report.skippedReason = 'system policy quarantine is only relevant on Linux';
    return { report, restore: () => report };
  }

  if (!runningAsRoot) {
    report.skippedReason = 'system policy quarantine requires root privileges';
    return { report, restore: () => report };
  }

  if (!usingSystemChromium) {
    report.skippedReason = 'the resolved Chromium executable is not the system fallback binary';
    return { report, restore: () => report };
  }

  if (!existsSync(POLICY_DIR)) {
    report.skippedReason = 'system Chromium policy directory is absent';
    return { report, restore: () => report };
  }

  const entries = readdirSync(POLICY_DIR);
  if (entries.length === 0) {
    report.skippedReason = 'system Chromium policy directory is already empty';
    return { report, restore: () => report };
  }

  const backupDir = mkdtempSync(path.join(os.tmpdir(), 'mdwrk-chromium-policy-'));
  report.backupDir = backupDir;

  for (const entry of entries) {
    renameSync(path.join(POLICY_DIR, entry), path.join(backupDir, entry));
    report.movedEntries.push(entry);
  }

  report.active = true;

  return {
    report,
    restore() {
      if (!report.active || !report.backupDir) {
        return report;
      }

      for (const entry of report.movedEntries) {
        const backupPath = path.join(report.backupDir, entry);
        const destinationPath = path.join(POLICY_DIR, entry);

        try {
          renameSync(backupPath, destinationPath);
        } catch (error) {
          report.restoreErrors.push(String(error?.message || error));
        }
      }

      try {
        rmSync(report.backupDir, { recursive: true, force: true });
      } catch (error) {
        report.restoreErrors.push(String(error?.message || error));
      }

      report.active = false;
      return report;
    },
  };
}
