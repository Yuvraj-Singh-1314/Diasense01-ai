import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("Settings page", () => {
  it("exposes account, privacy, appearance, and confirmed logout controls", () => {
    const source = readFileSync(resolve(process.cwd(), "client/src/pages/Settings.tsx"), "utf8");
    expect(source).toContain("Account details");
    expect(source).toContain("Appearance");
    expect(source).toContain("Privacy and data");
    expect(source).toContain("Sign out safely");
    expect(source).toContain("confirmingSignOut");
  });
});
