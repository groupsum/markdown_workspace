import React from "react";
import type { ExtensionIcon } from "@markdown-workspace/extension-manifest";
import * as LucideIcons from "lucide-react";
import { AppWindow, FileQuestion } from "lucide-react";

export interface ExtensionManifestIconProps {
  readonly icon: ExtensionIcon;
  readonly size?: number;
}

export const ExtensionManifestIcon: React.FC<ExtensionManifestIconProps> = ({ icon, size = 18 }) => {
  if (icon.kind === "lucide") {
    const iconCatalog = LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number }>>;
    const Component = iconCatalog[icon.name] ?? FileQuestion;
    return <Component size={size} aria-hidden="true" />;
  }

  if (icon.kind === "svg") {
    return (
      <span
        aria-hidden="true"
        style={{ display: "inline-flex", width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  }

  return <AppWindow size={size} aria-hidden="true" />;
};
