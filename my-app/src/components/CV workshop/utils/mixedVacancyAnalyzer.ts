// src/modules/cv-workshop/utils/mixedVacancyAnalyzer.ts
import type { ATSAnalysisResult } from '../types/cvTypes';

/**
 * Uses local Qwen 3 model via Ollama to detect mixed-domain requirements
 */
export async function analyzeMixedVacancyWithQwen(jobDescription: string): Promise<ATSAnalysisResult> {
  const systemPrompt = "You are an expert ATS recruitment parser. Respond strictly in valid JSON.";
  const userPrompt = `
    Analyze this vacancy text:
    """
    ${jobDescription}
    """

    Identify required technical skills, operational skills, detected role domains, and if it is a hybrid role.
    Respond ONLY in JSON matching this schema:
    {
      "matchedKeywords": ["string"],
      "missingKeywords": ["string"],
      "detectedDomains": ["string"],
      "isHybridRole": boolean
    }
  `;

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b", // Calls local Qwen engine
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        format: "json",
        options: { temperature: 0.1 },
        stream: false
      })
    });

    const data = await response.json();
    const parsed = JSON.parse(data.message.content);

    return {
      matchPercentage: 0,
      matchedKeywords: parsed.matchedKeywords || [],
      missingKeywords: parsed.missingKeywords || [],
      detectedDomains: parsed.detectedDomains || ["General"],
      isHybridRole: parsed.isHybridRole || false
    };
  } catch (error) {
    console.error("Qwen Vacancy Analyzer offline:", error);
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      detectedDomains: ["IT"],
      isHybridRole: false
    };
  }
}