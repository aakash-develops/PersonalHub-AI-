import React, { useState, useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import type {
  MasterProfile,
  WorkExperience,
  ExtractedJobData,
  ATSMatchResult,
  AIPatternAuditResult,
  AIPatternLineHighlight,
} from './types/cvTypes';

import { extractJobMatrix } from './utils/keywordMatrixExtractor';
import { calculateATSScore } from './utils/atsScoreCalculator';
import { auditAIPatterns } from './utils/grammarChecker';
import { extractTextFromFile } from './utils/cvDocumentParser';
import { parseFullCvToMasterData } from './utils/masterCvParser';
import { mergeCvIntoMasterProfile, normalizeMasterProfile } from './utils/profileMerger';

interface CvWorkshopProps {
  db: any;
  setDb: React.Dispatch<React.SetStateAction<any>>;
  masterProfile?: MasterProfile;
  onUpdateMasterProfile?: (updated: MasterProfile) => void;
}

export const CvWorkshop: React.FC<CvWorkshopProps> = ({
  db,
  setDb,
  masterProfile: propProfile,
  onUpdateMasterProfile,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Tailored_Resume`,
  });

  const rawMasterProfile =
    propProfile ||
    db?.modules_data?.cv_workshop?.master_profile ||
    db?.masterProfile;

  const masterProfile: MasterProfile = normalizeMasterProfile(rawMasterProfile);

  const handleUpdateMasterProfile = (updatedProfile: MasterProfile) => {
    if (onUpdateMasterProfile) {
      onUpdateMasterProfile(updatedProfile);
    } else {
      setDb((prevDb: any) => ({
        ...prevDb,
        modules_data: {
          ...prevDb.modules_data,
          cv_workshop: {
            ...prevDb.modules_data?.cv_workshop,
            master_profile: updatedProfile,
          },
        },
      }));
    }
  };

  const [activeStep, setActiveStep] = useState<'input' | 'confirm' | 'studio' | 'miner'>('input');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  const [rawJobText, setRawJobText] = useState('');
  const [extractedJob, setExtractedJob] = useState<ExtractedJobData | null>(null);
  const [atsMatch, setAtsMatch] = useState<ATSMatchResult | null>(null);

  const allSkills = [
    ...(masterProfile.skills?.technical || []),
    ...(masterProfile.skills?.personal || []),
  ];

  const [customSummary, setCustomSummary] = useState(masterProfile.aboutMe || '');
  const [customSkills, setCustomSkills] = useState<string[]>(allSkills);
  const [customExperience, setCustomExperience] = useState<WorkExperience[]>(masterProfile.experiences || []);
  const [activeExpIds, setActiveExpIds] = useState<string[]>(
    (masterProfile.experiences || []).map((e: WorkExperience) => e.id)
  );
  const [aiAudit, setAiAudit] = useState<AIPatternAuditResult | null>(null);

  const [minedCvText, setMinedCvText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // Sync state whenever masterProfile updates
  useEffect(() => {
    if (masterProfile) {
      setCustomSummary(masterProfile.aboutMe || '');
      setCustomSkills([
        ...(masterProfile.skills?.technical || []),
        ...(masterProfile.skills?.personal || []),
      ]);
      setCustomExperience(masterProfile.experiences || []);
      setActiveExpIds((masterProfile.experiences || []).map((e: WorkExperience) => e.id));
    }
  }, [JSON.stringify(masterProfile)]);

  const handleWipeMasterProfile = () => {
    const emptyProfile: MasterProfile = {
      contact: { email: '', phone: '', address: '' },
      aboutMe: '',
      skills: { technical: [], personal: [] },
      experiences: [],
      education: [],
      certifications: [],
      languages: [],
      achievements: [],
      hobbies: [],
    };

    setCustomSummary('');
    setCustomSkills([]);
    setCustomExperience([]);
    setActiveExpIds([]);

    handleUpdateMasterProfile(emptyProfile);

    setIsWipeModalOpen(false);
    setIsProfileModalOpen(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setUploadedFileName(file.name);
    setStatusMessage(`Parsing "${file.name}"...`);

    try {
      const extractedText = await extractTextFromFile(file);
      setMinedCvText(extractedText);
      setActiveStep('miner');
    } catch (err: any) {
      alert(err.message || 'Error processing file.');
      setUploadedFileName(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseAndMergeCv = async () => {
    if (!minedCvText.trim()) return;

    setIsLoading(true);
    setStatusMessage('Local Qwen model is parsing full CV structure (including achievements, hobbies & languages)...');

    try {
      const parsedData = await parseFullCvToMasterData(minedCvText);
      const sourceName = uploadedFileName || 'Imported_Document.pdf';
      const mergedProfile = mergeCvIntoMasterProfile(masterProfile, parsedData, sourceName);

      handleUpdateMasterProfile(mergedProfile);

      alert('Master Profile successfully merged!');
      setActiveStep('studio');
    } catch (err: any) {
      alert('Failed to parse CV document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!rawJobText.trim()) return;
    setIsLoading(true);
    setStatusMessage('Analyzing vacancy text...');

    try {
      const jobData = await extractJobMatrix(rawJobText);
      setExtractedJob(jobData);
      setAtsMatch(calculateATSScore(masterProfile, jobData));
      setActiveStep('confirm');
    } catch (err) {
      alert('Error parsing job description.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToStudio = () => {
    setCustomSummary(masterProfile.aboutMe || '');
    setCustomSkills(allSkills);
    setCustomExperience(masterProfile.experiences || []);
    setActiveExpIds((masterProfile.experiences || []).map((e: WorkExperience) => e.id));
    setActiveStep('studio');
    runAiAuditOnCurrentCv(masterProfile.aboutMe || '', masterProfile.experiences || []);
  };

  const handleInjectMissingKeyword = (skill: string) => {
    if (!customSkills.includes(skill)) {
      const updatedSkills = [...customSkills, skill];
      setCustomSkills(updatedSkills);

      if (extractedJob) {
        const tempProfile: MasterProfile = {
          ...masterProfile,
          skills: {
            ...masterProfile.skills,
            technical: [...(masterProfile.skills?.technical || []), skill],
          },
        };
        setAtsMatch(calculateATSScore(tempProfile, extractedJob));
      }
    }
  };

  const toggleExperiencePill = (id: string) => {
    setActiveExpIds((prev) =>
      prev.includes(id) ? prev.filter((expId) => expId !== id) : [...prev, id]
    );
  };

  const runAiAuditOnCurrentCv = async (
    summaryToAudit = customSummary,
    expToAudit = customExperience
  ) => {
    setIsLoading(true);
    setStatusMessage('Auditing CV text...');

    try {
      const activeExperiences = expToAudit.filter((e: WorkExperience) => activeExpIds.includes(e.id));
      const fullCvTextToAudit =
        `${summaryToAudit}\n` +
        activeExperiences
          .map((e: WorkExperience) => `${e.role} at ${e.company}: ${(e.description || []).join(' ')}`)
          .join('\n');

      const auditResult = await auditAIPatterns(fullCvTextToAudit);
      setAiAudit(auditResult);
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const visibleExperiences = customExperience.filter((exp: WorkExperience) => activeExpIds.includes(exp.id));

  return (
    <div className="jobs-container w-full min-h-screen text-dynamic-primary pt-24 pb-16 px-4 md:px-8 max-w-[1600px] mx-auto">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-4 border-b border-dynamic">
        <div>
          <div className="text-xs font-mono tracking-widest uppercase text-dynamic-secondary mb-1">
            Local AI Copilot Matrix
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            ⚡ CV Workshop & ATS Studio
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-4 py-2 rounded-2xl border border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] text-xs font-bold font-mono uppercase hover:bg-[var(--accent-color)]/20 transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            👤 Master Profile Inspector
          </button>

          <div className="profile-tab-bar p-1.5 rounded-2xl flex items-center gap-2">
            <button
              onClick={() => setActiveStep('input')}
              className={`profile-tab-btn ${activeStep === 'input' || activeStep === 'confirm' ? 'active' : ''}`}
            >
              1. Target Job
            </button>
            <button
              onClick={() => setActiveStep('studio')}
              disabled={!extractedJob}
              className={`profile-tab-btn ${activeStep === 'studio' ? 'active it-style' : ''} ${!extractedJob ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              2. Tailor Studio
            </button>
            <button
              onClick={() => setActiveStep('miner')}
              className={`profile-tab-btn ${activeStep === 'miner' ? 'active' : ''}`}
            >
              📂 Profile Miner
            </button>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="mb-6 p-4 rounded-xl border border-dynamic bg-[var(--pill-bg)] backdrop-blur-md flex items-center gap-3 animate-pulse">
          <span className="text-xl">⏳</span>
          <div>
            <div className="text-xs font-mono uppercase text-[var(--accent-color)] font-bold">
              Local AI Engine Processing
            </div>
            <div className="text-xs text-dynamic-secondary mt-0.5">{statusMessage}</div>
          </div>
        </div>
      )}

      {/* PHASE 1: INPUT */}
      {activeStep === 'input' && (
        <div className="p-6 md:p-8 rounded-3xl border border-dynamic bg-[var(--bg-glass)] backdrop-blur-xl shadow-2xl w-full max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-bold mb-1">Paste Target Vacancy / Job Posting</h2>
          <textarea
            rows={12}
            className="generator-textarea w-full rounded-xl border border-dynamic bg-[var(--pill-bg)] p-4 text-xs font-mono focus:outline-none focus:border-[var(--accent-color)] transition-colors text-dynamic-primary leading-relaxed"
            placeholder="Paste raw job description text here..."
            value={rawJobText}
            onChange={(e) => setRawJobText(e.target.value)}
          />
          <button
            onClick={handleAnalyzeJob}
            disabled={isLoading || !rawJobText.trim()}
            className="btn-submit-job w-full py-4 rounded-xl text-xs font-bold font-mono uppercase cursor-pointer hover:opacity-90 disabled:opacity-50 shadow-lg"
          >
            🔍 Analyze Job & Calculate ATS Matrix Match
          </button>
        </div>
      )}

      {/* PHASE 2: CONFIRM */}
      {activeStep === 'confirm' && extractedJob && atsMatch && (
        <div className="p-8 md:p-10 rounded-3xl border border-dynamic bg-[var(--bg-glass)] backdrop-blur-xl shadow-2xl w-full max-w-4xl mx-auto text-center space-y-6">
          <div className="flex flex-col md:flex-row justify-around items-center gap-6 p-8 rounded-2xl bg-[var(--pill-bg)] border border-dynamic">
            <div className="text-left space-y-2 flex-1">
              <h3 className="text-2xl font-bold">{extractedJob.title}</h3>
              <div className="text-sm font-semibold text-[var(--accent-color)]">{extractedJob.company}</div>
            </div>
            <div className="flex flex-col items-center justify-center w-32 h-32 rounded-full border border-dynamic bg-black/10 shrink-0">
              <span className={`text-3xl font-extrabold ${atsMatch.matchPercentage >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {atsMatch.matchPercentage}%
              </span>
              <span className="text-[10px] font-mono uppercase opacity-60">Match</span>
            </div>
          </div>
          <div className="flex justify-center gap-4">
            <button onClick={handleProceedToStudio} className="btn-primary-green px-8 py-3.5 rounded-xl text-xs font-bold uppercase cursor-pointer">
              ✅ Proceed to Tailor Studio
            </button>
            <button onClick={() => setActiveStep('input')} className="btn-outline px-6 py-3.5 rounded-xl text-xs font-mono cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: TAILOR STUDIO */}
      {activeStep === 'studio' && (
        <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8 items-start w-full">
          {/* CONTROLS */}
          <div className="w-full space-y-6">
            <div className="p-6 rounded-3xl border border-dynamic bg-[var(--bg-glass)] shadow-xl space-y-5">
              <h3 className="font-bold text-sm uppercase font-mono text-[var(--accent-color)]">
                🎛️ ATS Gap Controls
              </h3>

              {atsMatch?.missingKeywords && atsMatch.missingKeywords.length > 0 && (
                <div>
                  <label className="text-[11px] font-mono uppercase text-dynamic-secondary block mb-1">
                    Missing Keywords (Click to Inject)
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {atsMatch.missingKeywords.map((kw: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => handleInjectMissingKeyword(kw)}
                        className="text-[11px] px-2.5 py-1 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 font-mono cursor-pointer"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-dynamic-secondary block">
                  Target Profile Summary
                </label>
                <textarea
                  rows={5}
                  className="w-full rounded-xl border border-dynamic bg-[var(--pill-bg)] p-3 text-xs leading-relaxed text-dynamic-primary"
                  value={customSummary}
                  onChange={(e) => setCustomSummary(e.target.value)}
                />
              </div>

              {/* EXPERIENCES SELECTOR */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono uppercase text-dynamic-secondary block">
                  Active Work Experiences ({visibleExperiences.length}/{customExperience.length})
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {customExperience.map((exp: WorkExperience) => (
                    <label
                      key={exp.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        activeExpIds.includes(exp.id)
                          ? 'border-[var(--accent-color)] bg-[var(--pill-bg)]'
                          : 'border-dynamic opacity-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeExpIds.includes(exp.id)}
                        onChange={() => toggleExperiencePill(exp.id)}
                        className="accent-[var(--accent-color)] mt-0.5"
                      />
                      <div className="truncate">
                        <strong className="block truncate font-semibold">{exp.role}</strong>
                        <span className="text-[10px] text-dynamic-secondary font-mono">{exp.company}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button onClick={() => runAiAuditOnCurrentCv()} className="btn-outline flex-1 py-3 rounded-xl text-xs font-mono cursor-pointer">
                  📊 Audit Flow
                </button>
                <button onClick={() => handlePrint()} className="btn-primary-blue flex-1 py-3 rounded-xl text-xs font-bold uppercase cursor-pointer">
                  🖨️ Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* PREVIEW CANVAS */}
          <div className="w-full">
            <div className="p-8 md:p-10 rounded-3xl border border-dynamic bg-white text-slate-900 shadow-2xl">
              <div ref={printRef} className="space-y-6 max-w-[800px] mx-auto font-sans">
                <style>{`
                  @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    @page { margin: 12mm; size: A4 portrait; }
                  }
                `}</style>

                {/* HEADER */}
                <div className="border-b-2 border-slate-800 pb-4">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {masterProfile.contact?.email ? masterProfile.contact.email.split('@')[0].toUpperCase().replace('.', ' ') : 'CURRICULUM VITAE'}
                  </h1>
                  <div className="text-xs text-slate-600 font-mono mt-2 flex flex-wrap gap-x-4 gap-y-1">
                    {masterProfile.contact?.email && <span>📧 {masterProfile.contact.email}</span>}
                    {masterProfile.contact?.phone && <span>📱 {masterProfile.contact.phone}</span>}
                    {masterProfile.contact?.address && <span>📍 {masterProfile.contact.address}</span>}
                  </div>
                </div>

                {/* SUMMARY */}
                {(customSummary || masterProfile.aboutMe) && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-mono">
                      Professional Summary
                    </h2>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {customSummary || masterProfile.aboutMe}
                    </p>
                  </section>
                )}

                {/* SKILLS */}
                {((masterProfile.skills?.technical?.length || 0) > 0 || (masterProfile.skills?.personal?.length || 0) > 0) && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-mono">
                      Skills & Core Competencies
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-700">
                      {masterProfile.skills?.technical && masterProfile.skills.technical.length > 0 && (
                        <div>
                          <strong className="block text-slate-900 font-semibold mb-1">Technical Skills:</strong>
                          <div className="flex flex-wrap gap-1">
                            {masterProfile.skills.technical.map((sk: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {masterProfile.skills?.personal && masterProfile.skills.personal.length > 0 && (
                        <div>
                          <strong className="block text-slate-900 font-semibold mb-1">Soft & Personal Skills:</strong>
                          <div className="flex flex-wrap gap-1">
                            {masterProfile.skills.personal.map((sk: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-mono border border-slate-200">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {/* EXPERIENCES */}
                {visibleExperiences && visibleExperiences.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-3 font-mono">
                      Professional Experience
                    </h2>
                    <div className="space-y-4">
                      {visibleExperiences.map((exp: WorkExperience, i: number) => (
                        <div key={exp.id || i} className="text-xs">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>{exp.role} — <span className="text-slate-700 font-semibold">{exp.company}</span></span>
                            <span className="font-mono text-slate-500 text-[11px]">{exp.period}</span>
                          </div>
                          {exp.description && exp.description.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 mt-1.5 leading-normal">
                              {exp.description.map((bullet: string, idx: number) => (
                                <li key={idx}>{bullet}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* EDUCATION */}
                {masterProfile.education && masterProfile.education.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 mb-2 font-mono">
                      Education
                    </h2>
                    <div className="space-y-2">
                      {masterProfile.education.map((edu: any, i: number) => (
                        <div key={i} className="flex justify-between text-xs">
                          <div>
                            <strong className="block text-slate-900">{edu.degree}</strong>
                            <span className="text-slate-600">{edu.institution}</span>
                          </div>
                          <span className="font-mono text-slate-500 text-[11px]">{edu.period}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* CERTIFICATIONS, LANGUAGES, ACHIEVEMENTS, HOBBIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 text-xs">
                  {masterProfile.certifications && masterProfile.certifications.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase border-b pb-0.5 mb-1">
                        Certifications
                      </h3>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {masterProfile.certifications.map((c: string, i: number) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {masterProfile.languages && masterProfile.languages.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase border-b pb-0.5 mb-1">
                        Languages
                      </h3>
                      <div className="flex flex-wrap gap-1 text-slate-700">
                        {masterProfile.languages.map((l: string, i: number) => (
                          <span key={i} className="after:content-[',_'] last:after:content-none">{l}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {masterProfile.achievements && masterProfile.achievements.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase border-b pb-0.5 mb-1">
                        Achievements
                      </h3>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                        {masterProfile.achievements.map((a: string, i: number) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {masterProfile.hobbies && masterProfile.hobbies.length > 0 && (
                    <div>
                      <h3 className="font-bold text-slate-900 font-mono text-[11px] uppercase border-b pb-0.5 mb-1">
                        Interests & Hobbies
                      </h3>
                      <div className="flex flex-wrap gap-1 text-slate-700">
                        {masterProfile.hobbies.map((h: string, i: number) => (
                          <span key={i} className="after:content-[',_'] last:after:content-none">{h}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {aiAudit && aiAudit.highlights && (
                <div className="no-print mt-8 pt-4 border-t border-dashed border-slate-300">
                  <h4 className="text-xs font-mono font-bold uppercase text-slate-500 mb-2">AI Pattern Audit:</h4>
                  {aiAudit.highlights.map((h: AIPatternLineHighlight, idx: number) => (
                    <div key={idx} className="p-2 rounded text-xs mb-1 bg-slate-100 text-slate-800">
                      "{h.text}" — <em className="text-slate-500">{h.reason}</em>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: MINER */}
      {activeStep === 'miner' && (
        <div className="p-6 md:p-8 rounded-3xl border border-dynamic bg-[var(--bg-glass)] shadow-2xl max-w-5xl mx-auto space-y-6">
          <h2 className="text-xl font-bold mb-1">📂 Master Profile Import Engine</h2>
          <div className="p-8 rounded-2xl border-2 border-dashed border-dynamic bg-[var(--pill-bg)] text-center">
            <label className="btn-primary-blue inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs font-bold uppercase cursor-pointer">
              📄 Upload CV File
              <input type="file" accept=".pdf,image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <textarea
            rows={10}
            className="w-full rounded-xl border border-dynamic bg-[var(--pill-bg)] p-4 text-xs font-mono"
            placeholder="Parsed raw text..."
            value={minedCvText}
            onChange={(e) => setMinedCvText(e.target.value)}
          />
          <button onClick={handleParseAndMergeCv} disabled={isLoading || !minedCvText.trim()} className="btn-primary-green w-full py-4 rounded-xl text-xs font-bold font-mono uppercase cursor-pointer">
            ⚡ Parse & Merge Into Master Profile
          </button>
        </div>
      )}

      {/* INSPECTOR MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-2xl flex items-center justify-center p-4 md:p-8 z-[9999]">
          <div className="p-6 md:p-8 rounded-3xl border border-dynamic bg-[var(--bg-glass)] max-w-5xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">

            {/* MODAL HEADER WITH WIPE & CLOSE BUTTONS */}
            <div className="flex justify-between items-center border-b border-dynamic pb-4 mb-4 shrink-0">
              <div>
                <span className="text-xs font-mono uppercase text-[var(--accent-color)] font-bold">Database Matrix</span>
                <h2 className="text-2xl font-black tracking-tight text-dynamic-primary">👤 Master Profile Overview</h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsWipeModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer flex items-center gap-1.5"
                >
                  🗑️ Wipe Profile
                </button>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-dynamic bg-[var(--pill-bg)] text-xs font-mono uppercase hover:bg-red-500/20 hover:border-red-500 transition-all cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* MODAL SCROLLABLE BODY */}
            <div className="overflow-y-auto space-y-6 pr-2 flex-1">
              {/* 1. CONTACT INFORMATION */}
              <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-3">
                <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                  📍 Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-dynamic-secondary block text-[10px]">EMAIL</span>
                    <strong className="text-dynamic-primary">{masterProfile.contact?.email || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-dynamic-secondary block text-[10px]">PHONE</span>
                    <strong className="text-dynamic-primary">{masterProfile.contact?.phone || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-dynamic-secondary block text-[10px]">LOCATION</span>
                    <strong className="text-dynamic-primary">{masterProfile.contact?.address || 'N/A'}</strong>
                  </div>
                </div>
              </section>

              {/* 2. ABOUT ME / SUMMARY */}
              {masterProfile.aboutMe && (
                <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-2">
                  <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                    📝 About Me / Summary
                  </h3>
                  <p className="text-xs text-dynamic-primary leading-relaxed">
                    {masterProfile.aboutMe}
                  </p>
                </section>
              )}

              {/* 3. SKILLS CATEGORIES */}
              {((masterProfile.skills?.technical?.length || 0) > 0 || (masterProfile.skills?.personal?.length || 0) > 0) && (
                <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                    🛠️ Skills & Competencies
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {masterProfile.skills?.technical && masterProfile.skills.technical.length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono uppercase text-dynamic-secondary block mb-2 font-bold">
                          Technical Skills ({masterProfile.skills.technical.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {masterProfile.skills.technical.map((sk: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg border border-dynamic bg-[var(--bg-glass)] text-xs font-mono text-dynamic-primary">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {masterProfile.skills?.personal && masterProfile.skills.personal.length > 0 && (
                      <div>
                        <span className="text-[11px] font-mono uppercase text-dynamic-secondary block mb-2 font-bold">
                          Personal & Soft Skills ({masterProfile.skills.personal.length})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {masterProfile.skills.personal.map((sk: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg border border-dynamic bg-[var(--bg-glass)] text-xs font-mono text-dynamic-primary">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* 4. WORK EXPERIENCES */}
              {masterProfile.experiences && masterProfile.experiences.length > 0 && (
                <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                    💼 Work Experience ({masterProfile.experiences.length})
                  </h3>

                  <div className="space-y-4">
                    {masterProfile.experiences.map((exp: WorkExperience, idx: number) => (
                      <div key={exp.id || idx} className="p-4 rounded-xl border border-dynamic bg-[var(--bg-glass)] space-y-2">
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-1">
                          <div className="font-bold text-sm text-dynamic-primary">
                            {exp.role} <span className="text-[var(--accent-color)]">@ {exp.company}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {exp.category && (
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 border border-dynamic">
                                {exp.category}
                              </span>
                            )}
                            <span className="text-xs font-mono text-dynamic-secondary">{exp.period}</span>
                          </div>
                        </div>

                        {exp.description && exp.description.length > 0 && (
                          <ul className="list-disc list-inside space-y-1 text-xs text-dynamic-secondary pt-1">
                            {exp.description.map((bullet: string, i: number) => (
                              <li key={i}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 5. EDUCATION */}
              {masterProfile.education && masterProfile.education.length > 0 && (
                <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-4">
                  <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                    🎓 Education ({masterProfile.education.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {masterProfile.education.map((edu: any, i: number) => (
                      <div key={i} className="p-4 rounded-xl border border-dynamic bg-[var(--bg-glass)] space-y-1">
                        <strong className="block text-xs font-bold text-dynamic-primary">{edu.degree}</strong>
                        <div className="text-xs text-dynamic-secondary">{edu.institution}</div>
                        <div className="text-[10px] font-mono text-[var(--accent-color)]">{edu.period}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* 6. MISCELLANEOUS CATEGORIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* CERTIFICATIONS */}
                {masterProfile.certifications && masterProfile.certifications.length > 0 && (
                  <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-2">
                    <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                      📜 Certifications ({masterProfile.certifications.length})
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-dynamic-primary">
                      {masterProfile.certifications.map((c: string, i: number) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* LANGUAGES */}
                {masterProfile.languages && masterProfile.languages.length > 0 && (
                  <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-2">
                    <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                      🌐 Languages ({masterProfile.languages.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {masterProfile.languages.map((l: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg border border-dynamic bg-[var(--bg-glass)] text-dynamic-primary">
                          {l}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {/* ACHIEVEMENTS */}
                {masterProfile.achievements && masterProfile.achievements.length > 0 && (
                  <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-2">
                    <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                      🏆 Achievements ({masterProfile.achievements.length})
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-xs text-dynamic-primary">
                      {masterProfile.achievements.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* HOBBIES */}
                {masterProfile.hobbies && masterProfile.hobbies.length > 0 && (
                  <section className="p-5 rounded-2xl border border-dynamic bg-[var(--pill-bg)] space-y-2">
                    <h3 className="text-xs font-mono uppercase font-bold text-[var(--accent-color)] tracking-wider">
                      🎨 Interests & Hobbies ({masterProfile.hobbies.length})
                    </h3>
                    <div className="flex flex-wrap gap-2 text-xs font-mono">
                      {masterProfile.hobbies.map((h: string, i: number) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg border border-dynamic bg-[var(--bg-glass)] text-dynamic-primary">
                          {h}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SAFETY CONFIRMATION MODAL FOR WIPING PROFILE */}
      {isWipeModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[10000]">
          <div className="p-6 md:p-8 rounded-3xl border border-red-500/30 bg-[#121212] max-w-md w-full text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mx-auto text-3xl">
              ⚠️
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-white">Wipe Master Profile?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Are you sure you want to completely erase your Master Profile? This will clear all skills, work experiences, contact info, languages, and hobbies.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsWipeModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-mono font-bold uppercase hover:bg-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleWipeMasterProfile}
                className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase transition-all cursor-pointer shadow-lg shadow-red-600/30"
              >
                Yes, Wipe All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CvWorkshop;
