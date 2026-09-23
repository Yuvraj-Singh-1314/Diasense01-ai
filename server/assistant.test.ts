import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("assistant procedure safety", () => {
  it("uses authenticated assessment context and non-diagnostic guardrails", () => {
    const source = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
    const promptSource = readFileSync(resolve(process.cwd(), "server/assistantPrompt.ts"), "utf8");
    expect(source).toContain("assistant: router");
    expect(source).toContain("getLatestAssessmentBundle(ctx.user.id)");
    expect(promptSource).toContain("must never diagnose, prescribe");
    expect(promptSource).toContain("contact local emergency services immediately");
    expect(source).toContain("const highRisk");
    expect(source).toContain("buildAssistantMessages({context,message:input.message})");
  });
});
