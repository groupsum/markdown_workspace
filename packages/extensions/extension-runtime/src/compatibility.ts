import { EXTENSION_HOST_API_VERSION } from "@mdwrk/extension-host";
import {
  EXTENSION_MANIFEST_VERSION,
  EXTENSION_RUNTIME_API_BASELINE,
  type ExtensionManifest,
} from "@mdwrk/extension-manifest";
import { THEME_CONTRACT_VERSION } from "@mdwrk/theme-contract";
import type { ExtensionRuntimeCompatibilityIssue, ExtensionRuntimeCompatibilityResult } from "./types.js";

interface CompatibilityContext {
  readonly hostApiVersion: string;
  readonly hostVersion: string;
  readonly runtimeVersion: string;
  readonly themeContractVersion: string;
  readonly rendererVersion?: string;
  readonly editorVersion?: string;
}

interface ParsedVersion {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

const parseVersion = (value: string): ParsedVersion | null => {
  const match = value.trim().match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
};

const compareVersions = (left: string, right: string): number => {
  const a = parseVersion(left);
  const b = parseVersion(right);
  if (!a || !b) {
    return left === right ? 0 : left.localeCompare(right);
  }
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.patch - b.patch;
};

const matchesComparator = (actual: string, comparator: string): boolean => {
  const trimmed = comparator.trim();
  if (!trimmed || trimmed === "*") return true;

  if (trimmed.startsWith("^")) {
    const expected = parseVersion(trimmed.slice(1));
    const current = parseVersion(actual);
    if (!expected || !current) return actual === trimmed.slice(1);
    return current.major == expected.major && compareVersions(actual, `${expected.major}.${expected.minor}.${expected.patch}`) >= 0;
  }

  if (trimmed.startsWith("~")) {
    const expected = parseVersion(trimmed.slice(1));
    const current = parseVersion(actual);
    if (!expected || !current) return actual === trimmed.slice(1);
    return current.major == expected.major && current.minor == expected.minor && compareVersions(actual, `${expected.major}.${expected.minor}.${expected.patch}`) >= 0;
  }

  const operators = [">=", "<=", ">", "<"] as const;
  for (const operator of operators) {
    if (trimmed.startsWith(operator)) {
      const expected = trimmed.slice(operator.length).trim();
      const delta = compareVersions(actual, expected);
      if (operator === ">=") return delta >= 0;
      if (operator === "<=") return delta <= 0;
      if (operator === ">") return delta > 0;
      return delta < 0;
    }
  }

  return compareVersions(actual, trimmed) === 0;
};

export function satisfiesVersionRange(actual: string, range: string | number | undefined): boolean {
  if (range == null) return true;
  const normalized = String(range).trim();
  if (!normalized || normalized === "*") return true;
  return normalized.split(/\s+/).every((part) => matchesComparator(actual, part));
}

export function evaluateExtensionCompatibility(
  manifest: ExtensionManifest,
  context: CompatibilityContext = {
    hostApiVersion: EXTENSION_HOST_API_VERSION,
    hostVersion: "0.0.0",
    runtimeVersion: EXTENSION_RUNTIME_API_BASELINE,
    themeContractVersion: THEME_CONTRACT_VERSION,
    rendererVersion: undefined,
    editorVersion: undefined,
  },
): ExtensionRuntimeCompatibilityResult {
  const issues: ExtensionRuntimeCompatibilityIssue[] = [];

  if (manifest.manifestVersion !== EXTENSION_MANIFEST_VERSION) {
    issues.push({
      target: "manifestVersion",
      expected: EXTENSION_MANIFEST_VERSION,
      actual: manifest.manifestVersion,
      message: `Manifest version ${String(manifest.manifestVersion)} is incompatible with runtime manifest baseline ${EXTENSION_MANIFEST_VERSION}.`,
    });
  }

  const checks: ReadonlyArray<[ExtensionRuntimeCompatibilityIssue["target"], string | number | undefined, string]> = [
    ["hostApi", manifest.compatibility.hostApi, context.hostApiVersion],
    ["runtime", manifest.compatibility.runtime, context.runtimeVersion],
    ["app", manifest.compatibility.app, context.hostVersion],
    ["themeContract", manifest.compatibility.themeContract, context.themeContractVersion],
    ["renderer", manifest.compatibility.renderer, context.rendererVersion ?? "0.0.0"],
    ["editor", manifest.compatibility.editor, context.editorVersion ?? "0.0.0"],
  ];

  for (const [target, expected, actual] of checks) {
    if (expected == null) continue;
    if (!satisfiesVersionRange(actual, expected)) {
      issues.push({
        target,
        expected,
        actual,
        message: `Expected ${target} to satisfy ${String(expected)}, received ${actual}.`,
      });
    }
  }

  return {
    compatible: issues.length === 0,
    issues,
  };
}
