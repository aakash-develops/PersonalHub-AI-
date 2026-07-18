import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

interface GridItem { id: string; title: string; isCompleted: boolean; completedAt?: string; rowTitle?: string; }
interface RoadmapRow { id: string; title: string; grids: GridItem[]; }
interface GitHubRepo { name: string; description: string; stars: number; language: string; url: string; }
interface WorkExperience { role: string; company: string; period: string; description: string[]; tags: string[]; }
interface EducationItem { degree: string; institution: string; period: string; details: string; }
interface SkillCategory { category: string; skills: string[]; }
interface CertificationItem { title: string; year: string; }
interface AchievementItem { text: string; }
interface LanguageItem { name: string; proficiency: string; }

const WORK_EXPERIENCE: WorkExperience[] = [
  {
    role: "Web Developer", company: "Manashree IT Solutions", period: "2021 - 2024",
    description: [
      "Spearheaded the webapp development and mobile app development with React, NodeJs, Mongoose, Express API and ReactNative, achieving quick increase in product efficiency and delivery.",
      "Conducted comprehensive teamup with sales and account leading to quality products.",
      "Bridged performance gaps ensuring consistent results."
    ],
    tags: ["React", "Node.js", "Mongoose", "Express API", "ReactNative"]
  },
  {
    role: "Networking Officer", company: "Websurfer Nepal", period: "2019 - 2021",
    description: [
      "Developed advanced technical proficiency across CISCO and Huawei network infrastructure.",
      "Interfaced with business clients, restaurant merchants to provide on-site technical support, hardware installation and staff training.",
      "Managed end-to-end technical onboarding of new merchant accounts, ensuring seamless ISP services."
    ],
    tags: ["CISCO", "Huawei", "Mikrotik", "Routers & Switches", "ISP Onboarding"]
  }
];

const EDUCATION_HISTORY: EducationItem[] = [
  {
    degree: "ICT Engineering", institution: "Metropolia University of Applied Sciences", period: "2025 - Ongoing",
    details: "Pursuing a Bachelor's degree in ICT Engineering with a major in Machine Learning, gaining expertise in artificial intelligence, data analytics, software engineering, and intelligent system design. Applying theoretical knowledge through programming, algorithm development, and practical machine learning projects."
  }
];

const SKILL_MATRIX: SkillCategory[] = [
  { category: "Networking & DB", skills: ["CISCO", "Huawei", "Mikrotik", "Routers", "Switches", "Mongoose"] },
  { category: "Web Ecosystem", skills: ["React", "ReactNative", "Next.js", "HTML", "CSS", "Node.js", "Express", "Restful API"] },
  { category: "Languages & DevOps", skills: ["JavaScript", "TypeScript", "Python", "C", "C++", "DevOps Systems"] },
  { category: "Personal Attributes", skills: ["Problem Solving", "Fast Learner", "Team Player", "Strong Communication", "Critical Thinking", "Leadership"] }
];

const CERTIFICATIONS: CertificationItem[] = [
  { title: "DevOps Training", year: "2025" },
  { title: "MERN STACK Training", year: "2021" },
  { title: "CCNA Training", year: "2018" },
  { title: "PHP & MySql Training", year: "2017" }
];

const ACHIEVEMENTS: AchievementItem[] = [
  { text: "Volunteer Coordinator for Social campaigns" },
  { text: "Outstanding Disciplinary Award" },
  { text: "Delivered critical results under minimal supervision" }
];

const LANGUAGES: LanguageItem[] = [
  { name: "English", proficiency: "Fluent" },
  { name: "Finnish", proficiency: "A1 complete; A2 enroll" },
  { name: "Nepali", proficiency: "Proficient" },
  { name: "Hindi", proficiency: "Proficient" }
];

const HOBBIES: string[] = ["Swimming", "Gym", "Playing Guitar", "Art", "Hiking", "PC Gaming", "Travel"];

const INITIAL_TAXONOMY_MAP: RoadmapRow[] = [
  {
    id: "row-1", title: "Software Systems & Data Engineering",
    grids: [
      { id: "grid-1-1", title: "Systems & Algorithmic Complexity", isCompleted: true, completedAt: "15/07/2026, 10:30" },
      { id: "grid-1-2", title: "Relational Storage Systems", isCompleted: false },
      { id: "grid-1-3", title: "Tabular Engineering Pipelines", isCompleted: false }
    ]
  }
];

interface PortfolioProps {
  db?: { ml_roadmap?: any[]; [key: string]: any; } | null;
  onToggleTheme: () => void;
  currentTheme: 'cosmic' | 'crystal';
}

export default function PortfolioPage({ db, onToggleTheme, currentTheme }: PortfolioProps) {
  const navigate = useNavigate();
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingGit, setLoadingGit] = useState<boolean>(true);
  const [viewPersonalPhoto, setViewPersonalPhoto] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const [address, setAddress] = useState<string>("Bredantie 8, Kauniainen");
  const [isEditingAddress, setIsEditingAddress] = useState<boolean>(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const eduRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const certRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const hobbiesRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const targetRoadmap = db?.modules_data?.ml_roadmap_matrix;
  const roadmapRows: RoadmapRow[] = Array.isArray(targetRoadmap) && targetRoadmap.length > 0 && 'grids' in targetRoadmap[0]
    ? (targetRoadmap as RoadmapRow[])
    : INITIAL_TAXONOMY_MAP;

  const allGrids: GridItem[] = roadmapRows.reduce((acc: GridItem[], row: RoadmapRow) => {
    return [...acc, ...row.grids.map((g): GridItem => ({ ...g, rowTitle: row.title }))];
  }, []);

  const completedGrids = allGrids.filter(g => g.isCompleted);
  const completionPercentage = allGrids.length > 0 ? Math.round((completedGrids.length / allGrids.length) * 100) : 0;
  const currentlyStudying = allGrids.find(g => !g.isCompleted) || { title: "Curriculum Mastered!", rowTitle: "All tracks settled." };

  useEffect(() => {
    const fetchGitHubRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/aakash-develops/repos?sort=updated&per_page=4');
        if (!response.ok) throw new Error("API failure");
        const data = await response.json();
        setGithubRepos(data.filter((r: any) => !r.fork).map((r: any) => ({
          name: r.name,
          description: r.description || "Active production hardware or system layout repository template.",
          stars: r.stargazers_count,
          language: r.language || "JavaScript",
          url: r.html_url
        })));
      } catch (e) {
        setGithubRepos([
          { name: "networking-automation", description: "Advanced system structures automating configurations.", stars: 5, language: "TypeScript", url: "https://github.com/aakash-develops" }
        ]);
      } finally {
        setLoadingGit(false);
      }
    };
    fetchGitHubRepos();
  }, []);

  const handleDownloadCv = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, 210, 297, 'F');

      // Top Header Banner
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 48, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(26);
      doc.text('AAKASH BASNET', 15, 18);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.setTextColor(56, 189, 248);
      doc.text('IT Engineer & Full-Stack Developer', 15, 26);

      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text(`${address}   |   +358 413256129   |   aakashbasnet.info@gmail.com   |   DOB: 28 Feb 1995`, 15, 38);

      let currentY = 56;

      const addSectionHeading = (title: string, yPos: number) => {
        if (yPos > 265) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42);
        doc.text(title.toUpperCase(), 15, yPos);

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.4);
        doc.line(15, yPos + 2, 195, yPos + 2);
        return yPos + 8;
      };

      // ABOUT ME SUMMARY
      currentY = addSectionHeading('About Me', currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const aboutTxt = "Highly dedicated IT Engineer with excellent hands-on experience of Networking and Full Stack Development. Extremely results-focused with broad knowledge of web and mobile app development and networking. Proven record of providing high quality technical support and training to non-technical clients to improve system adoption. Team player with an eye for detail.";
      const splitAbout = doc.splitTextToSize(aboutTxt, 178);
      splitAbout.forEach((line: string) => {
        doc.text(line, 15, currentY);
        currentY += 4.5;
      });
      currentY += 4;

      // WORK EXPERIENCE
      currentY = addSectionHeading('Work Experience', currentY);
      WORK_EXPERIENCE.forEach((exp) => {
        if (currentY > 265) { doc.addPage(); currentY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${exp.role} — ${exp.company}`, 15, currentY);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(exp.period, 195, currentY, { align: 'right' });

        currentY += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);

        exp.description.forEach((bullet) => {
          const splitLines = doc.splitTextToSize(`• ${bullet}`, 178);
          splitLines.forEach((line: string) => {
            if (currentY > 275) { doc.addPage(); currentY = 20; }
            doc.text(line, 18, currentY);
            currentY += 4.5;
          });
        });
        currentY += 2;
      });
      currentY += 2;

      // EDUCATION
      currentY = addSectionHeading('Education Background', currentY);
      EDUCATION_HISTORY.forEach((edu) => {
        if (currentY > 265) { doc.addPage(); currentY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${edu.degree} — ${edu.institution}`, 15, currentY);

        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(edu.period, 195, currentY, { align: 'right' });

        currentY += 4.5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const splitEdu = doc.splitTextToSize(edu.details, 178);
        splitEdu.forEach((line: string) => {
          if (currentY > 275) { doc.addPage(); currentY = 20; }
          doc.text(line, 15, currentY);
          currentY += 4.5;
        });
      });
      currentY += 3;

      // SKILLS MATRIX
      currentY = addSectionHeading('Core Technical Matrix', currentY);
      SKILL_MATRIX.forEach((cat) => {
        if (currentY > 270) { doc.addPage(); currentY = 20; }
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9.5);
        doc.setTextColor(30, 41, 59);
        doc.text(`${cat.category}:`, 15, currentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const wrapped = doc.splitTextToSize(cat.skills.join(', '), 140);
        let targetY = currentY;
        wrapped.forEach((line: string, idx: number) => {
          if (targetY > 275) { doc.addPage(); targetY = 20; currentY = 20; }
          doc.text(line, 52, targetY);
          if (idx < wrapped.length - 1) { targetY += 4; currentY += 4; }
        });
        currentY += 5;
      });
      currentY += 2;

      // TRAINING & CERTIFICATIONS
      currentY = addSectionHeading('Training & Credentials', currentY);
      CERTIFICATIONS.forEach((cert) => {
        if (currentY > 275) { doc.addPage(); currentY = 20; }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        doc.text(`• ${cert.title}`, 15, currentY);
        doc.setFont("helvetica", "italic");
        doc.text(`(${cert.year})`, 85, currentY);
        currentY += 4.5;
      });
      currentY += 2;

      // ACHIEVEMENTS
      currentY = addSectionHeading('Achievements & Volunteer Work', currentY);
      ACHIEVEMENTS.forEach((ach) => {
        if (currentY > 275) { doc.addPage(); currentY = 20; }
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(71, 85, 105);
        const splitAch = doc.splitTextToSize(`• ${ach.text}`, 178);
        splitAch.forEach((line: string) => {
          doc.text(line, 15, currentY);
          currentY += 4.5;
        });
      });
      currentY += 2;

      // LANGUAGES
      currentY = addSectionHeading('Languages', currentY);
      if (currentY > 275) { doc.addPage(); currentY = 20; }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const langStr = LANGUAGES.map(l => `${l.name} (${l.proficiency})`).join('  |  ');
      doc.text(langStr, 15, currentY);
      currentY += 6.5;

      // HOBBIES
      currentY = addSectionHeading('Personal Hobbies & Interests', currentY);
      if (currentY > 275) { doc.addPage(); currentY = 20; }
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(71, 85, 105);
      const hobTxt = HOBBIES.join(', ');
      const splitHob = doc.splitTextToSize(hobTxt, 178);
      splitHob.forEach((line: string) => {
        doc.text(line, 15, currentY);
        currentY += 4.5;
      });

      doc.save('Aakash_Basnet_Resume.pdf');
    } catch (error) {
      console.error("Critical CV engine error:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const BottomDivider = () => (
    <div className="absolute bottom-4 left-0 right-0 w-full flex justify-center items-center opacity-40 pointer-events-none select-none">
      <div className="h-[1px] w-16" style={{ background: 'var(--divider)' }} />
      <div className="w-1 h-1 rotate-45 mx-2 border" style={{ borderColor: 'var(--accent-color)' }} />
      <div className="h-[1px] w-16" style={{ background: 'var(--divider)' }} />
    </div>
  );

  return (
    <div className="w-full min-h-screen text-dynamic-primary relative">

      {/* NAVIGATION BAR */}
      <div className="fixed top-4 left-0 right-0 z-50 px-4">
        <nav
          className="max-w-6xl mx-auto px-6 py-3 rounded-full backdrop-blur-xl transition-all duration-500 flex justify-between items-center border"
          style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
        >
          <div
            onClick={() => scrollToSection(heroRef)}
            className="cursor-pointer font-bold tracking-wider text-sm font-mono"
            style={{ color: 'var(--accent-color)' }}
          >
            AAKASH_SYS
          </div>

          <div className="hidden lg:flex items-center space-x-5 text-[11px] font-semibold tracking-widest uppercase font-mono">
            <button onClick={() => scrollToSection(heroRef)} className="hover:text-[var(--accent-color)] transition-colors">About</button>
            <button onClick={() => scrollToSection(eduRef)} className="hover:text-[var(--accent-color)] transition-colors">Education</button>
            <button onClick={() => scrollToSection(expRef)} className="hover:text-[var(--accent-color)] transition-colors">Experience</button>
            <button onClick={() => scrollToSection(skillsRef)} className="hover:text-[var(--accent-color)] transition-colors">Skills</button>
            <button onClick={() => scrollToSection(certRef)} className="hover:text-[var(--accent-color)] transition-colors">Credentials</button>
            <button onClick={() => scrollToSection(roadmapRef)} className="hover:text-[var(--accent-color)] transition-colors">Roadmap</button>
            <button onClick={() => scrollToSection(hobbiesRef)} className="hover:text-[var(--accent-color)] transition-colors">Hobbies</button>
            <button onClick={() => scrollToSection(githubRef)} className="hover:text-[var(--accent-color)] transition-colors">GitHub</button>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadCv}
              disabled={isGeneratingPdf}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border border-dynamic bg-[var(--pill-bg)] hover:opacity-80 transition-opacity"
            >
              {isGeneratingPdf ? "COMPILING..." : "DOWNLOAD CV"}
            </button>
            <button
              onClick={() => navigate('/MainEntrance', { replace: true })}
              className="px-3 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-color)] text-white hover:opacity-90 transition-opacity"
            >
              🔒 ACCESS
            </button>
          </div>
        </nav>
      </div>

      <div className="snap-wrapper">

        {/* HERO / ABOUT */}
        <section ref={heroRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 flex flex-col md:flex-row gap-10 items-center justify-between"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <div className="space-y-5 flex-grow max-w-2xl order-2 md:order-1">
              <div className="text-xs font-mono tracking-widest opacity-60">OPERATIONAL SYSTEM PROFILE</div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none">AAKASH BASNET</h1>
              <h2 className="text-xl md:text-2xl font-medium tracking-wide" style={{ color: 'var(--accent-color)' }}>IT Engineer & Full-Stack Developer</h2>
              <p className="text-sm md:text-base leading-relaxed text-dynamic-secondary">
                Highly dedicated IT Engineer with excellent hands-on experience of Networking and Full Stack Development. Extremely results-focused with broad knowledge of web and mobile app development and networking. Proven record of providing high quality technical support and training to non-technical clients to improve system adoption. Team player with an eye for detail.
              </p>

              <div className="pt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-dynamic-secondary border-t border-dynamic items-center">
                {isEditingAddress ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => setIsEditingAddress(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingAddress(false); }}
                    className="bg-black/20 border border-dynamic px-2 py-0.5 rounded text-dynamic-primary text-xs font-mono focus:outline-none focus:border-[var(--accent-color)]"
                    autoFocus
                  />
                ) : (
                  <span onClick={() => setIsEditingAddress(true)} className="cursor-pointer border-b border-dashed border-dynamic hover:text-[var(--accent-color)]">
                    🏠 {address}
                  </span>
                )}
                <span>📞 +358 413256129</span>
                <span>✉️ aakashbasnet.info@gmail.com</span>
                <span>🎂 DOB: 28 Feb 1995</span>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center justify-center order-1 md:order-2 w-full md:w-auto">
              <div
                onClick={() => setViewPersonalPhoto(!viewPersonalPhoto)}
                className="w-48 h-56 md:w-56 md:h-64 border relative cursor-pointer group overflow-hidden transition-all duration-700 shadow-xl flex items-center justify-center bg-[var(--pill-bg)]"
                style={{ borderRadius: '42% 58% 70% 30% / 45% 45% 55% 55%', borderColor: viewPersonalPhoto ? 'var(--accent-color)' : 'var(--border-glass)' }}
              >
                {viewPersonalPhoto ? (
                  <img src="https://github.com/aakash-develops.png" alt="Aakash Basnet" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2 animate-bounce">✨</div>
                    <div className="text-[11px] font-mono font-bold tracking-widest uppercase opacity-80 group-hover:text-[var(--accent-color)]">Reveal Node</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* EDUCATION */}
        <section ref={eduRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 space-y-6"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Education</h2>
            <div className="space-y-6">
              {EDUCATION_HISTORY.map((edu, i) => (
                <div key={i} className="space-y-2 border-b border-dynamic pb-4 last:border-none last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="text-xl md:text-2xl font-bold">{edu.degree}</h3>
                    <span className="text-xs font-mono opacity-60">{edu.period}</span>
                  </div>
                  <div className="text-md font-semibold text-dynamic-secondary">{edu.institution}</div>
                  <p className="text-dynamic-secondary text-sm max-w-4xl leading-relaxed">{edu.details}</p>
                </div>
              ))}
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* WORK EXPERIENCE */}
        <section ref={expRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-12 rounded-3xl backdrop-blur-xl border transition-all duration-500 space-y-6 max-h-[78vh] overflow-y-auto"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Work Experience</h2>
            <div className="space-y-6">
              {WORK_EXPERIENCE.map((exp, i) => (
                <div key={i} className="space-y-3 border-b border-dynamic pb-6 last:border-none last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                    <h3 className="text-xl font-bold">{exp.role} <span className="font-normal opacity-50">@</span> {exp.company}</h3>
                    <span className="text-xs font-mono opacity-60">{exp.period}</span>
                  </div>
                  <ul className="list-none space-y-1.5 text-sm text-dynamic-secondary">
                    {exp.description.map((bullet, j) => (
                      <li key={j} className="flex items-start">
                        <span className="inline-block w-1.5 h-1.5 rounded-full mt-2 mr-3 flex-shrink-0" style={{ backgroundColor: 'var(--accent-color)' }} />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {exp.tags.map((tag, k) => (
                      <span key={k} className="text-[10px] font-mono rounded-md border border-dynamic px-2.5 py-0.5 bg-[var(--pill-bg)]">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* SKILLS */}
        <section ref={skillsRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 space-y-6"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Skills Matrix</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {SKILL_MATRIX.map((cat, i) => (
                <div key={i} className="space-y-3">
                  <h4 className="font-bold border-b border-dynamic pb-2 text-xs uppercase tracking-wider font-mono opacity-80">{cat.category}</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.skills.map((skill, j) => (
                      <span key={j} className="text-[11px] px-2.5 py-1 rounded-xl bg-[var(--pill-bg)] border border-dynamic font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* CREDENTIALS, LANGUAGES & ACHIEVEMENTS */}
        <section ref={certRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 grid grid-cols-1 md:grid-cols-2 gap-8"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Training & Certifications</h2>
              <div className="space-y-2">
                {CERTIFICATIONS.map((cert, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-[var(--pill-bg)] border border-dynamic">
                    <span className="text-sm font-medium">{cert.title}</span>
                    <span className="text-xs font-mono opacity-60">{cert.year}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider opacity-60">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((l, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-md border border-dynamic bg-black/10">{l.name}: <span className="opacity-70">{l.proficiency}</span></span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Achievements & Volunteer Work</h2>
              <div className="space-y-3">
                {ACHIEVEMENTS.map((ach, i) => (
                  <div key={i} className="flex items-start p-3 rounded-xl border border-dynamic bg-black/5">
                    <span className="mr-3 text-base">🏅</span>
                    <span className="text-sm leading-relaxed text-dynamic-secondary">{ach.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* SELF-STUDY PROGRESSION */}
        <section ref={roadmapRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 space-y-6"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Professional Upskilling & Self-Study Progression</h2>
            <div className="p-8 rounded-2xl bg-[var(--pill-bg)] border border-dynamic space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-dynamic">
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider opacity-50 block">Completed Framework Milestone</span>
                  <strong className="text-sm md:text-base font-bold mt-1 block text-emerald-400">
                    {completedGrids.map(g => g.title).join(', ') || 'Mathematical Foundations Foundations Initialized'}
                  </strong>
                </div>
                <div>
                  <span className="text-xs uppercase font-mono tracking-wider opacity-50 block">Active Focus & Next Syllabus Track</span>
                  <span className="text-sm md:text-base mt-1 block text-dynamic-primary font-semibold">
                    {currentlyStudying.title} — <span className="text-xs font-mono opacity-60 font-normal">{currentlyStudying.rowTitle}</span>
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span>SELF-STUDY SYLLABUS COMPLETION INDEX</span>
                  <span className="font-bold text-sm" style={{ color: 'var(--accent-color)' }}>{completionPercentage}%</span>
                </div>
                <div className="telemetry-bar-bg" style={{ backgroundColor: 'var(--border-glass)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div className="telemetry-fill" style={{ width: `${completionPercentage}%`, backgroundColor: 'var(--accent-color)', height: '100%', transition: 'width 0.8s ease-in-out' }} />
                </div>
              </div>
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* HOBBIES MATRIX */}
        <section ref={hobbiesRef} className="snap-section px-4">
          <div
            className="w-full max-w-5xl p-10 md:p-14 rounded-3xl backdrop-blur-xl border transition-all duration-500 space-y-6"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}
          >
            <h2 className="text-sm font-mono uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>Personal Hobbies & Interests</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {HOBBIES.map((hobby, i) => (
                <div key={i} className="p-4 rounded-xl border border-dynamic bg-[var(--pill-bg)] text-center transition-all duration-300 hover:border-[var(--accent-color)] group">
                  <span className="text-sm font-semibold tracking-wide block text-dynamic-primary group-hover:text-[var(--accent-color)]">{hobby}</span>
                </div>
              ))}
            </div>
          </div>
          <BottomDivider />
        </section>

        {/* GITHUB WORKSTREAM */}
        <section ref={githubRef} className="snap-section px-4">
          <div className="w-full max-w-5xl space-y-5 max-h-[82vh] overflow-y-auto p-2">
            <h2 className="text-sm font-mono uppercase tracking-widest px-2" style={{ color: 'var(--accent-color)' }}>Active Repositories Stream</h2>
            {loadingGit ? (
              <div className="p-12 text-center rounded-3xl border border-dynamic bg-[var(--bg-glass)] font-mono text-xs animate-pulse">Synchronizing Live Component Arrays...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {githubRepos.map((repo, i) => (
                  <div key={i} className="p-8 rounded-3xl backdrop-blur-xl border flex flex-col justify-between transition-all duration-300 hover:-translate-y-1" style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', boxShadow: 'var(--shadow-premium)' }}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono tracking-wider uppercase bg-[var(--pill-bg)] border border-dynamic px-2.5 py-0.5 rounded text-dynamic-secondary">{repo.language}</span>
                        {repo.stars > 0 && <span className="text-xs font-mono opacity-70">★ {repo.stars}</span>}
                      </div>
                      <h3 className="font-bold text-xl leading-snug">{repo.name}</h3>
                      <p className="text-sm text-dynamic-secondary leading-relaxed line-clamp-2">{repo.description}</p>
                    </div>
                    <a href={repo.url} target="_blank" rel="noreferrer" className="text-xs font-bold tracking-wider font-mono uppercase mt-5 block hover:opacity-60" style={{ color: 'var(--accent-color)' }}>Explore Source ↗</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}