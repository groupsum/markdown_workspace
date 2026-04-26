// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import "@mdwrk/testing/vitest-setup";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  LanguagePackStudioSettingsPanel,
} from "../src/components/LanguagePackStudioSettingsPanel.js";
import {
  LanguagePackStudioView,
} from "../src/components/LanguagePackStudioView.js";
import type {
  LanguagePackStudioArtifact,
  LanguagePackStudioController,
  LanguagePackStudioSnapshot,
} from "../src/types.js";

const formatLabel = (label: I18nLabel | string): string => typeof label === "string" ? label : label.defaultMessage;

function createControllerHarness() {
  let snapshot: LanguagePackStudioSnapshot = {
    activeLocale: "custom",
    packs: [
      {
        kind: "mdwrk-language-pack",
        version: 1,
        locale: "custom",
        label: "Custom Pack",
        enabled: true,
        messages: { "core.views.settings.title": "Settings" },
        source: "installed",
      },
      {
        kind: "mdwrk-language-pack",
        version: 1,
        locale: "en",
        label: "English",
        enabled: true,
        messages: { "core.views.settings.title": "Settings" },
        source: "built-in",
      },
    ],
    tokens: [
      {
        key: "core.views.settings.title",
        defaultMessage: "Settings",
        source: "core-shell",
      },
    ],
    loadingTokens: false,
  };
  const listeners = new Set<() => void>();
  const emit = () => {
    for (const listener of Array.from(listeners)) listener();
  };

  const importArtifact = vi.fn(async (payload: string) => {
    const parsed = JSON.parse(payload) as LanguagePackStudioArtifact;
    snapshot = {
      ...snapshot,
      packs: [...snapshot.packs.filter((pack) => pack.locale !== parsed.locale), parsed],
    };
    emit();
    return parsed;
  });
  const createArtifact = vi.fn(async ({ locale, label, messages, enabled = true }: { locale: string; label: string; messages: Record<string, string>; enabled?: boolean }) => {
    const pack: LanguagePackStudioArtifact = {
      kind: "mdwrk-language-pack",
      version: 1,
      locale,
      label,
      enabled,
      messages,
      source: "installed",
    };
    snapshot = { ...snapshot, packs: [...snapshot.packs, pack] };
    emit();
    return pack;
  });
  const updateArtifact = vi.fn(async (locale: string, input: { label?: string; messages: Record<string, string>; enabled?: boolean }) => {
    const current = snapshot.packs.find((pack) => pack.locale === locale)!;
    const updated = {
      ...current,
      label: input.label ?? current.label,
      messages: input.messages,
      enabled: input.enabled ?? current.enabled,
    };
    snapshot = {
      ...snapshot,
      packs: snapshot.packs.map((pack) => pack.locale === locale ? updated : pack),
    };
    emit();
    return updated;
  });
  const activate = vi.fn(async (locale: string) => {
    snapshot = { ...snapshot, activeLocale: locale };
    emit();
  });
  const remove = vi.fn(async (locale: string) => {
    snapshot = {
      ...snapshot,
      packs: snapshot.packs.filter((pack) => pack.locale !== locale),
      activeLocale: snapshot.activeLocale === locale ? "en" : snapshot.activeLocale,
    };
    emit();
  });
  const setEnabled = vi.fn(async (locale: string, enabled: boolean) => {
    snapshot = {
      ...snapshot,
      packs: snapshot.packs.map((pack) => pack.locale === locale ? { ...pack, enabled } : pack),
    };
    emit();
  });
  const setAllEnabled = vi.fn(async (enabled: boolean) => {
    snapshot = {
      ...snapshot,
      packs: snapshot.packs.map((pack) => ({ ...pack, enabled })),
    };
    emit();
  });
  const exportArtifact = vi.fn((locale: string) => snapshot.packs.find((pack) => pack.locale === locale) ?? null);

  const controller: LanguagePackStudioController = {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    importArtifact,
    createArtifact,
    updateArtifact,
    activate,
    remove,
    setEnabled,
    setAllEnabled,
    exportArtifact,
  };

  return {
    controller,
    getSnapshot: () => snapshot,
  };
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Language Pack Studio settings and view surfaces", () => {
  it("renders the settings panel summary and opens the studio", () => {
    const harness = createControllerHarness();
    const open = vi.fn(async () => {});

    render(
      <LanguagePackStudioSettingsPanel
        controller={harness.controller}
        open={open}
        formatLabel={formatLabel}
      />,
    );

    expect(screen.getByText("custom")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Open studio" }));
    expect(open).toHaveBeenCalledTimes(1);
  });

  it("supports import, export, enable toggles, and removal from the workspace view", async () => {
    const harness = createControllerHarness();
    const originalCreateObjectURL = URL.createObjectURL;
    const originalRevokeObjectURL = URL.revokeObjectURL;
    const originalAnchorClick = HTMLAnchorElement.prototype.click;
    const createObjectUrl = vi.fn(() => "blob:test");
    const revokeObjectUrl = vi.fn();
    const anchorClick = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      writable: true,
      value: createObjectUrl,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      writable: true,
      value: revokeObjectUrl,
    });
    Object.defineProperty(HTMLAnchorElement.prototype, "click", {
      configurable: true,
      writable: true,
      value: anchorClick,
    });

    try {
      render(
        <LanguagePackStudioView
          controller={harness.controller}
          close={vi.fn(async () => {})}
          formatLabel={formatLabel}
        />,
      );

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "EXPORT" })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "EXPORT" }));
      expect(harness.controller.exportArtifact).toHaveBeenCalledWith("custom");
      expect(createObjectUrl).toHaveBeenCalled();

      fireEvent.click(screen.getByRole("button", { name: "DISABLE" }));
      expect(harness.controller.setEnabled).toHaveBeenCalledWith("custom", false);

      fireEvent.click(screen.getByRole("button", { name: "REMOVE" }));
      await waitFor(() => {
        expect(harness.controller.remove).toHaveBeenCalledWith("custom");
      });

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const imported = {
        text: async () => JSON.stringify({
          kind: "mdwrk-language-pack",
          version: 1,
          locale: "es",
          label: "Spanish",
          enabled: true,
          messages: { "core.views.settings.title": "Configuracion" },
          source: "installed",
        }),
      };
      fireEvent.change(fileInput, { target: { files: [imported] } });

      await waitFor(() => {
        expect(harness.controller.importArtifact).toHaveBeenCalledTimes(1);
      });

      expect(revokeObjectUrl).toHaveBeenCalled();
    } finally {
      if (originalCreateObjectURL) {
        Object.defineProperty(URL, "createObjectURL", {
          configurable: true,
          writable: true,
          value: originalCreateObjectURL,
        });
      } else {
        delete (URL as { createObjectURL?: typeof createObjectUrl }).createObjectURL;
      }

      if (originalRevokeObjectURL) {
        Object.defineProperty(URL, "revokeObjectURL", {
          configurable: true,
          writable: true,
          value: originalRevokeObjectURL,
        });
      } else {
        delete (URL as { revokeObjectURL?: typeof revokeObjectUrl }).revokeObjectURL;
      }

      Object.defineProperty(HTMLAnchorElement.prototype, "click", {
        configurable: true,
        writable: true,
        value: originalAnchorClick,
      });
    }
  });
});
