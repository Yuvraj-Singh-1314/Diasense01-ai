import fs from "node:fs";
import path from "node:path";

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type InvokeLLMOptions = {
  messages: ChatMessage[];
  max_tokens?: number;
};

type LLMResponse = {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
};

/*
 * Always load .env from the project root.
 * This avoids relying on the terminal's current working directory.
 */
const projectRoot = process.cwd();
const envPath = path.join(projectRoot, ".env");

if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, "utf8");

  for (const line of envText.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) continue;

    const equalIndex = trimmed.indexOf("=");

    if (equalIndex === -1) continue;

    const key = trimmed.slice(0, equalIndex).trim();
    let value = trimmed.slice(equalIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

const XAI_URL = "https://api.x.ai/v1/chat/completions";

function getXaiKey() {
  const key = process.env.XAI_API_KEY?.trim();

  if (!key) {
    throw new Error(
      "XAI_API_KEY is missing from the project root .env file."
    );
  }

  return key;
}

function getModel() {
  return process.env.XAI_MODEL?.trim() || "grok-4.6";
}

export async function invokeLLM(
  options: InvokeLLMOptions
): Promise<LLMResponse> {
  const apiKey = getXaiKey();
  const model = getModel();

  console.log(
    `[Grok] Request starting | model=${model} | keyLoaded=${Boolean(apiKey)}`
  );

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 120000);

  try {
    const response = await fetch(XAI_URL, {
      method: "POST",

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },

      body: JSON.stringify({
        model,
        messages: options.messages,
        max_tokens: options.max_tokens ?? 450,
        stream: false,
      }),

      signal: controller.signal,
    });

    const text = await response.text();

    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `xAI returned invalid JSON. HTTP ${response.status}.`
      );
    }

    if (!response.ok) {
      console.error(
        `[Grok] HTTP ${response.status}`,
        JSON.stringify(data)
      );

      if (response.status === 400 || response.status === 401) {
        throw new Error(
          "Grok authentication failed. The XAI_API_KEY in .env is not accepted by xAI."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "Grok API access denied. Check the API key permissions/team in xAI Console."
        );
      }

      if (response.status === 404) {
        throw new Error(
          `Grok model or endpoint not found: ${model}`
        );
      }

      throw new Error(
        data?.error?.message ||
          data?.error ||
          `xAI request failed with HTTP ${response.status}`
      );
    }

    const content =
      data?.choices?.[0]?.message?.content;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      throw new Error(
        "Grok returned no text response."
      );
    }

    console.log("[Grok] AI response received");

    return {
      choices: [
        {
          message: {
            content: content.trim(),
          },
        },
      ],
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "Grok request timed out after 120 seconds."
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `[Grok] Request failed: ${message}`
    );

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}