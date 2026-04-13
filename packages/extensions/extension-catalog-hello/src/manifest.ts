import type { ExtensionManifest } from "@mdwrk/extension-manifest";

export const extensionCatalogHelloManifest: ExtensionManifest = {
  manifestVersion: 1,
  id: "external.catalog-hello",
  packageName: "@mdwrk/extension-catalog-hello",
  version: "1.1.2",
  displayName: {
    defaultMessage: "Catalog Hello",
    key: "manifest.displayName",
    description: "Display name for the sample external catalog extension.",
  },
  description: {
    defaultMessage: "Sample third-party extension installed from a signed external catalog artifact.",
    key: "manifest.description",
    description: "Description for the sample external catalog extension.",
  },
  kind: "external",
  publisher: "demo-catalog",
  license: "Apache-2.0",
  categories: ["sample", "external"],
  keywords: ["hello", "catalog", "sample"],
  icon: { kind: "svg", svg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path d="M4 6h16v12H4z"/><path d="M9 10h6"/><path d="M9 14h6"/></svg>' },
  enabledByDefault: true,
  capabilities: ["view.register", "actionRail.register", "notification.publish", "settings.read"],
  compatibility: {
    manifestVersion: 1,
    hostApi: "^1.0.0",
    runtime: "^1.0.0",
    app: ">=0.1.0",
    themeContract: "^1.0.0"
  },
  entry: {
    module: "./index.js",
    export: "extensionCatalogHello",
  },
  contributions: {
    commands: [],
    views: [
      {
        id: "external.catalog-hello.view",
        title: { defaultMessage: "Catalog Hello" },
        description: { defaultMessage: "Sample external extension panel." },
        location: "panel",
        allowMultiple: false,
      },
    ],
    components: [],
    actionRail: [
      {
        id: "external.catalog-hello.rail",
        title: { defaultMessage: "Catalog Hello" },
        icon: { kind: "lucide", name: "Puzzle" },
        order: 160,
        group: "extensions",
        target: { kind: "view", viewId: "external.catalog-hello.view" },
      },
    ],
    settingsSections: [],
  },
  i18n: {
    defaultLocale: "en",
    supportedLocales: ["en"],
  },
  settingsSchema: {
    version: 1,
    title: { defaultMessage: "Catalog Hello Settings" },
    sections: [
      {
        id: "general",
        title: { defaultMessage: "General" },
        description: { defaultMessage: "General settings for the sample external extension." },
      },
    ],
    fields: [
      {
        key: "greeting",
        kind: "string",
        label: { defaultMessage: "Greeting" },
        description: { defaultMessage: "Optional override for the greeting shown by the sample external extension." },
        sectionId: "general",
        defaultValue: "Hello from the external catalog!"
      }
    ]
  },
  distribution: {
    channel: "catalog",
    format: "esm"
  },
  support: {
    status: "experimental",
    level: "community",
    owner: "demo-catalog"
  }
};

export default extensionCatalogHelloManifest;
