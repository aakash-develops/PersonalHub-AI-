// import type { MasterProfile, WorkExperience } from '../types/cvTypes';

// /**
//  * Normalizes flat or legacy MasterProfile shapes into the canonical MasterProfile structure.
//  */
// export function normalizeMasterProfile(raw: any): MasterProfile {
//   if (!raw) raw = {};

//   // Extract contact fields from flat or nested sources
//   const contact = {
//     phone: raw.contact?.phone || raw.phone || '',
//     email: raw.contact?.email || raw.email || '',
//     address: raw.contact?.address || raw.address || '',
//   };

//   // Convert flat skills array into technical/personal structure
//   let skills = { technical: [] as string[], personal: [] as string[] };
//   if (raw.skills) {
//     if (Array.isArray(raw.skills)) {
//       skills.technical = raw.skills;
//     } else {
//       skills.technical = raw.skills.technical || [];
//       skills.personal = raw.skills.personal || [];
//     }
//   }

//   // Normalize experiences array key
//   const rawExp = raw.experiences || raw.experience || [];
//   const experiences: WorkExperience[] = rawExp.map((exp: any, index: number) => ({
//     id: exp.id || `exp-${Date.now()}-${index}`,
//     role: exp.role || exp.title || 'Role',
//     company: exp.company || 'Company',
//     period: exp.period || exp.dates || '',
//     category: exp.category || 'IT',
//     description: Array.isArray(exp.description)
//       ? exp.description
//       : exp.description ? [exp.description] : [],
//   }));

//   return {
//     contact,
//     aboutMe: raw.aboutMe || raw.summary || '',
//     experiences,
//     education: raw.education || [],
//     certifications: raw.certifications || [],
//     skills,
//     languages: raw.languages || [],
//     hobbies: raw.hobbies || [],
//     achievements: raw.achievements || [],
//   };
// }

// /**
//  * Safely merges newly parsed CV data into the existing MasterProfile.
//  */
// export function mergeCvIntoMasterProfile(
//   existingProfile: any,
//   parsedData: any,
//   sourceFileName?: string
// ): MasterProfile {
//   const current = normalizeMasterProfile(existingProfile);
//   const parsed = normalizeMasterProfile(parsedData);

//   // Merge & deduplicate technical skills
//   const mergedTechSkills = Array.from(
//     new Set([...current.skills.technical, ...parsed.skills.technical])
//   );

//   // Merge & deduplicate personal skills
//   const mergedPersonalSkills = Array.from(
//     new Set([...current.skills.personal, ...parsed.skills.personal])
//   );

//   // Combine experience records, preventing duplicate entries by role + company
//   const mergedExperiences = [...current.experiences];
//   parsed.experiences.forEach((newExp) => {
//     const isDuplicate = mergedExperiences.some(
//       (e) =>
//         e.role.toLowerCase() === newExp.role.toLowerCase() &&
//         e.company.toLowerCase() === newExp.company.toLowerCase()
//     );

//     if (!isDuplicate) {
//       mergedExperiences.push(newExp);
//     }
//   });

//   return {
//     ...current,
//     contact: {
//       phone: parsed.contact.phone || current.contact.phone,
//       email: parsed.contact.email || current.contact.email,
//       address: parsed.contact.address || current.contact.address,
//     },
//     aboutMe: parsed.aboutMe.length > current.aboutMe.length ? parsed.aboutMe : current.aboutMe,
//     experiences: mergedExperiences,
//     skills: {
//       technical: mergedTechSkills,
//       personal: mergedPersonalSkills,
//     },
//     education: parsed.education.length > 0 ? parsed.education : current.education,
//   };
// }
import type { MasterProfile, WorkExperience, EducationItem, ExperienceBullet } from '../types/cvTypes';

/**
 * Deduplicates string arrays while ignoring case and surrounding whitespace.
 * Preserves the original casing of the first encountered variant.
 */
function deduplicateStrings(items: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const item of items) {
    if (typeof item !== 'string') continue;
    const trimmed = item.trim();
    if (!trimmed) continue;

    const key = trimmed.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * Converts raw experience descriptions/bullets into normalized ExperienceBullet objects.
 */
function normalizeExperienceBullets(exp: any): ExperienceBullet[] {
  if (Array.isArray(exp.bullets) && exp.bullets.length > 0) {
    return exp.bullets.map((b: any, idx: number) => ({
      id: b.id || `bullet_${Date.now()}_${idx}`,
      text: String(b.text || b || '').trim(),
      category: b.category || 'general',
      isCustom: Boolean(b.isCustom),
    })).filter((b: ExperienceBullet) => b.text.length > 0);
  }

  // Fallback for legacy description string array
  const rawDesc = Array.isArray(exp.description)
    ? exp.description
    : exp.description
    ? [exp.description]
    : [];

  return rawDesc
    .map((d: any, idx: number) => ({
      id: `bullet_${Date.now()}_${idx}`,
      text: String(d).trim(),
      category: 'general' as const,
      isCustom: false,
    }))
    .filter((b: ExperienceBullet) => b.text.length > 0);
}

/**
 * Normalizes flat or legacy MasterProfile shapes into the canonical MasterProfile structure.
 */
export function normalizeMasterProfile(raw: any): MasterProfile {
  if (!raw) raw = {};

  // 1. Contact Info
  const contact = {
    phone: String(raw.contact?.phone || raw.phone || '').trim(),
    email: String(raw.contact?.email || raw.email || '').trim(),
    address: String(raw.contact?.address || raw.address || '').trim(),
  };

  // 2. Skills Extraction
  let technicalSkills: string[] = [];
  let personalSkills: string[] = [];

  if (raw.skills) {
    if (Array.isArray(raw.skills)) {
      technicalSkills = raw.skills;
    } else {
      technicalSkills = Array.isArray(raw.skills.technical) ? raw.skills.technical : [];
      personalSkills = Array.isArray(raw.skills.personal) ? raw.skills.personal : [];
    }
  }

  // 3. Work Experiences
  const rawExp = Array.isArray(raw.experiences)
    ? raw.experiences
    : Array.isArray(raw.experience)
    ? raw.experience
    : [];

  const experiences: WorkExperience[] = rawExp.map((exp: any, index: number) => {
    const bullets = normalizeExperienceBullets(exp);
    return {
      id: exp.id || `exp_${Date.now()}_${index}`,
      role: String(exp.role || exp.title || 'Role').trim(),
      company: String(exp.company || 'Company').trim(),
      period: String(exp.period || exp.dates || '').trim(),
      category: exp.category || 'IT',
      bullets,
      description: bullets.map((b) => b.text), // Maintain legacy string array fallback
    };
  });

  // 4. Education
  const rawEdu = Array.isArray(raw.education) ? raw.education : [];
  const education: EducationItem[] = rawEdu.map((edu: any, index: number) => ({
    id: edu.id || `edu_${Date.now()}_${index}`,
    institution: String(edu.institution || edu.school || '').trim(),
    degree: String(edu.degree || edu.qualification || '').trim(),
    period: String(edu.period || edu.dates || '').trim(),
    description: edu.description ? String(edu.description).trim() : undefined,
  }));

  return {
    contact,
    aboutMe: String(raw.aboutMe || raw.summary || '').trim(),
    experiences,
    education,
    certifications: deduplicateStrings(Array.isArray(raw.certifications) ? raw.certifications : []),
    skills: {
      technical: deduplicateStrings(technicalSkills),
      personal: deduplicateStrings(personalSkills),
    },
    languages: deduplicateStrings(Array.isArray(raw.languages) ? raw.languages : []),
    hobbies: deduplicateStrings(Array.isArray(raw.hobbies) ? raw.hobbies : []),
    achievements: deduplicateStrings(Array.isArray(raw.achievements) ? raw.achievements : []),
  };
}

/**
 * Safely merges newly parsed CV data into the existing MasterProfile.
 */
export function mergeCvIntoMasterProfile(
  existingProfile: any,
  parsedData: any,
  sourceName?:string
): MasterProfile {
  const current = normalizeMasterProfile(existingProfile);
  const parsed = normalizeMasterProfile(parsedData);

  // Deep-merge work experience (append new roles, combine bullets for existing roles)
  const mergedExperiences: WorkExperience[] = [...current.experiences];

  parsed.experiences.forEach((newExp) => {
    const existingIndex = mergedExperiences.findIndex(
      (e) =>
        e.role.toLowerCase() === newExp.role.toLowerCase() &&
        e.company.toLowerCase() === newExp.company.toLowerCase()
    );

    if (existingIndex === -1) {
      mergedExperiences.push(newExp);
    } else {
      // Merge unique bullets into existing experience
      const existingExp = mergedExperiences[existingIndex];
      const existingBulletTexts = new Set(existingExp.bullets.map((b) => b.text.toLowerCase()));

      const uniqueNewBullets = newExp.bullets.filter(
        (b) => !existingBulletTexts.has(b.text.toLowerCase())
      );

      const combinedBullets = [...existingExp.bullets, ...uniqueNewBullets];

      mergedExperiences[existingIndex] = {
        ...existingExp,
        bullets: combinedBullets,
        description: combinedBullets.map((b) => b.text),
      };
    }
  });

  // Combine education records without duplicate institution + degree
  const mergedEducation = [...current.education];
  parsed.education.forEach((newEdu) => {
    const isDuplicate = mergedEducation.some(
      (e) =>
        e.institution.toLowerCase() === newEdu.institution.toLowerCase() &&
        e.degree.toLowerCase() === newEdu.degree.toLowerCase()
    );

    if (!isDuplicate) {
      mergedEducation.push(newEdu);
    }
  });

  return {
    contact: {
      phone: parsed.contact.phone || current.contact.phone,
      email: parsed.contact.email || current.contact.email,
      address: parsed.contact.address || current.contact.address,
    },
    aboutMe: parsed.aboutMe.length > current.aboutMe.length ? parsed.aboutMe : current.aboutMe,
    experiences: mergedExperiences,
    education: mergedEducation,
    skills: {
      technical: deduplicateStrings([...current.skills.technical, ...parsed.skills.technical]),
      personal: deduplicateStrings([...current.skills.personal, ...parsed.skills.personal]),
    },
    certifications: deduplicateStrings([...current.certifications, ...parsed.certifications]),
    languages: deduplicateStrings([...current.languages, ...parsed.languages]),
    hobbies: deduplicateStrings([...current.hobbies, ...parsed.hobbies]),
    achievements: deduplicateStrings([...current.achievements, ...parsed.achievements]),
  };
}