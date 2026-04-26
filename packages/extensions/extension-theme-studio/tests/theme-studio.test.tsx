// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@mdwrk/testing/vitest-setup";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  ThemeStudioSettingsPanel,
} from "../src/components/ThemeStudioSettingsPanel.js";
import {
  ThemeStudioView,
} from "../src/components/ThemeStudioView.js";
import { createThemeStudioService } from "../src/service.js";
import type {
  ThemeStudioExportArtifacts,
  ThemeStudioService,
  ThemeStudioServiceSnapshot,
} from "../src/types.js";

vi.mock("@mdwrk/markdown-editor-react", () => ({
  MarkdownSourceEditor: () => <div data-testid="mock-theme-editor" />,
  createMarkdownEditorThemeStyleFromThemeTokens: () => "",
}));

vi.mock("@mdwrk/markdown-renderer-react", () => ({
  MarkdownRenderer: () => <div data-testid="mock-theme-renderer" />,
  createMarkdownRendererThemeStyleFromThemeTokens: () => "",
}));

const formatLabel = (label: I18nLabel | string): string => typeof label === "string" ? label : label.defaultMessage;

function createMockThemeStudioService(snapshotPatch: Partial<ThemeStudioServiceSnapshot> = {}) {
  let snapshot: ThemeStudioServiceSnapshot = {
    busy: false,
    tokenDefinitions: [{ name: "color.background.canvas", category: "color", description: "Canvas color", defaultValue: "#ffffff" } as any],
    classDefinitions: [],
    rendererBridge: [],
    editorBridge: [],
    currentTokens: { "color.background.canvas": "#ffffff" } as any,
    draftTokens: {},
    relationships: [],
    metadata: {
      themeId: "test-theme",
      themeName: "Test Theme",
      packageName: "@mdwrk/theme-test-theme",
      author: "Test Author",
      description: "Test theme description",
    },
    lastExports: null,
    infoMessage: "Ready",
    lastError: null,
    ...snapshotPatch,
  };

  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of Array.from(listeners)) listener();
  };

  const service: ThemeStudioService = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    refresh: vi.fn(async () => {}),
    readSettings: vi.fn(async () => ({
      autoPreviewOnEdit: true,
      defaultExportTarget: "host",
      compactCss: false,
      packageNamePrefix: "@mdwrk/theme-",
      defaultAuthor: "Test Author",
    })),
    setDraftToken: vi.fn(async () => {}),
    setDraftTokens: vi.fn(async () => {}),
    clearDraftToken: vi.fn(async () => {}),
    preview: vi.fn(async () => {}),
    apply: vi.fn(async () => {}),
    revert: vi.fn(async () => {}),
    updateMetadata: vi.fn(async (patch) => {
      snapshot = { ...snapshot, metadata: { ...snapshot.metadata, ...patch } };
      emit();
    }),
    generateExports: vi.fn(async () => {
      const exports: ThemeStudioExportArtifacts = {
        preset: { metadata: { id: "test-theme", name: "Test Theme" }, compatibility: { contract: "1.0.0" }, tokens: {} } as any,
        json: "{}",
        hostCss: ":root {}",
        rendererCss: ":root {}",
        editorCss: ":root {}",
        packageArtifact: { packageName: "@mdwrk/theme-test-theme", files: [] },
      };
      snapshot = { ...snapshot, lastExports: exports };
      emit();
      return exports;
    }),
    importPackageArtifact: vi.fn(async () => {}),
  };

  return {
    service,
    setSnapshot(patch: Partial<ThemeStudioServiceSnapshot>) {
      snapshot = { ...snapshot, ...patch };
      emit();
    },
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Theme Studio settings and view surfaces", () => {
  it("renders the settings panel summary and opens the studio", () => {
    const { service } = createMockThemeStudioService();
    const open = vi.fn(async () => {});

    render(
      <ThemeStudioSettingsPanel
        service={service}
        open={open}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.getByText("test-theme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open studio" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open studio" }));
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("renders the workspace view, exposes the split resizer, and surfaces error state", () => {
    const { service } = createMockThemeStudioService({ lastError: "Theme Studio failed to refresh." });

    render(
      <ThemeStudioView
        service={service}
        close={vi.fn(async () => {})}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.getByRole("separator", { name: "Resize Theme Studio panes" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Metadata" }));
    expect(screen.getByText("Theme Studio failed to refresh.")).toBeInTheDocument();
    expect(screen.getByTestId("mock-theme-editor")).toBeInTheDocument();
    expect(screen.getByTestId("mock-theme-renderer")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Apply draft theme"));
    expect(service.apply).toHaveBeenCalledTimes(1);
  });
});

describe("createThemeStudioService", () => {
  it("applies the draft, clears it, and publishes diagnostics and notifications", async () => {
    const diagnostics: Array<{ severity: string; code: string; detail?: string }> = [];
    const notifications: string[] = [];
    const previewTheme = vi.fn(async () => {});
    const applyDraft = vi.fn(async () => {});
    const getTokenMap = vi.fn(async () => ({ "color.background.canvas": "#111111" }));
    const getTokens = vi.fn(async () => []);
    const getClassNames = vi.fn(async () => []);
    const getThemeBridge = vi.fn(async () => []);
    const exportTheme = vi.fn(async () => ({
      metadata: { id: "test-theme", name: "Test Theme", author: "Test Author", description: "Theme description" },
      compatibility: { contract: "1.0.0" },
      tokens: {},
    }));

    const service = createThemeStudioService({
      context: {
        extensionId: "core.theme-studio",
        config: {
          async get(key: string) {
            const values: Record<string, unknown> = {
              "core.theme-studio.autoPreviewOnEdit": false,
              "core.theme-studio.defaultExportTarget": "host",
              "core.theme-studio.compactCss": false,
              "core.theme-studio.packageNamePrefix": "@mdwrk/theme-",
              "core.theme-studio.defaultAuthor": "Test Author",
            };
            return values[key] ?? null;
          },
          async set() {},
          async remove() {},
          watch() {
            return { dispose() {} };
          },
        },
        host: {
          theme: {
            previewTheme,
            applyDraft,
            discardDraft: vi.fn(async () => {}),
            getTokenMap,
            getTokens,
            getClassNames,
            getThemeBridge,
            exportTheme,
          },
          diagnostics: {
            publish: vi.fn(async (_extensionId: string, record: { severity: string; code: string; detail?: string }) => {
              diagnostics.push(record);
            }),
          },
          notifications: {
            info: vi.fn(async (message: I18nLabel | string) => {
              notifications.push(formatLabel(message));
            }),
          },
        },
      } as any,
      formatLabel,
    });

    await service.setDraftToken("color.background.canvas" as any, "#111111");
    await service.apply();

    expect(previewTheme).toHaveBeenCalled();
    expect(applyDraft).toHaveBeenCalledTimes(1);
    expect(service.getSnapshot().draftTokens).toEqual({});
    expect(service.getSnapshot().infoMessage).toBe("Draft applied");
    expect(diagnostics.some((record) => record.code === "EXT_THEME_STUDIO_APPLIED")).toBe(true);
    expect(notifications).toContain("Theme draft applied.");
  });

  it("captures refresh failures in snapshot state and diagnostics", async () => {
    const diagnostics: Array<{ severity: string; code: string; detail?: string }> = [];
    const service = createThemeStudioService({
      context: {
        extensionId: "core.theme-studio",
        config: {
          async get() { return null; },
          async set() {},
          async remove() {},
          watch() {
            return { dispose() {} };
          },
        },
        host: {
          theme: {
            getTokens: vi.fn(async () => { throw new Error("refresh failed"); }),
            getClassNames: vi.fn(async () => []),
            getThemeBridge: vi.fn(async () => []),
            getTokenMap: vi.fn(async () => ({})),
            exportTheme: vi.fn(async () => ({
              metadata: { id: "test-theme", name: "Test Theme", author: "Test Author", description: "Theme description" },
              compatibility: { contract: "1.0.0" },
              tokens: {},
            })),
          },
          diagnostics: {
            publish: vi.fn(async (_extensionId: string, record: { severity: string; code: string; detail?: string }) => {
              diagnostics.push(record);
            }),
          },
          notifications: {
            info: vi.fn(async () => {}),
          },
        },
      } as any,
      formatLabel,
    });

    await expect(service.refresh()).rejects.toThrow("refresh failed");
    expect(service.getSnapshot().lastError).toBe("refresh failed");
    await waitFor(() => {
      expect(diagnostics.some((record) => record.code === "EXT_THEME_STUDIO_REFRESH_FAILED")).toBe(true);
    });
  });
});
