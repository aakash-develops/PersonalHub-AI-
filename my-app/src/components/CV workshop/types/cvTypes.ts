import { z } from 'zod';

// --- Domain & Helper Types ---
export const DomainCategorySchema = z.enum(['IT', 'Labor', 'General', 'Other']).catch('Other');

// --- Experience Bullet (Atomic Pill Level) ---
export const ExperienceBulletSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  text: z.string().default(''),
  category: DomainCategorySchema,
  keywords: z.array(z.string()).default([]),
});

// --- Work Experience ---
export const WorkExperienceSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  role: z.string().default(''),
  company: z.string().default(''),
  period: z.string().default(''),
  category: DomainCategorySchema,
  bullets: z.array(ExperienceBulletSchema).default([]),
  description: z.array(z.string()).default([]), // Backwards compatibility legacy field
});

// --- Education ---
export const EducationItemSchema = z.object({
  id: z.string().default(() => crypto.randomUUID()),
  institution: z.string().default(''),
  degree: z.string().default(''),
  period: z.string().default(''),
  description: z.string().optional(),
});

// --- Master Profile ---
export const MasterProfileSchema = z.object({
  contact: z.object({
    phone: z.string().default(''),
    email: z.string().default(''),
    address: z.string().default(''),
  }),
  aboutMe: z.string().default(''),
  experiences: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  certifications: z.array(z.string()).default([]),
  skills: z.object({
    technical: z.array(z.string()).default([]),
    personal: z.array(z.string()).default([]),
  }),
  languages: z.array(z.string()).default([]),
  hobbies: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
});

// --- Job Analysis & ATS Match Types ---
export const ExtractedJobDataSchema = z.object({
  title: z.string().default(''),
  company: z.string().default(''),
  isHybridRole: z.boolean().default(false),
  detectedDomains: z.array(DomainCategorySchema).default([]),
  keywords: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  rawText: z.string().default(''),
});

export const ATSMatchResultSchema = z.object({
  matchPercentage: z.number().min(0).max(100).default(0),
  matchedKeywords: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
});

// --- AI Pattern Audit Types ---
export const AIPatternLineHighlightSchema = z.object({
  text: z.string(),
  reason: z.string(),
  level: z.enum(['Green', 'Yellow', 'Red']).default('Yellow'),
});

export const AIPatternAuditResultSchema = z.object({
  score: z.number().min(0).max(100),
  status: z.enum(['Green', 'Yellow', 'Red']).default('Green'),
  highlights: z.array(AIPatternLineHighlightSchema).default([]),
});

// --- Automatic TypeScript Type Exports ---
export type DomainCategory = z.infer<typeof DomainCategorySchema>;
export type ExperienceBullet = z.infer<typeof ExperienceBulletSchema>;
export type WorkExperience = z.infer<typeof WorkExperienceSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type MasterProfile = z.infer<typeof MasterProfileSchema>;
export type ExtractedJobData = z.infer<typeof ExtractedJobDataSchema>;
export type ATSMatchResult = z.infer<typeof ATSMatchResultSchema>;
export type AIPatternLineHighlight = z.infer<typeof AIPatternLineHighlightSchema>;
export type AIPatternAuditResult = z.infer<typeof AIPatternAuditResultSchema>;