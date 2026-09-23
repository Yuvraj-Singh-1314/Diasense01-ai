import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

describe("Home project credit", () => {
  it("shows the requested project-credit branding without changing account-name handling", () => {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), "Home.tsx"), "utf8");
    expect(source).toContain("Project Developed by Vishnu Singh");
  });
});
