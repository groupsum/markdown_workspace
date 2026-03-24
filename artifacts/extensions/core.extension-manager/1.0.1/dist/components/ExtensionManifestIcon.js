import { jsx as _jsx } from "react/jsx-runtime";
import * as LucideIcons from "lucide-react";
import { AppWindow, FileQuestion } from "lucide-react";
export const ExtensionManifestIcon = ({ icon, size = 18 }) => {
    if (icon.kind === "lucide") {
        const iconCatalog = LucideIcons;
        const Component = iconCatalog[icon.name] ?? FileQuestion;
        return _jsx(Component, { size: size, "aria-hidden": "true" });
    }
    if (icon.kind === "svg") {
        return (_jsx("span", { "aria-hidden": "true", style: { display: "inline-flex", width: size, height: size }, dangerouslySetInnerHTML: { __html: icon.svg } }));
    }
    return _jsx(AppWindow, { size: size, "aria-hidden": "true" });
};
//# sourceMappingURL=ExtensionManifestIcon.js.map