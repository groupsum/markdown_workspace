export * from "./version.js";
import type { MarkdownWorkspaceExtension } from "@mdwrk/extension-host";
import { extensionCatalogHelloManifest } from "./manifest.js";

export const extensionCatalogHello: MarkdownWorkspaceExtension = {
  manifest: extensionCatalogHelloManifest,
  async activate(context) {
    const greeting = await context.config.get<string>("greeting") ?? "Hello from the external catalog!";

    context.registerView({
      id: "external.catalog-hello.view",
      title: { defaultMessage: "Catalog Hello" },
      description: { defaultMessage: "Sample external extension panel." },
      location: "panel",
      allowMultiple: false,
      render: () => `External extension active: ${greeting}`,
    });

    context.registerActionRailItem({
      id: "external.catalog-hello.rail",
      title: { defaultMessage: "Catalog Hello" },
      icon: { kind: "lucide", name: "Puzzle" },
      target: { kind: "view", viewId: "external.catalog-hello.view" },
      group: "extensions",
      order: 160,
    });

    await context.host.notifications.info(`Installed external extension '${context.manifest.displayName.defaultMessage}'.`);
  },
};

export default extensionCatalogHello;
