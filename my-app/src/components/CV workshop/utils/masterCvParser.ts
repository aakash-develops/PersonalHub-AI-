
// import { generateOllamaResponse } from './ollamaService';
// import { cleanAndParseLLMJson } from './llmJsonParser';
// import { normalizeMasterProfile } from './profileMerger';
// import { MasterProfileSchema, type MasterProfile } from '../types/cvTypes';

// /**
//  * Uses Ollama to extract structured Master Profile data from raw CV text.
//  */
// export async function parseFullCvToMasterData(
//   rawCvText: string
// ): Promise<MasterProfile> {
//   const systemPrompt = `You are an automated JSON extraction API. Output strictly a valid raw JSON object. Do not output markdown, preambles, reasoning, or explanations.`;

//   const userPrompt = `Extract information from this CV text into JSON format.

// CRITICAL KEY REQUIREMENTS:
// - Use "contact" for phone, email, address.
// - Use "aboutMe" for summary.
// - Use "experiences" for work history (company, role, period, description).
// - Use "education" for degrees/studies (institution, degree, period).
// - Use "skills" object with "technical" string array and "personal" string array.
// - Use "languages" as a plain array of strings, e.g. ["English", "Finnish"].

// CV TEXT:
// ${rawCvText}`;

//   try {
//     console.log('[MasterCvParser] Starting CV extraction pipeline...');
//     console.log('[MasterCvParser] Source payload size:', rawCvText.length, 'chars');

//     const rawResponse = await generateOllamaResponse({
//       system: systemPrompt,
//       prompt: userPrompt,
//       temperature: 0.1,
//       num_ctx: 8192,
//     });

//     console.log('========== RAW LLM RESPONSE ==========');
//     console.log(rawResponse);
//     console.log('======================================');

//     // 1. Clean markdown formatting and strip reasoning blocks
//     const rawJsonObject = cleanAndParseLLMJson<Record<string, unknown>>(rawResponse);

//     // 2. Pre-normalize legacy/variant keys (maps contact_info -> contact, work_experience -> experiences, etc.)
//     const normalizedData = normalizeMasterProfile(rawJsonObject);

//     // 3. Parse and validate through Zod schema to enforce guaranteed types
//     const validatedProfile = MasterProfileSchema.parse(normalizedData);

//     console.log('[MasterCvParser] Profile successfully parsed, normalized, and validated.');
//     return validatedProfile;
//   } catch (error: any) {
//     console.error('===================================');
//     console.error('[MasterCvParser] EXTRACTION FAILURE');
//     console.error(error.message || error);
//     console.error('===================================');

//     throw new Error(`Master CV Parser pipeline failed: ${error.message}`);
//   }
// }
import { generateOllamaResponse } from './ollamaService';
import { cleanAndParseLLMJson } from './llmJsonParser';
import { normalizeMasterProfile } from './profileMerger';
import { MasterProfileSchema, type MasterProfile } from '../types/cvTypes';

/**
 * Uses Ollama (Qwen) to extract structured Master Profile data from raw CV text.
 */
export async function parseFullCvToMasterData(
  rawCvText: string
): Promise<MasterProfile> {
  const systemPrompt = `You are an automated JSON extraction API. Output strictly a valid raw JSON object matching the target structure. Do not output markdown, preambles, reasoning, or explanations.

Target JSON Schema:
{
  "contact": { "phone": "", "email": "", "address": "" },
  "aboutMe": "Professional summary...",
  "experiences": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "period": "2020 - 2023",
      "category": "IT",
      "description": ["Achievement or responsibility bullet 1", "Bullet 2"]
    }
  ],
  "education": [
    { "institution": "University Name", "degree": "B.Sc. Computer Science", "period": "2016 - 2020" }
  ],
  "certifications": ["Cert 1"],
  "skills": {
    "technical": ["React", "TypeScript"],
    "personal": ["Leadership", "Communication"]
  },
  "languages": ["English"]
}`;

  const userPrompt = `Extract all relevant candidate information from this CV text into the target JSON structure:\n\n${rawCvText}`;

  try {
    console.log('[MasterCvParser] Dispatching CV extraction request to Ollama...');
    console.log('[MasterCvParser] Payload size:', rawCvText.length, 'characters');

    const rawResponse = await generateOllamaResponse({
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.1,
      num_ctx: 8192,
      jsonFormat: true, // Force GBNF JSON mode sampler in Ollama
    });

    // 1. Clean markdown formatting and strip reasoning blocks
    const rawJsonObject = cleanAndParseLLMJson<Record<string, unknown>>(rawResponse);

    // 2. Normalize legacy keys and generate bullet IDs
    const normalizedData = normalizeMasterProfile(rawJsonObject);

    // 3. Parse and validate through Zod schema
    const validatedProfile = MasterProfileSchema.parse(normalizedData);

    console.log('[MasterCvParser] Profile successfully parsed, normalized, and validated.');
    return validatedProfile;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('===================================');
    console.error('[MasterCvParser] EXTRACTION FAILURE:', errorMessage);
    console.error('===================================');

    throw new Error(`Master CV Parser pipeline failed: ${errorMessage}`);
  }
}