// // /**
// //  * Utility to safely clean and parse JSON responses from LLM outputs,
// //  * including filtering out Qwen/DeepSeek thinking blocks.
// //  */
// // export function cleanAndParseLLMJson<T = unknown>(rawText: string): T {
// //   if (!rawText || !rawText.trim()) {
// //     throw new Error('LLM returned an empty response string.');
// //   }

// //   let cleaned = rawText.trim();

// //   // 1. Strip reasoning/thinking tags or preamble text
// //   cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
// //   if (cleaned.includes('...done thinking.')) {
// //     cleaned = cleaned.split('...done thinking.').pop() || cleaned;
// //   }

// //   // 2. Strip markdown code fences (```json ... ```)
// //   cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

// //   // 3. Isolate valid JSON boundaries between first '{' or '[' and last '}' or ']'
// //   const firstBrace = cleaned.indexOf('{');
// //   const firstBracket = cleaned.indexOf('[');
// //   let startIndex = -1;

// //   if (firstBrace !== -1 && firstBracket !== -1) {
// //     startIndex = Math.min(firstBrace, firstBracket);
// //   } else if (firstBrace !== -1) {
// //     startIndex = firstBrace;
// //   } else if (firstBracket !== -1) {
// //     startIndex = firstBracket;
// //   }

// //   const lastBrace = cleaned.lastIndexOf('}');
// //   const lastBracket = cleaned.lastIndexOf(']');
// //   const endIndex = Math.max(lastBrace, lastBracket);

// //   if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
// //     cleaned = cleaned.substring(startIndex, endIndex + 1);
// //   }

// //   // 4. Remove non-printable control characters that break JSON.parse
// //   cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
// //     return ['\n', '\r', '\t'].includes(match) ? match : '';
// //   });

// //   try {
// //     return JSON.parse(cleaned) as T;
// //   } catch (err: any) {
// //     console.error('Failed JSON string payload:', cleaned);
// //     throw new Error(`JSON Parsing failed: ${err.message}`);
// //   }
// // }
// /**
//  * Utility to safely clean and parse JSON responses from LLM outputs,
//  * including filtering out Qwen/DeepSeek thinking blocks and common syntax issues.
//  */
// export function cleanAndParseLLMJson<T = unknown>(rawText: string): T {
//   if (!rawText || !rawText.trim()) {
//     throw new Error('LLM returned an empty response string.');
//   }

//   let cleaned = rawText.trim();

//   // 1. Strip reasoning/thinking tags (handles both closed and unclosed <think> blocks)
//   cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
//   cleaned = cleaned.replace(/<think>[\s\S]*$/gi, ''); // Fallback for truncated thinking streams

//   if (cleaned.includes('...done thinking.')) {
//     cleaned = cleaned.split('...done thinking.').pop() || cleaned;
//   }

//   // 2. Strip markdown code fences (```json ... ```)
//   cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

//   // 3. Isolate valid JSON boundaries between first '{' or '[' and last '}' or ']'
//   const firstBrace = cleaned.indexOf('{');
//   const firstBracket = cleaned.indexOf('[');
//   let startIndex = -1;

//   if (firstBrace !== -1 && firstBracket !== -1) {
//     startIndex = Math.min(firstBrace, firstBracket);
//   } else if (firstBrace !== -1) {
//     startIndex = firstBrace;
//   } else if (firstBracket !== -1) {
//     startIndex = firstBracket;
//   }

//   const lastBrace = cleaned.lastIndexOf('}');
//   const lastBracket = cleaned.lastIndexOf(']');
//   const endIndex = Math.max(lastBrace, lastBracket);

//   if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
//     cleaned = cleaned.substring(startIndex, endIndex + 1);
//   }

//   // 4. Remove unprintable non-standard control characters (preserving standard whitespace)
//   cleaned = cleaned.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

//   // 5. Direct parse attempt
//   try {
//     return JSON.parse(cleaned) as T;
//   } catch (initialErr) {
//     // 6. Fallback Repair Stage: Fix trailing commas before closing brackets/braces
//     try {
//       const repairedJson = cleaned
//         .replace(/,\s*([\]}])/g, '$1') // Removes trailing commas like [1, 2, ] or {"a": 1, }
//         .trim();

//       return JSON.parse(repairedJson) as T;
//     } catch (repairErr: any) {
//       console.error('=======================================');
//       console.error('[LLM JSON Parser] Failed to parse JSON payload:');
//       console.error(cleaned);
//       console.error('=======================================');

//       throw new Error(`JSON Parsing failed: ${repairErr.message}`);
//     }
//   }
// }
/**
 * Utility to safely clean, repair, and parse JSON responses from LLM outputs,
 * including filtering out Qwen/DeepSeek thinking blocks and syntax glitches.
 */
export function cleanAndParseLLMJson<T = unknown>(rawText: string): T {
  if (!rawText || !rawText.trim()) {
    throw new Error('LLM returned an empty response string.');
  }

  let cleaned = rawText.trim();

  // 1. Strip reasoning/thinking tags (handles both closed and unclosed <think> blocks)
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/<think>[\s\S]*$/gi, ''); // Fallback for truncated streams

  if (cleaned.includes('...done thinking.')) {
    cleaned = cleaned.split('...done thinking.').pop() || cleaned;
  }

  // 2. Strip markdown code fences (```json ... ```)
  cleaned = cleaned.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  // 3. Strict Structural Boundary Isolation
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');

  if (firstBrace !== -1 || firstBracket !== -1) {
    // Determine if root target is Object or Array based on which appears first
    const isObject = firstBracket === -1 || (firstBrace !== -1 && firstBrace < firstBracket);

    if (isObject) {
      const startIndex = firstBrace;
      const endIndex = cleaned.lastIndexOf('}');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
      }
    } else {
      const startIndex = firstBracket;
      const endIndex = cleaned.lastIndexOf(']');
      if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
      }
    }
  }

  // 4. Scrub invalid control characters (preserving standard escaped whitespace)
  cleaned = cleaned.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // 5. Direct parse attempt
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // 6. Fallback Repair Stage: Trailing commas & unescaped linebreaks
    try {
      const repairedJson = cleaned
        .replace(/,\s*([\]}])/g, '$1') // Removes trailing commas like [1, 2, ] or {"a": 1, }
        .replace(/(?<=:\s*"[^"]*)\r?\n(?=[^"]*")/g, '\\n') // Escape raw newlines inside JSON values
        .trim();

      return JSON.parse(repairedJson) as T;
    } catch (repairErr: any) {
      console.error('=======================================');
      console.error('[LLM JSON Parser] Failed to parse JSON payload:');
      console.error(cleaned);
      console.error('=======================================');

      throw new Error(`JSON Parsing failed: ${repairErr.message}`);
    }
  }
}