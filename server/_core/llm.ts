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


/* =========================================================
   LOAD .ENV
   ========================================================= */

const projectRoot = process.cwd();

const envPath = path.join(
  projectRoot,
  ".env"
);

if (fs.existsSync(envPath)) {
  const envText =
    fs.readFileSync(
      envPath,
      "utf8"
    );

  for (
    const line of envText.split(/\r?\n/)
  ) {
    const trimmed =
      line.trim();

    if (
      !trimmed ||
      trimmed.startsWith("#")
    ) {
      continue;
    }

    const equalIndex =
      trimmed.indexOf("=");

    if (equalIndex === -1) {
      continue;
    }

    const key =
      trimmed
        .slice(0, equalIndex)
        .trim();

    let value =
      trimmed
        .slice(equalIndex + 1)
        .trim();

    if (
      (value.startsWith('"') &&
        value.endsWith('"')) ||
      (value.startsWith("'") &&
        value.endsWith("'"))
    ) {
      value =
        value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] =
        value;
    }
  }
}


/* =========================================================
   HELPERS
   ========================================================= */

function cleanKey(
  value: string | undefined
): string {
  return (value || "")
    .trim()
    .replace(/^["']|["']$/g, "");
}


/* =========================================================
   HUGGING FACE CONFIG
   ========================================================= */

function getHFKey(): string {
  return cleanKey(
    process.env.HF_API_KEY ||
      process.env.HF_TOKEN
  );
}

function getHFModel(): string {
  return (
    process.env.HF_MODEL?.trim() ||
    "openai/gpt-oss-120b:fastest"
  );
}

function getHFBaseURL(): string {
  return (
    process.env.HF_BASE_URL?.trim() ||
    "https://router.huggingface.co/v1"
  );
}


/* =========================================================
   GROQ CONFIG
   ========================================================= */

function getGroqKey(): string {
  return cleanKey(
    process.env.GROQ_API_KEY
  );
}

function getGroqModel(): string {
  return (
    process.env.GROQ_MODEL?.trim() ||
    "openai/gpt-oss-120b"
  );
}


/* =========================================================
   GEMINI CONFIG
   ========================================================= */

function getGeminiKey(): string {
  return cleanKey(
    process.env.GEMINI_API_KEY
  );
}

function getGeminiModel(): string {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.6-flash"
  );
}


/* =========================================================
   HUGGING FACE
   ========================================================= */

async function callHuggingFace(
  options: InvokeLLMOptions
): Promise<LLMResponse> {

  const apiKey =
    getHFKey();

  if (!apiKey) {
    throw new Error(
      "HF_API_KEY is missing from .env"
    );
  }

  const model =
    getHFModel();

  const baseURL =
    getHFBaseURL();

  console.log(
    `[HuggingFace] Request starting | model=${model}`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 60000);

  try {

    const response =
      await fetch(
        `${baseURL.replace(
          /\/$/,
          ""
        )}/chat/completions`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`,
          },

          body:
            JSON.stringify({
              model,

              messages:
                options.messages,

              max_tokens:
                options.max_tokens ??
                700,

              stream: false,
            }),

          signal:
            controller.signal,
        }
      );

    const text =
      await response.text();

    let data: any = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        `Hugging Face returned invalid JSON. HTTP ${response.status}`
      );
    }

    if (!response.ok) {

      console.error(
        `[HuggingFace] HTTP ${response.status}`,
        JSON.stringify(data)
      );

      throw new Error(
        data?.error?.message ||
          data?.error ||
          `Hugging Face HTTP ${response.status}`
      );
    }

    const content =
      data?.choices?.[0]
        ?.message?.content;

    if (
      typeof content !==
        "string" ||
      !content.trim()
    ) {
      throw new Error(
        "Hugging Face returned an empty response."
      );
    }

    console.log(
      "[HuggingFace] AI response received successfully."
    );

    return {
      choices: [
        {
          message: {
            content:
              content.trim(),
          },
        },
      ],
    };

  } catch (error) {

    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Hugging Face request timed out after 60 seconds."
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `[HuggingFace] Request failed: ${message}`
    );

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}


/* =========================================================
   GROQ
   ========================================================= */

async function callGroq(
  options: InvokeLLMOptions
): Promise<LLMResponse> {

  const apiKey =
    getGroqKey();

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing from .env"
    );
  }

  const model =
    getGroqModel();

  console.log(
    `[Groq] Request starting | model=${model}`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 60000);

  try {

    const baseURL =
      (
        process.env.GROQ_API_URL ||
        "https://api.groq.com/openai/v1"
      ).replace(
        /\/$/,
        ""
      );

    const response =
      await fetch(
        `${baseURL}/chat/completions`,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${apiKey}`,
          },

          body:
            JSON.stringify({
              model,

              messages:
                options.messages,

              max_completion_tokens:
                options.max_tokens ??
                700,

              stream: false,
            }),

          signal:
            controller.signal,
        }
      );

    const text =
      await response.text();

    let data: any = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        `Groq returned invalid JSON. HTTP ${response.status}`
      );
    }

    if (!response.ok) {

      console.error(
        `[Groq] HTTP ${response.status}`,
        JSON.stringify(data)
      );

      throw new Error(
        data?.error?.message ||
          data?.error ||
          `Groq HTTP ${response.status}`
      );
    }

    const content =
      data?.choices?.[0]
        ?.message?.content;

    if (
      typeof content !==
        "string" ||
      !content.trim()
    ) {
      throw new Error(
        "Groq returned an empty response."
      );
    }

    console.log(
      "[Groq] AI response received successfully."
    );

    return {
      choices: [
        {
          message: {
            content:
              content.trim(),
          },
        },
      ],
    };

  } catch (error) {

    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Groq request timed out after 60 seconds."
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `[Groq] Request failed: ${message}`
    );

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}


/* =========================================================
   GEMINI
   ========================================================= */

async function callGemini(
  options: InvokeLLMOptions
): Promise<LLMResponse> {

  const apiKey =
    getGeminiKey();

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from .env"
    );
  }

  const model =
    getGeminiModel();

  console.log(
    `[Gemini] Request starting | model=${model}`
  );

  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
      controller.abort();
    }, 60000);

  try {

    const systemMessages =
      options.messages.filter(
        (message) =>
          message.role ===
          "system"
      );

    const normalMessages =
      options.messages.filter(
        (message) =>
          message.role !==
          "system"
      );

    const systemInstruction =
      systemMessages
        .map(
          (message) =>
            message.content
        )
        .join("\n\n");

    const contents =
      normalMessages.map(
        (message) => ({
          role:
            message.role ===
            "assistant"
              ? "model"
              : "user",

          parts: [
            {
              text:
                message.content,
            },
          ],
        })
      );

    const url =
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
        model
      )}:generateContent?key=${encodeURIComponent(
        apiKey
      )}`;

    const body: any = {
      contents,

      generationConfig: {
        maxOutputTokens:
          options.max_tokens ??
          700,
      },
    };

    if (
      systemInstruction.trim()
    ) {
      body.systemInstruction = {
        parts: [
          {
            text:
              systemInstruction,
          },
        ],
      };
    }

    const response =
      await fetch(
        url,
        {
          method: "POST",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",
          },

          body:
            JSON.stringify(body),

          signal:
            controller.signal,
        }
      );

    const text =
      await response.text();

    let data: any = {};

    try {
      data = text
        ? JSON.parse(text)
        : {};
    } catch {
      throw new Error(
        `Gemini returned invalid JSON. HTTP ${response.status}`
      );
    }

    if (!response.ok) {

      console.error(
        `[Gemini] HTTP ${response.status}`,
        JSON.stringify(data)
      );

      throw new Error(
        data?.error?.message ||
          data?.error ||
          `Gemini HTTP ${response.status}`
      );
    }

    const content =
      data?.candidates?.[0]
        ?.content?.parts
        ?.map(
          (part: any) =>
            part?.text
        )
        .filter(
          (text: any) =>
            typeof text ===
            "string"
        )
        .join("") || "";

    if (!content.trim()) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    console.log(
      "[Gemini] AI response received successfully."
    );

    return {
      choices: [
        {
          message: {
            content:
              content.trim(),
          },
        },
      ],
    };

  } catch (error) {

    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new Error(
        "Gemini request timed out after 60 seconds."
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : String(error);

    console.error(
      `[Gemini] Request failed: ${message}`
    );

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}


/* =========================================================
   MAIN LLM
   HUGGING FACE → GROQ → GEMINI
   ========================================================= */

export async function invokeLLM(
  options: InvokeLLMOptions
): Promise<LLMResponse> {

  const hfKey =
    getHFKey();

  const groqKey =
    getGroqKey();

  const geminiKey =
    getGeminiKey();


  if (
    !hfKey &&
    !groqKey &&
    !geminiKey
  ) {
    throw new Error(
      "No AI API key configured. Add HF_API_KEY, GROQ_API_KEY, or GEMINI_API_KEY to .env."
    );
  }


  const availableProviders =
    [
      hfKey
        ? "HuggingFace"
        : null,

      groqKey
        ? "Groq"
        : null,

      geminiKey
        ? "Gemini"
        : null,
    ]
      .filter(Boolean)
      .join(" -> ");


  console.log(
    `[LLM] Available providers: ${availableProviders}`
  );


  /* =======================================================
     1. HUGGING FACE
     ======================================================= */

  if (hfKey) {

    try {

      const result =
        await callHuggingFace(
          options
        );

      console.log(
        "[LLM] Hugging Face selected successfully."
      );

      return result;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `[LLM] Hugging Face failed: ${message}`
      );

      if (
        groqKey ||
        geminiKey
      ) {
        console.log(
          "[LLM] Falling back to next AI provider..."
        );
      }
    }
  }


  /* =======================================================
     2. GROQ
     ======================================================= */

  if (groqKey) {

    try {

      const result =
        await callGroq(
          options
        );

      console.log(
        "[LLM] Groq selected successfully."
      );

      return result;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `[LLM] Groq failed: ${message}`
      );

      if (geminiKey) {
        console.log(
          "[LLM] Falling back to Gemini..."
        );
      }
    }
  }


  /* =======================================================
     3. GEMINI
     ======================================================= */

  if (geminiKey) {

    try {

      const result =
        await callGemini(
          options
        );

      console.log(
        "[LLM] Gemini selected successfully."
      );

      return result;

    } catch (error) {

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      console.error(
        `[LLM] Gemini failed: ${message}`
      );

      throw new Error(
        `All configured AI providers failed.\n` +
        `Last error: ${message}`
      );
    }
  }


  throw new Error(
    "All configured AI providers failed."
  );
}