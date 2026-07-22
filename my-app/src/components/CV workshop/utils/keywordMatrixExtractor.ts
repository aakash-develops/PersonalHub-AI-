
// import { generateOllamaResponse } from './ollamaService';
// import { cleanAndParseLLMJson } from './llmJsonParser';
// import { ExtractedJobDataSchema, type ExtractedJobData } from '../types/cvTypes';

// export async function extractJobMatrix(rawJobText: string): Promise<ExtractedJobData> {
//   const systemPrompt = `You are an automated JSON extraction API. Output strictly a valid raw JSON object matching the requested schema. Do not output markdown, reasoning, preambles, or postscript explanations.

// Target JSON Schema:
// {
//   "title": "Job Title",
//   "company": "Company Name",
//   "category": "IT",
//   "deadline": "YYYY-MM-DD",
//   "keywords": ["skill1", "skill2"],
//   "requirements": ["bullet1", "bullet2"]
// }`;

//   const prompt = `Extract details from this vacancy text into the target JSON structure:\n\n${rawJobText}`;

//   try {
//     const rawResponse = await generateOllamaResponse({
//       prompt,
//       system: systemPrompt, // Fixed parameter name mismatch
//       temperature: 0.1,
//     });

//     let parsedData: any = {};

//     try {
//       parsedData = cleanAndParseLLMJson<Record<string, unknown>>(rawResponse);
//     } catch (parseErr) {
//       console.warn(
//         '[KeywordMatrixExtractor] JSON parser failed on raw output. Constructing word-frequency fallback matrix:',
//         parseErr
//       );

//       // Fallback: If JSON parsing totally fails, extract word candidates so the UI stays functional
//       const words = rawJobText
//         .split(/\s+/)
//         .map((w) => w.replace(/[^a-zA-Z0-9#+]/g, ''))
//         .filter((w) => w.length > 3);

//       parsedData = {
//         title: 'Target Position',
//         company: 'Target Company',
//         keywords: Array.from(new Set(words)).slice(0, 10),
//         requirements: ['Extracted from raw job posting text.'],
//       };
//     }

//     // Merge any skill/keyword key variations into a single clean list
//     const extractedKeywords = [
//       ...(Array.isArray(parsedData.keywords) ? parsedData.keywords : []),
//       ...(Array.isArray(parsedData.skills) ? parsedData.skills : []),
//       ...(Array.isArray(parsedData.requiredSkills) ? parsedData.requiredSkills : []),
//       ...(Array.isArray(parsedData.techStack) ? parsedData.techStack : []),
//     ];

//     const uniqueKeywords = Array.from(
//       new Set(
//         extractedKeywords
//           .filter((k): k is string => typeof k === 'string')
//           .map((k) => k.trim())
//           .filter((k) => k.length > 0)
//       )
//     );

//     // Validate through Zod schema for safety
//     return ExtractedJobDataSchema.parse({
//       title: parsedData.title || 'Target Role',
//       company: parsedData.company || 'Specified Employer',
//       keywords: uniqueKeywords.length > 0 ? uniqueKeywords : ['General Skills'],
//       requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : [],
//     });

//   } catch (error: any) {
//     console.error('[KeywordMatrixExtractor] Fatal error in extraction pipeline:', error);

//     // Safety Net: Guarantee a valid ExtractedJobData object is returned to protect UI state
//     return ExtractedJobDataSchema.parse({
//       title: 'Target Vacancy',
//       company: 'Specified Employer',
//       keywords: ['Communication', 'Teamwork', 'Problem Solving'],
//       requirements: ['Review full job posting details.'],
//     });
//   }
// }
import { generateOllamaResponse } from './ollamaService';
import { cleanAndParseLLMJson } from './llmJsonParser';
import { ExtractedJobDataSchema, type ExtractedJobData } from '../types/cvTypes';

// Lightweight stop-word list to keep word-frequency fallback clean
const COMMON_STOP_WORDS = new Set([
  'with', 'from', 'that', 'have', 'this', 'will', 'your', 'their', 'about',
  'which', 'would', 'there', 'work', 'team', 'experience', 'ability', 'working'
]);

/**
 * Pre-scrubs raw pasted text to remove HTML artifacts, line breaks, and whitespace clutter.
 */
function sanitizeInputText(rawText: string): string {
  return rawText
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/[\r\n]+/g, ' ') // Collapse newlines
    .replace(/\s+/g, ' ')     // Normalize whitespace
    .trim();
}

export async function extractJobMatrix(rawJobText: string): Promise<ExtractedJobData> {
  const cleanInput = sanitizeInputText(rawJobText);

  const systemPrompt = `You are an automated JSON extraction API. Output strictly a valid raw JSON object matching the requested schema. Do not output markdown, reasoning, preambles, or postscript explanations.

Target JSON Schema:
{
  "title": "Job Title",
  "company": "Company Name",
  "isHybridRole": false,
  "detectedDomains": ["IT"],
  "keywords": ["skill1", "skill2"],
  "requirements": ["bullet1", "bullet2"]
}`;

  const prompt = `Extract details from this vacancy text into the target JSON structure:\n\n${cleanInput}`;

  try {
    const rawResponse = await generateOllamaResponse({
      prompt,
      system: systemPrompt,
      temperature: 0.1,
    });

    let parsedData: Record<string, unknown> = {};

    try {
      parsedData = cleanAndParseLLMJson<Record<string, unknown>>(rawResponse);
    } catch (parseErr) {
      console.warn(
        '[KeywordMatrixExtractor] JSON parser failed on raw output. Constructing frequency fallback matrix:',
        parseErr
      );

      // Fallback Tokenizer preserving technical characters (+, #, -, .) while removing stop words
      const words = cleanInput
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w.replace(/[^a-z0-9#+.-]/g, ''))
        .filter((w) => w.length > 3 && !COMMON_STOP_WORDS.has(w));

      parsedData = {
        title: 'Target Position',
        company: 'Target Company',
        isHybridRole: false,
        detectedDomains: ['General'],
        keywords: Array.from(new Set(words)).slice(0, 10),
        requirements: ['Extracted from raw job posting text.'],
      };
    }

    // Merge any skill/keyword key variations into a single clean list
    const rawKeywords = [
      ...(Array.isArray(parsedData.keywords) ? parsedData.keywords : []),
      ...(Array.isArray(parsedData.skills) ? parsedData.skills : []),
      ...(Array.isArray(parsedData.requiredSkills) ? parsedData.requiredSkills : []),
      ...(Array.isArray(parsedData.techStack) ? parsedData.techStack : []),
    ];

    const uniqueKeywords = Array.from(
      new Set(
        rawKeywords
          .filter((k): k is string => typeof k === 'string')
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
      )
    );

    return ExtractedJobDataSchema.parse({
      title: typeof parsedData.title === 'string' ? parsedData.title : 'Target Role',
      company: typeof parsedData.company === 'string' ? parsedData.company : 'Specified Employer',
      isHybridRole: Boolean(parsedData.isHybridRole),
      detectedDomains: Array.isArray(parsedData.detectedDomains) ? parsedData.detectedDomains : ['General'],
      keywords: uniqueKeywords.length > 0 ? uniqueKeywords : ['Communication', 'Organization'],
      requirements: Array.isArray(parsedData.requirements) ? parsedData.requirements : [],
      rawText: rawJobText,
    });

  } catch (error: unknown) {
    console.error('[KeywordMatrixExtractor] Fatal error in extraction pipeline:', error);

    return ExtractedJobDataSchema.parse({
      title: 'Target Vacancy',
      company: 'Specified Employer',
      isHybridRole: false,
      detectedDomains: ['General'],
      keywords: ['Communication', 'Teamwork', 'Problem Solving'],
      requirements: ['Review full job posting details.'],
      rawText: rawJobText,
    });
  }
}