import type { PageTemplateSourceLink, PageTemplateSourcePage } from "../types.js";

export interface ParsedTemplateMarkdown {
  frontmatter: Record<string, unknown>;
  body: string;
}

function parseScalar(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return trimmed
      .slice(1, -1)
      .split(",")
      .map((item) => parseScalar(item))
      .filter((item) => item !== "");
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

function setNestedValue(target: Record<string, unknown>, key: string, value: unknown): void {
  const parts = key.split(".");
  let cursor = target;
  for (const part of parts.slice(0, -1)) {
    const current = cursor[part];
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      cursor[part] = {};
    }
    cursor = cursor[part] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1] ?? key] = value;
}

export function splitTemplateMarkdown(raw: string): ParsedTemplateMarkdown {
  const normalized = String(raw ?? "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) return { frontmatter: {}, body: normalized.trim() };
  return {
    frontmatter: parseTemplateFrontmatter(match[1] ?? ""),
    body: normalized.slice(match[0].length).trim(),
  };
}

export function parseTemplateFrontmatter(frontmatter: string): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  const lines = frontmatter.replace(/\t/g, "  ").split("\n");
  let parentKey: string | undefined;
  let listKey: string | undefined;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const listMatch = /^\s*-\s*(.+)$/.exec(line);
    if (listMatch && listKey) {
      const current = output[listKey];
      const values = Array.isArray(current) ? current : [];
      values.push(parseScalar(listMatch[1] ?? ""));
      output[listKey] = values;
      continue;
    }

    const childMatch = /^\s{2,}([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (childMatch && parentKey) {
      const parent = output[parentKey];
      const parentObject = parent && typeof parent === "object" && !Array.isArray(parent) ? parent as Record<string, unknown> : {};
      const childKey = childMatch[1] ?? "";
      const childValue = childMatch[2] ?? "";
      parentObject[childKey] = childValue === "" ? [] : parseScalar(childValue);
      output[parentKey] = parentObject;
      listKey = `${parentKey}.${childKey}`;
      continue;
    }

    const match = /^([A-Za-z0-9_.-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const key = match[1] ?? "";
    const value = match[2] ?? "";
    if (value === "") {
      output[key] = {};
      parentKey = key;
      listKey = key;
      continue;
    }
    setNestedValue(output, key, parseScalar(value));
    parentKey = key;
    listKey = undefined;
  }

  return output;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeLinks(value: unknown, sourceId: string, sourcePath?: string): PageTemplateSourceLink[] {
  const links = asRecord(value);
  const output: PageTemplateSourceLink[] = [];
  for (const [slotId, rawTargets] of Object.entries(links)) {
    const targets = Array.isArray(rawTargets) ? rawTargets : [rawTargets];
    targets.forEach((target, index) => {
      if (typeof target === "string") {
        output.push({ sourceId, targetId: target, slotId, order: index + 1, sourcePath });
        return;
      }
      const targetRecord = asRecord(target);
      const targetId = asString(targetRecord.page, asString(targetRecord.targetId));
      if (!targetId) return;
      output.push({
        sourceId,
        targetId,
        slotId,
        relationship: asString(targetRecord.relationship) || undefined,
        role: asString(targetRecord.role) || undefined,
        label: asString(targetRecord.label) || undefined,
        order: typeof targetRecord.order === "number" ? targetRecord.order : index + 1,
        sourcePath,
      } as PageTemplateSourceLink);
    });
  }
  return output;
}

export function markdownFileToSourcePage(raw: string, sourcePath?: string): { page: PageTemplateSourcePage; links: PageTemplateSourceLink[]; frontmatter: Record<string, unknown> } {
  const parsed = splitTemplateMarkdown(raw);
  const frontmatter = parsed.frontmatter;
  const title = asString(frontmatter.title, "Untitled Page");
  const id = asString(frontmatter.id, title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  const summary = asString(frontmatter.summary, asString(frontmatter.intro, parsed.body.split(/\n\s*\n/)[0] ?? title));
  const data = {
    ...asRecord(frontmatter.data),
    body: parsed.body,
    summary,
    intro: asString(frontmatter.intro, summary),
  };
  const page: PageTemplateSourcePage = {
    id,
    templateId: asString(frontmatter.templateId, asString(frontmatter.template)),
    slug: asString(frontmatter.slug, `/${id}/`),
    title,
    description: asString(frontmatter.description, summary),
    label: asString(frontmatter.label) || undefined,
    href: asString(frontmatter.href) || undefined,
    order: typeof frontmatter.order === "number" ? frontmatter.order : undefined,
    data,
    body: parsed.body,
    sourcePath,
  };
  return { page, links: normalizeLinks(frontmatter.links, id, sourcePath), frontmatter };
}
