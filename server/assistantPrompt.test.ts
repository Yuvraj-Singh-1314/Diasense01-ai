import { describe, expect, it } from "vitest";
import { assistantResponseStyle, buildAssistantMessages, normalizeAssistantAnswer, usesHinglish } from "./assistantPrompt";

describe("assistant language-aware prompt construction", () => {
  it("selects a natural Hinglish style for a Hinglish health question", () => {
    const message = "Mujhe high sugar risk ke liye kya karna chahiye?";
    expect(usesHinglish(message)).toBe(true);
    expect(assistantResponseStyle(message)).toContain("Reply in clear, natural Hinglish");
  });

  it("selects English for an English health question", () => {
    const message = "What should I discuss with my clinician about my risk?";
    expect(usesHinglish(message)).toBe(false);
    expect(assistantResponseStyle(message)).toContain("Reply in clear English");
  });

  it("passes the selected language style as a system LLM message", () => {
    const messages = buildAssistantMessages({ context: "Latest assessment: risk 52%.", message: "Mera risk high hai, kya karu?" });
    expect(messages).toContainEqual(expect.objectContaining({ role: "system", content: expect.stringContaining("Reply in clear, natural Hinglish") }));
    expect(messages.at(-1)).toEqual({ role: "user", content: "Mera risk high hai, kya karu?" });
  });

  it("normalizes common markdown bullet syntax before returning an assistant reply", () => {
    expect(normalizeAssistantAnswer("Aap in points par baat karein: * **Blood Sugar Testing:** HbA1c ke baare mein poochhein. * **Lifestyle:** diet aur activity discuss karein.")).toBe("Aap in points par baat karein:\n- Blood Sugar Testing: HbA1c ke baare mein poochhein.\n- Lifestyle: diet aur activity discuss karein.");
  });
});
