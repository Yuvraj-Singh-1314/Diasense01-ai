import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

describe("Global slash-free copy safeguard", () => {
  it("removes leading and separator slashes from rendered text nodes", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "App.tsx"), "utf8");
    expect(source).toContain("function SlashFreeCopy()");
    expect(source).toContain("replace(/^(\\s*)\\/\\s+/");
    expect(source).toContain("replace(/\\s+\\/\\s+/g");
  });
});
