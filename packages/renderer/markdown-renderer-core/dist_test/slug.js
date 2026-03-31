export function slugifyHeading(text) {
    return text
        .trim()
        .toLowerCase()
        .replace(/[`*_~]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "section";
}
//# sourceMappingURL=slug.js.map