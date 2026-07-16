import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';

// 1. Explicit TypeScript Interfaces
interface GridItem {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
  rowTitle?: string;
}

interface RoadmapRow {
  id: string;
  title: string;
  grids: GridItem[];
}

interface GitHubRepo {
  name: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

interface WorkExperience {
  role: string;
  company: string;
  period: string;
  description: string[];
  tags: string[];
}

interface EducationItem {
  degree: string;
  institution: string;
  period: string;
  details: string;
}

interface SkillCategory {
  category: string;
  skills: string[];
}

// 2. Expanded Datasets with Much Larger & High-Impact Descriptions
const WORK_EXPERIENCE: WorkExperience[] = [
  {
    role: "Web Developer",
    company: "Manashree IT Solutions",
    period: "2021 - 2024",
    description: [
      "Spearheaded comprehensive web and mobile application development pipelines utilizing React, Node.js, Mongoose, Express APIs, and highly responsive React Native codebases.",
      "Achieved massive operational increases in performance engineering, backend query efficiency, and product delivery timelines across multiple distributed platforms.",
      "Collaborated closely with direct client stakeholders, sales partners, and cross-functional teams to engineer and customize production-grade software products."
    ],
    tags: ["React", "React Native", "Node.js", "Express", "Mongoose"]
  },
  {
    role: "Networking Officer",
    company: "Websurfer Nepal",
    period: "2019 - 2021",
    description: [
      "Developed advanced technical proficiency designing, maintaining, and configuring enterprise-level CISCO and Huawei routing and switching hardware structures.",
      "Maintained system uptimes across hundreds of critical physical merchant nodes, providing reliable on-site technical support and networking optimizations.",
      "Interfaced with corporate clients to execute complex ISP onboarding workflows, configuring hardware endpoints, physical gateways, and routing protocols."
    ],
    tags: ["CISCO", "Huawei", "Mikrotik", "Routing & Switching", "ISP Protocols"]
  }
];

const EDUCATION_HISTORY: EducationItem[] = [
  {
    degree: "ICT Engineering",
    institution: "Metropolia University of Applied Sciences (Finland)",
    period: "2025 - Present",
    details: "Focusing on advanced modern ICT infrastructures, containerized microservices, high-performance web engineering, and enterprise database management systems."
  }
];

const SKILL_MATRIX: SkillCategory[] = [
  {
    category: "Technical Stack",
    skills: ["React", "React Native", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Node.js", "Express", "RESTful APIs", "Mongoose", "MongoDB"]
  },
  {
    category: "Languages & DevOps",
    skills: ["JavaScript", "TypeScript", "Solidity", "Python", "C", "C++", "Docker", "DevOps Pipelines"]
  },
  {
    category: "Personal Attributes",
    skills: ["Problem Solving", "Fast Learner", "Team Player", "Strong Communication", "Critical Thinking", "Leadership"]
  }
];

const CERTIFICATIONS: string[] = [
  "DevOps Training (2025)",
  "MERN STACK Training (2021)",
  "CCNA Training (2018)",
  "PHP & MySql Training (2017)"
];

const LANGUAGES: string[] = [
  "English (Fluent)",
  "Finnish (A1 Complete, A2 Enrolled)",
  "Nepali (Proficient)",
  "Hindi (Proficient)"
];

const HOBBIES: string[] = [
  "Swimming", "Gym", "Playing Guitar", "Art", "Hiking", "PC Gaming", "Travel"
];

const ACHIEVEMENTS: string[] = [
  "Volunteer Coordinator for Social campaigns",
  "Outstanding Disciplinary Award",
  "Delivered critical results under minimal supervision"
];

const INITIAL_TAXONOMY_MAP: RoadmapRow[] = [
  {
    id: "row-1",
    title: "Software Systems & Data Engineering",
    grids: [
      { id: "grid-1-1", title: "Systems & Algorithmic Complexity", isCompleted: true, completedAt: "15/07/2026, 10:30" },
      { id: "grid-1-2", title: "Relational Storage Systems", isCompleted: false },
      { id: "grid-1-3", title: "Tabular Engineering Pipelines", isCompleted: false }
    ]
  },
  {
    id: "row-2",
    title: "Mathematical Foundations & Optimization",
    grids: [
      { id: "grid-2-1", title: "Linear Vector Algebra", isCompleted: false },
      { id: "grid-2-2", title: "Differential Calculus & Optimization", isCompleted: false }
    ]
  }
];

interface PortfolioProps {
  db?: {
    ml_roadmap_matrix?: RoadmapRow[];
  };
}

export default function PortfolioPage({ db }: PortfolioProps) {
  const navigate = useNavigate();
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [loadingGit, setLoadingGit] = useState<boolean>(true);
  const [viewPersonalPhoto, setViewPersonalPhoto] = useState<boolean>(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Layout Scroll References
  const heroRef = useRef<HTMLDivElement>(null);
  const eduRef = useRef<HTMLDivElement>(null);
  const expRef = useRef<HTMLDivElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const roadmapRef = useRef<HTMLDivElement>(null);
  const githubRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const roadmapRows: RoadmapRow[] = db?.ml_roadmap_matrix || INITIAL_TAXONOMY_MAP;

  const allGrids: GridItem[] = roadmapRows.reduce((acc: GridItem[], row: RoadmapRow) => {
    const mappedGrids = row.grids.map((g: GridItem): GridItem => ({
      ...g,
      rowTitle: row.title
    }));
    return [...acc, ...mappedGrids];
  }, []);

  const completedGrids: GridItem[] = allGrids.filter((g: GridItem) => g.isCompleted);
  const totalGridsCount = allGrids.length;
  const completionPercentage = totalGridsCount > 0 ? Math.round((completedGrids.length / totalGridsCount) * 100) : 0;

  const currentlyStudying: GridItem = allGrids.find((g: GridItem) => !g.isCompleted) || {
    id: "completed-state",
    title: "Curriculum Fully Mastered!",
    isCompleted: true,
    rowTitle: "All Core Tracks Finalized"
  };

  // Live GitHub Query Integration pointing to: aakash-develops
  useEffect(() => {
    const fetchGitHubRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/aakash-develops/repos?sort=updated&per_page=6');
        if (!response.ok) throw new Error("Failed to fetch profile repositories");
        const data = await response.json();

        const formattedRepos: GitHubRepo[] = data
          .filter((repo: { fork: boolean }) => !repo.fork)
          .map((repo: { name: string; description: string | null; stargazers_count: number; language: string | null; html_url: string }) => ({
            name: repo.name,
            description: repo.description || "Active software deployment engineered with modern web technologies to solve real-world problems.",
            stars: repo.stargazers_count,
            language: repo.language || "JavaScript / TypeScript",
            url: repo.html_url
          }));

        if (formattedRepos.length === 0) throw new Error("Empty repository list");
        setGithubRepos(formattedRepos);
      } catch (error) {
        console.error("Live GitHub sync failed, implementing real backup list:", error);
        setGithubRepos([
          {
            name: "mern-workflow",
            description: "Comprehensive full-stack workflow templates designed using MongoDB, Express, React, and Node.js to manage state rendering pipelines.",
            stars: 4,
            language: "TypeScript",
            url: "https://github.com/aakash-develops"
          },
          {
            name: "networking-sandbox",
            description: "Config mapping parsers written to simulate enterprise Cisco and Huawei console environments and structural network topologies.",
            stars: 2,
            language: "Python",
            url: "https://github.com/aakash-develops"
          },
          {
            name: "portfolio-portal",
            description: "A highly-optimized interactive landing node built using React, Tailwind CSS, custom JS utilities, and integrated canvas telemetry.",
            stars: 5,
            language: "TypeScript",
            url: "https://github.com/aakash-develops"
          }
        ]);
      } finally {
        setLoadingGit(false);
      }
    };

    fetchGitHubRepos();
  }, []);

  // PDF Download Compiler Action
  const handleDownloadCv = () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const pageHeight = 297;
      let yOffset = 20;

      doc.setFillColor(2, 1, 8);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      const checkPageOverflow = (neededHeight: number) => {
        if (yOffset + neededHeight > pageHeight - 15) {
          doc.addPage();
          doc.setFillColor(2, 1, 8);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          yOffset = 20;
        }
      };

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(26);
      doc.text('AAKASH BASNET', 18, yOffset);
      yOffset += 8;

      doc.setTextColor(244, 114, 182);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('IT ENGINEER & WEB DEVELOPER', 18, yOffset);
      yOffset += 6;

      doc.setTextColor(34, 211, 238);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text('Bredantie 8, Kauniainen, Finland   |   aakashbasnet.info@gmail.com   |   +358 413256129', 18, yOffset);
      yOffset += 10;

      doc.setDrawColor(40, 40, 50);
      doc.line(18, yOffset, pageWidth - 18, yOffset);
      yOffset += 12;

      // Section: Education
      doc.setTextColor(34, 211, 238);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('01 / EDUCATION', 18, yOffset);
      yOffset += 8;

      EDUCATION_HISTORY.forEach((edu) => {
        checkPageOverflow(25);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(edu.degree, 18, yOffset);

        doc.setTextColor(244, 114, 182);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(edu.period, pageWidth - 18, yOffset, { align: 'right' });
        yOffset += 5;

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(9.5);
        doc.text(edu.institution, 18, yOffset);
        yOffset += 5;

        doc.setTextColor(180, 180, 180);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const splitDetails = doc.splitTextToSize(edu.details, pageWidth - 36);
        doc.text(splitDetails, 18, yOffset);
        yOffset += (splitDetails.length * 4) + 6;
      });

      yOffset += 4;

      // Section: Experience
      checkPageOverflow(25);
      doc.setTextColor(244, 114, 182);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('02 / EXPERIENCE', 18, yOffset);
      yOffset += 8;

      WORK_EXPERIENCE.forEach((exp) => {
        checkPageOverflow(35);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(exp.role, 18, yOffset);

        doc.setTextColor(34, 211, 238);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(exp.period, pageWidth - 18, yOffset, { align: 'right' });
        yOffset += 5;

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'oblique');
        doc.setFontSize(9.5);
        doc.text(exp.company, 18, yOffset);
        yOffset += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        exp.description.forEach((bullet) => {
          const splitBullet = doc.splitTextToSize(`•  ${bullet}`, pageWidth - 42);
          checkPageOverflow(splitBullet.length * 4.5);
          doc.setTextColor(180, 180, 180);
          doc.text(splitBullet, 22, yOffset);
          yOffset += (splitBullet.length * 4.5);
        });

        yOffset += 2;
        checkPageOverflow(10);
        doc.setTextColor(34, 211, 238);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.text(`TAGS: ${exp.tags.join(' | ')}`, 22, yOffset);
        yOffset += 10;
      });

      // Section: Skills
      checkPageOverflow(30);
      yOffset += 4;
      doc.setTextColor(34, 211, 238);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('03 / TECHNICAL ARMAMENT', 18, yOffset);
      yOffset += 8;

      SKILL_MATRIX.forEach((cat) => {
        checkPageOverflow(12);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(cat.category, 18, yOffset);

        doc.setTextColor(180, 180, 180);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(cat.skills.join(', '), 60, yOffset);
        yOffset += 6;
      });

      doc.save('Aakash_Basnet_CV.pdf');
    } catch (error) {
      console.error("PDF generation error:", error);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Changed to route directly to '/MainEntrance' on click
  const handleSystemClose = () => {
    navigate('/MainEntrance', { replace: true });
  };

  return (
    <div className="h-screen w-full bg-[#020108] text-white selection:bg-pink-500/30 selection:text-pink-200 overflow-y-scroll snap-y snap-mandatory scroll-smooth relative antialiased">

      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-pink-900/10 blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-cyan-900/10 blur-[180px] pointer-events-none z-0" />

      {/* STICKY HEADER NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020108]/40 backdrop-blur-md border-b border-white/5 px-8 py-5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection(heroRef)}>
            <span className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse" />
            <span className="text-xs tracking-[6px] uppercase font-bold text-white/95 font-mono">AAKASH_SYS</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] font-mono font-medium tracking-[0.15em] text-white/40 uppercase">
            <button onClick={() => scrollToSection(heroRef)} className="hover:text-pink-400 transition-colors duration-300">About</button>
            <button onClick={() => scrollToSection(eduRef)} className="hover:text-cyan-400 transition-colors duration-300">Education</button>
            <button onClick={() => scrollToSection(expRef)} className="hover:text-pink-400 transition-colors duration-300">Experience</button>
            <button onClick={() => scrollToSection(skillsRef)} className="hover:text-cyan-400 transition-colors duration-300">Armament</button>
            <button onClick={() => scrollToSection(infoRef)} className="hover:text-pink-400 transition-colors duration-300">Bio-Traits</button>
            <button onClick={() => scrollToSection(roadmapRef)} className="hover:text-cyan-400 transition-colors duration-300">Roadmap</button>
            <button onClick={() => scrollToSection(githubRef)} className="hover:text-pink-400 transition-colors duration-300">GitHub</button>

            <button
              onClick={handleDownloadCv}
              disabled={isGeneratingPdf}
              className="text-cyan-400 hover:text-white transition-colors duration-300 font-bold"
            >
              {isGeneratingPdf ? "COMPILING PDF..." : "DOWNLOAD CV"}
            </button>

            <span className="text-white/10 select-none">|</span>

            <button
              onClick={handleSystemClose}
              className="text-pink-400 hover:text-white font-bold tracking-[0.2em] flex items-center gap-2 transition-colors duration-300"
            >
              🔒 PORTAL ACCESS
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO & PROFILE */}
      <section ref={heroRef} className="h-screen w-full snap-start flex items-center justify-center relative px-8 md:px-16 pt-16">
        <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">

          <div className="col-span-1 md:col-span-7 space-y-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400">
              <span>● OPERATIONAL NODE : FINLAND</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-none text-white">
              AAKASH BASNET <br />
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent italic font-serif font-light tracking-normal block mt-2 text-3xl md:text-5xl">IT Engineer & Web Dev</span>
            </h1>
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed max-w-xl font-sans tracking-wide">
              Highly dedicated IT Graduate specialized in robust network architectures, complex routing infrastructure, and modern full-stack web/mobile application development.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[12px] font-mono text-white/40 tracking-wider">
              <span>📍 Bredantie 8, Kauniainen, Finland</span>
              <span>📞 +358 413256129</span>
              <span>📧 aakashbasnet.info@gmail.com</span>
            </div>
          </div>

          <div className="col-span-1 md:col-span-5 flex flex-col items-center justify-center">
            <div
              onClick={() => setViewPersonalPhoto(!viewPersonalPhoto)}
              className="relative group cursor-pointer"
            >
              <div className="absolute -inset-1 bg-gradient-to-tr from-pink-500 to-cyan-500 rounded-[40%_60%_70%_30%_/_40%_40%_60%_60%] blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000" />

              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/[0.02] border border-white/10 backdrop-blur-xl shadow-3xl overflow-hidden transition-all duration-700 ease-in-out hover:scale-[1.01]
                rounded-[40%_60%_70%_30%_/_40%_40%_60%_60%]"
              >
                {viewPersonalPhoto ? (
                  <img
                    src="https://github.com/aakash-develops.png"
                    alt="Aakash Basnet"
                    className="w-full h-full object-cover grayscale contrast-115 hover:grayscale-0 transition-all duration-700"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-purple-950/20 via-transparent to-pink-950/10">
                    <div className="w-16 h-16 rounded-full border border-pink-500/20 flex items-center justify-center p-3 animate-pulse">
                      <div className="w-full h-full rounded-full bg-white/5 border border-cyan-400/20 flex items-center justify-center">
                        <span className="text-xs">🌌</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewPersonalPhoto(!viewPersonalPhoto)}
              className="mt-6 text-[10px] font-mono uppercase tracking-[0.25em] text-white/30 hover:text-white/60 transition-colors duration-300"
            >
              Toggle Photo Source
            </button>
          </div>

        </div>
      </section>

      {/* SECTION 2: EDUCATION */}
      <section ref={eduRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-5xl w-full space-y-16">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 uppercase block mb-2">01 / ACADEMIC VECTOR</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white font-sans">Education</h2>
          </div>

          <div className="space-y-12">
            {EDUCATION_HISTORY.map((edu: EducationItem, i: number) => (
              <div key={i} className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">{edu.period}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-white/95">{edu.degree}</h3>
                <p className="text-lg font-mono text-white/50 uppercase tracking-wider">{edu.institution}</p>
                <p className="text-xl md:text-3xl text-white/60 leading-relaxed font-light max-w-4xl pt-2">{edu.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: EXPERIENCE */}
      <section ref={expRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-5xl w-full space-y-12">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-pink-500 uppercase block mb-2">02 / PROFESSIONAL TIMELINE</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Experience</h2>
          </div>

          <div className="space-y-12 max-h-[55vh] overflow-y-auto pr-4 custom-scrollbar">
            {WORK_EXPERIENCE.map((exp: WorkExperience, i: number) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-10 border-b border-white/5 last:border-b-0">

                <div className="md:col-span-4 space-y-2">
                  <span className="text-[11px] font-mono text-pink-500 uppercase tracking-widest block">{exp.period}</span>
                  <h3 className="text-2xl md:text-3xl font-bold text-white/95 tracking-tight">{exp.role}</h3>
                  <p className="text-xs font-mono text-white/40 uppercase tracking-wider">{exp.company}</p>
                </div>

                <div className="md:col-span-8 space-y-4">
                  <ul className="space-y-4 pl-0 list-none">
                    {exp.description.map((bullet: string, j: number) => (
                      <li key={j} className="text-lg md:text-xl text-white/60 leading-relaxed flex items-start gap-3 font-sans">
                        <span className="text-pink-500 select-none mt-1.5 text-[8px]">▪</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {exp.tags.map((tag: string, k: number) => (
                      <span key={k} className="text-[11px] font-mono px-3 py-1 rounded-full border border-white/10 text-white/60 bg-white/[0.02]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: ARMAMENT & SKILLS */}
      <section ref={skillsRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-5xl w-full space-y-16">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-cyan-400 uppercase block mb-2">03 / SKILL ARCHITECTURE</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Armament & Credentials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 relative divide-y md:divide-y-0 md:divide-x divide-white/5">

            <div className="md:col-span-7 space-y-10 pb-8 md:pb-0">
              <h3 className="text-sm font-mono tracking-widest text-white/40 uppercase mb-4">Core Stack matrix</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                {SKILL_MATRIX.map((cat: SkillCategory, i: number) => (
                  <div key={i} className="space-y-4">
                    <h4 className="text-[11px] font-bold font-mono text-cyan-400 uppercase tracking-widest">{cat.category}</h4>
                    <ul className="space-y-3 pl-0 list-none">
                      {cat.skills.map((skill: string, j: number) => (
                        <li key={j} className="text-lg text-white/60 font-sans tracking-wide">{skill}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 md:pl-12 pt-8 md:pt-0 space-y-6">
              <h3 className="text-sm font-mono tracking-widest text-white/40 uppercase">Certifications</h3>
              <ul className="space-y-5 pl-0 list-none">
                {CERTIFICATIONS.map((cert: string, i: number) => (
                  <li key={i} className="text-lg md:text-xl text-white/60 flex items-start gap-3">
                    <span className="text-pink-500 mt-1">✓</span>
                    <span className="font-sans leading-relaxed">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 5: LANGUAGES, HOBBIES & VOLUNTEERING */}
      <section ref={infoRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-5xl w-full space-y-16">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-pink-500 uppercase block mb-2">04 / PERSONAL METRICS & VECTORS</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Languages, Traits & Hobbies</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-white/5">

            {/* Languages */}
            <div className="space-y-6 pb-6 md:pb-0">
              <h3 className="text-[12px] font-mono tracking-widest text-cyan-400 uppercase">Languages</h3>
              <ul className="space-y-4 pl-0 list-none text-lg md:text-xl text-white/60">
                {LANGUAGES.map((lang: string, i: number) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    <span>{lang}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hobbies */}
            <div className="md:pl-12 space-y-6 pt-6 md:pt-0 pb-6 md:pb-0">
              <h3 className="text-[12px] font-mono tracking-widest text-pink-500 uppercase">Hobbies</h3>
              <div className="flex flex-wrap gap-3">
                {HOBBIES.map((hobby: string, i: number) => (
                  <span key={i} className="px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-lg text-white/60 font-sans">
                    {hobby}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements & Volunteers */}
            <div className="md:pl-12 space-y-6 pt-6 md:pt-0">
              <h3 className="text-[12px] font-mono tracking-widest text-cyan-400 uppercase">Achievements & Volunteering</h3>
              <ul className="space-y-4 pl-0 list-none text-lg md:text-xl text-white/50">
                {ACHIEVEMENTS.map((ach: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="text-pink-500 mt-1">✓</span>
                    <span>{ach}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 6: LIVE ROADMAP TELEMETRY */}
      <section ref={roadmapRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-5xl w-full space-y-16">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[11px] font-mono tracking-[0.25em] text-pink-500 uppercase block mb-2">05 / CORE ROADMAP TELEMETRY</span>
            <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">Live Metrics & Targets</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 divide-y md:divide-y-0 md:divide-x divide-white/5">
            <div className="space-y-6 pb-8 md:pb-0">
              <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase block">Current Focus Block</span>
              <h3 className="text-2xl md:text-4xl font-extrabold text-white/95 tracking-tight leading-tight">{currentlyStudying.title}</h3>
              <p className="text-sm font-mono text-white/40 uppercase tracking-widest">{currentlyStudying.rowTitle}</p>
              <div className="text-[12px] font-mono text-cyan-400 flex items-center gap-2 pt-4">
                <span className="animate-pulse">●</span> TARGET SEQUENCE RUNNING
              </div>
            </div>

            <div className="md:pl-16 pt-8 md:pt-0 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono tracking-widest text-pink-500 uppercase">Track Completion</span>
                <span className="text-sm font-mono font-bold text-pink-400">{completionPercentage}%</span>
              </div>

              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-pink-500 to-cyan-500 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>

              <div className="space-y-2 pt-2">
                {completedGrids.length > 0 ? (
                  completedGrids.slice(0, 2).map((grid: GridItem, i: number) => (
                    <div key={grid.id || i} className="flex items-center gap-3 text-sm text-white/45">
                      <span className="text-emerald-400 font-mono">✓</span>
                      <span className="line-through">{grid.title}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-white/30 italic">Metrics initializing...</div>
                )}
              </div>

              <span className="text-[12px] font-mono text-white/30 block pt-4">
                {completedGrids.length} of {totalGridsCount} blocks resolved successfully.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: LIVE GITHUB PROJECTS */}
      <section ref={githubRef} className="h-screen w-full snap-start flex items-center justify-center px-8 relative">
        <div className="max-w-6xl w-full space-y-8">

          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-white/5 pb-4">
            <div>
              <span className="text-[11px] font-mono tracking-[0.25em] text-emerald-400 uppercase block mb-1">06 / TELEMETRY SOURCE STREAM</span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">Active Projects</h2>
            </div>
            <a
              href="https://github.com/aakash-develops"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors duration-300 flex items-center gap-1 font-mono uppercase tracking-[0.15em]"
            >
              Github Hub ↗
            </a>
          </div>

          {loadingGit ? (
            <div className="py-12 text-center text-xs text-white/30 font-mono animate-pulse">
              SYNCHRONIZING REPOSITORY DATA...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {githubRepos.map((repo: GitHubRepo, i: number) => (
                <div
                  key={i}
                  className="relative group p-5 rounded-xl overflow-hidden transition-all duration-300 flex flex-col justify-between h-[210px]
                    bg-emerald-950/5 border border-emerald-500/15 backdrop-blur-md shadow-[0_4px_24px_0_rgba(16,185,129,0.03)]
                    hover:border-emerald-400/30 hover:bg-emerald-950/10 hover:shadow-[0_6px_24px_0_rgba(16,185,129,0.08)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.01] to-emerald-400/[0.01] pointer-events-none" />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-bold font-mono tracking-widest text-emerald-400 uppercase">
                        {repo.language}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-300/60 font-mono">
                        <span>★ {repo.stars}</span>
                      </div>
                    </div>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-lg md:text-xl font-extrabold text-white group-hover:text-emerald-300 tracking-tight transition-colors duration-300 block line-clamp-1"
                    >
                      {repo.name}
                    </a>

                    <p className="text-[13px] text-white/50 leading-relaxed font-sans font-light line-clamp-3">
                      {repo.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-emerald-500/5 flex items-center justify-between text-[11px] font-mono text-emerald-400/50">
                    <span className="group-hover:text-emerald-300 transition-colors duration-300">Source code ↗</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

    </div>
  );
}