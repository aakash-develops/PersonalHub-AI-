import { generateOllamaResponse } from './ollamaService';
import { cleanAndParseLLMJson } from './llmJsonParser';

export interface CategorizedSkills {
  technical: string[];
  labor: string[];
  personal: string[];
}

export interface ExperienceCategoryItem {
  id: string;
  category: 'IT & Software Engineering' | 'General Labor & Operations';
}

const SYSTEM_CLASSIFIER_PROMPT = `You are a strict data classification API. Output ONLY valid JSON matching the requested structure. No markdown, no preambles, no commentary.`;

/**
 * Classifies candidate skills into Technical, Labor, or Personal categories.
 */
export async function categorizeSkillsWithQwen(skills: string[]): Promise<CategorizedSkills> {
  if (!skills || skills.length === 0) {
    return { technical: [], labor: [], personal: [] };
  }

  const userPrompt = `Classify each skill in this array into EXACTLY one of these three categories:
1. "technical" (Software, IT, Networking, Engineering, Frameworks, Languages, Hardware)
2. "labor" (Manual labor, Logistics, Event management, Maintenance, Construction, Warehouse, Driver)
3. "personal" (Soft skills, Interpersonal, Communication, Leadership, Mindset)

Input Skills:
${JSON.stringify(skills)}

Return STRICT JSON format:
{
  "technical": ["skill1"],
  "labor": ["skill2"],
  "personal": ["skill3"]
}`;

  try {
    const response = await generateOllamaResponse({
      system: SYSTEM_CLASSIFIER_PROMPT,
      prompt: userPrompt,
      temperature: 0.1,
      jsonFormat: true,
    });

    const parsed = cleanAndParseLLMJson<CategorizedSkills>(response);

    const technical = Array.isArray(parsed.technical) ? parsed.technical : [];
    const labor = Array.isArray(parsed.labor) ? parsed.labor : [];
    const personal = Array.isArray(parsed.personal) ? parsed.personal : [];

    // Safeguard: Catch any skills Qwen dropped during inference
    const processedSkills = new Set([...technical, ...labor, ...personal]);
    const missingSkills = skills.filter((s) => !processedSkills.has(s));

    return {
      technical: [...technical, ...missingSkills], // Safely append missed skills to technical
      labor,
      personal,
    };
  } catch (error) {
    console.warn('[LLMCategorizer] Skill discussion fallback engaged:', error);
    return { technical: skills, labor: [], personal: [] };
  }
}

/**
 * Classifies experience items using strict deterministic IDs to prevent key mapping failures.
 */
export async function categorizeExperiencesWithQwen(
  experiences: { id: string; role: string; company: string }[]
): Promise<Record<string, string>> {
  if (!experiences || experiences.length === 0) return {};

  const payload = experiences.map((e) => ({
    id: e.id,
    role: e.role,
    company: e.company,
  }));

  const userPrompt = `For each experience entry provided (identified by 'id'), classify it into one of these two categories:
- "IT & Software Engineering"
- "General Labor & Operations"

Input Roles:
${JSON.stringify(payload, null, 2)}

Return STRICT JSON mapping 'id' to 'category':
{
  "exp_01": "IT & Software Engineering",
  "exp_02": "General Labor & Operations"
}`;

  try {
    const response = await generateOllamaResponse({
      system: SYSTEM_CLASSIFIER_PROMPT,
      prompt: userPrompt,
      temperature: 0.1,
      jsonFormat: true,
    });

    return cleanAndParseLLMJson<Record<string, string>>(response);
  } catch (error) {
    console.warn('[LLMCategorizer] Experience discussion fallback engaged:', error);
    return {};
  }
}