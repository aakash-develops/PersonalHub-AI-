// src/modules/cv-workshop/utils/sentenceRewriter.ts

/**
 * Rewrites resume bullet points using local Qwen 3[cite: 6]
 */
export async function rewriteSentenceWithQwen(
  bullet: string,
  targetKeywords: string[],
  tone: 'simple' | 'professional'
): Promise<string> {
  const toneInstruction = tone === 'simple'
    ? "Use clear, direct, simple phrasing without corporate jargon."
    : "Use high-impact executive verbs and metrics-focused framing.";

  const systemPrompt = `You are an executive resume editor[cite: 6]. ${toneInstruction} Preserve baseline action verbs and facts.`;
  const userPrompt = `
    Original Bullet: "${bullet}"
    Keywords to naturally integrate: ${JSON.stringify(targetKeywords)}

    Output ONLY the rewritten bullet point sentence string.
  `;

  try {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3:8b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        options: { temperature: 0.3 },
        stream: false
      })
    });

    const data = await response.json();
    return data.message.content.replace(/^["']|["']$/g, '').trim();
  } catch (error) {
    console.error("Local Qwen Sentence Rewriter Error:", error);
    return bullet; // Fallback to original bullet if local service is unreachable[cite: 6]
  }
}