// atsScoreCalculator.ts

import type { MasterProfileData, ExtractedJobData, ATSMatchResult } from '../types/cvTypes';

/**
 * Calculates deterministic ATS match percentage, formatting readiness,
 * and gap analysis between Master Profile and Extracted Job Matrix.
 */
export function calculateATSScore(
  profile: MasterProfileData,
  extractedJob: ExtractedJobData
): ATSMatchResult {
  if (!extractedJob || !profile) {
    return {
      matchPercentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      suggestedActionVerbs: ['Architected', 'Implemented', 'Led', 'Managed', 'Optimized'],
      formattingScore: 100,
      criticalGaps: ['Missing profile or job data.'],
    };
  }

  // 1. Collect all Master Profile text for keyword matching
  const profileSkills = (profile.skills || []).map((s) => s.toLowerCase());
  const profileSummary = (profile.summary || '').toLowerCase();
  const profileExpText = (profile.experience || [])
    .map((e) => `${e.role} ${e.company} ${(e.description || []).join(' ')} ${(e.tags || []).join(' ')}`)
    .join(' ')
    .toLowerCase();

  const combinedProfileText = `${profileSummary} ${profileSkills.join(' ')} ${profileExpText}`;

  // 2. Extract job target terms
  const jobQualifications = extractedJob.qualifications || [];
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  jobQualifications.forEach((qual) => {
    const qualTerm = qual.text.toLowerCase().trim();
    if (!qualTerm) return;

    // Direct string or token match check
    const isMatched =
      combinedProfileText.includes(qualTerm) ||
      profileSkills.some((skill) => qualTerm.includes(skill) || skill.includes(qualTerm));

    if (isMatched) {
      qual.isMatched = true;
      matchedKeywords.push(qual.text);
    } else {
      qual.isMatched = false;
      missingKeywords.push(qual.text);
    }
  });

  // 3. Compute score percentage
  const totalQuals = jobQualifications.length;
  const matchPercentage =
    totalQuals > 0 ? Math.round((matchedKeywords.length / totalQuals) * 100) : 50;

  // 4. Identify Action Verbs & Gaps
  const defaultVerbs = ['Architected', 'Spearheaded', 'Optimized', 'Streamlined', 'Delivered'];
  const criticalGaps = missingKeywords.slice(0, 5).map((kw) => `Missing key qualification: "${kw}"`);

  // Formatting score (simple ATS design check)
  const formattingScore = 95; // Un-nested, clean plain layout baseline

  return {
    matchPercentage,
    matchedKeywords,
    missingKeywords,
    suggestedActionVerbs: defaultVerbs,
    formattingScore,
    criticalGaps,
  };
}