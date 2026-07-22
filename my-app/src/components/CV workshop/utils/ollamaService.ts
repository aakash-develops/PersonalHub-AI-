
// export interface OllamaOptions {
//   prompt: string;
//   system?: string;
//   temperature?: number;
//   num_ctx?: number;
//   timeoutMs?: number; // Added: Prevents infinite hanging
//   enableThinking?: boolean; // Added: Controls Qwen 3.5 reasoning mode
// }

// interface OllamaApiResponse {
//   model: string;
//   created_at: string;
//   response: string;
//   thinking?: string;
//   done: boolean;
//   error?: string;
// }

// const DEFAULT_OLLAMA_URL =  "http://127.0.0.1:11434";
// const DEFAULT_MODEL =  "qwen3.5:4b";

// export async function generateOllamaResponse(
//   options: OllamaOptions
// ): Promise<string> {
//   const {
//     prompt,
//     system,
//     temperature = 0.1,
//     num_ctx = 4096,
//     timeoutMs = 60000, // 60s default timeout
//     enableThinking = false, // Disabled by default for direct JSON speed
//   } = options;

//   console.log(`[Ollama] Dispatching request to model: ${DEFAULT_MODEL}`);

//   const controller = new AbortController();
//   const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

//   try {
//     const response = await fetch(`${DEFAULT_OLLAMA_URL}/api/generate`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       signal: controller.signal,
//       body: JSON.stringify({
//         model: DEFAULT_MODEL,
//         prompt,
//         system,
//         stream: false,
//         format: "json",
//         think: enableThinking, // Native Ollama API flag to disable thinking overhead
//         options: {
//           temperature,
//           num_ctx,
//           num_predict: 2048,
//         },
//       }),
//     });

//     clearTimeout(timeoutId);

//     const rawText = await response.text();

//     if (!response.ok) {
//       throw new Error(
//         `Ollama API returned HTTP ${response.status}: ${rawText}`
//       );
//     }

//     let data: OllamaApiResponse;
//     try {
//       data = JSON.parse(rawText) as OllamaApiResponse;
//     } catch {
//       throw new Error(`Failed to parse Ollama HTTP response as JSON:\n${rawText}`);
//     }

//     if (data.error) {
//       throw new Error(`Ollama Internal Error: ${data.error}`);
//     }

//     // Clean output extraction
//     const output = data.response?.trim();
//     if (output) {
//       return output;
//     }

//     // Edge-case handling for models where reasoning remains enabled
//     if (enableThinking && data.thinking?.trim()) {
//       console.warn("[Ollama] Model output contained within thinking payload.");
//       return data.thinking.trim();
//     }

//     throw new Error("Ollama returned an empty response string.");
//   } catch (error: any) {
//     clearTimeout(timeoutId);
//     if (error.name === "AbortError") {
//       throw new Error(`Ollama request timed out after ${timeoutMs}ms.`);
//     }
//     throw error;
//   }
// }
export interface OllamaOptions {
  prompt: string;
  system?: string;
  temperature?: number;
  num_ctx?: number;
  timeoutMs?: number;
  enableThinking?: boolean;
  jsonFormat?: boolean; // Toggles format: "json"
}

interface OllamaApiResponse {
  model: string;
  created_at: string;
  response: string;
  thinking?: string;
  done: boolean;
  error?: string;
}

const DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434";
const DEFAULT_MODEL = "qwen3.5:4b";

export async function generateOllamaResponse(
  options: OllamaOptions
): Promise<string> {
  const {
    prompt,
    system,
    temperature = 0.1,
    num_ctx = 8192, // Increased context window buffer
    timeoutMs = 60000,
    enableThinking = false,
    jsonFormat = true,
  } = options;

  console.log(`[Ollama] Dispatching request to model: ${DEFAULT_MODEL}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Construct payload body defensively
    const payload: Record<string, unknown> = {
      model: DEFAULT_MODEL,
      prompt,
      system,
      stream: false,
      keep_alive: "30m", // Keep model warm in VRAM during active editing
      options: {
        temperature,
        num_ctx,
        num_predict: 2048,
      },
    };

    // Apply JSON formatting or Thinking mode (mutually exclusive in GBNF sampler)
    if (jsonFormat) {
      payload.format = "json";
      payload.think = false;
    } else {
      payload.think = enableThinking;
    }

    const response = await fetch(`${DEFAULT_OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    const rawText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Ollama API returned HTTP ${response.status}: ${rawText}`
      );
    }

    let data: OllamaApiResponse;
    try {
      data = JSON.parse(rawText) as OllamaApiResponse;
    } catch {
      throw new Error(`Failed to parse Ollama HTTP response as JSON:\n${rawText}`);
    }

    if (data.error) {
      throw new Error(`Ollama Internal Error: ${data.error}`);
    }

    // Clean output extraction
    const output = data.response?.trim();
    if (output) {
      return output;
    }

    // Fallback if model placed answer inside thinking field
    if (enableThinking && data.thinking?.trim()) {
      console.warn("[Ollama] Model output contained within thinking payload.");
      return data.thinking.trim();
    }

    throw new Error("Ollama returned an empty response string.");
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new Error(`Ollama request timed out after ${timeoutMs}ms.`);
    }
    throw error;
  }
}