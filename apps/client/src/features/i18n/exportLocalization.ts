import { CORE_LOCALE_STORAGE_KEY } from "./clientI18nService";
import { readStoredLanguagePacksSync } from "./languagePackStore";

const BUILTIN_EXPORT_MESSAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = Object.freeze({
  en: Object.freeze({
    "core.preview.policy.title": "Preview Policy",
    "core.preview.policy.htmlHandling": "HTML handling",
    "core.preview.policy.allowTrusted": "Trusted raw HTML passthrough is enabled for this preview.",
    "core.preview.policy.sanitize": "Raw HTML is sanitized for this preview unless trusted HTML mode is enabled.",
    "core.export.policy.title": "Export Policy",
    "core.export.policy.allowTrusted": "Raw HTML passthrough is enabled for this export.",
    "core.export.policy.sanitize": "Raw HTML is sanitized for this export unless trusted HTML mode is explicitly enabled.",
  }),
  es: Object.freeze({
    "core.preview.policy.title": "Politica de previsualizacion",
    "core.preview.policy.htmlHandling": "Manejo de HTML",
    "core.preview.policy.allowTrusted": "El paso directo de HTML sin procesar y confiable esta habilitado para esta vista previa.",
    "core.preview.policy.sanitize": "El HTML sin procesar se sanea para esta vista previa a menos que se habilite el modo HTML confiable.",
    "core.export.policy.title": "Politica de exportacion",
    "core.export.policy.allowTrusted": "El paso directo de HTML sin procesar esta habilitado para esta exportacion.",
    "core.export.policy.sanitize": "El HTML sin procesar se sanea para esta exportacion a menos que el modo HTML confiable se habilite explicitamente.",
  }),
});

export function readActiveLocaleSync(): string {
  if (typeof window === "undefined") {
    return "en";
  }
  return window.localStorage.getItem(CORE_LOCALE_STORAGE_KEY) ?? "en";
}

export function resolveExportMessage(key: string, defaultMessage: string, locale = readActiveLocaleSync()): string {
  const normalizedLocale = locale.trim().toLowerCase() || "en";
  const installedPack = readStoredLanguagePacksSync().find((entry) => entry.locale === normalizedLocale);
  if (installedPack?.messages[key]) {
    return installedPack.messages[key];
  }
  const builtin = BUILTIN_EXPORT_MESSAGES[normalizedLocale]?.[key];
  if (builtin) {
    return builtin;
  }
  return BUILTIN_EXPORT_MESSAGES.en[key] ?? defaultMessage;
}
