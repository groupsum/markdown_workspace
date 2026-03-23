import { describe, expect, it } from "vitest";
import { renderMarkdownToHtml } from "@markdown-workspace/markdown-renderer-core";
import { applyBuiltinMarkdownCommand } from "../src/index.js";

describe("renderer/editor roundtrip", () => {
  it("produces strong markup after applying bold", async () => {
    const result = applyBuiltinMarkdownCommand("bold", "roundtrip", { start: 0, end: 9 });
    const html = await renderMarkdownToHtml(result.value);
    expect(html).toContain("<strong");
    expect(html).toContain("roundtrip");
  });
});
