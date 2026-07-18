import React, { useState, useEffect, useMemo } from 'react';
import { jsPDF } from 'jspdf';

interface JobItem {
  id: string;
  company: string;
  role: string;
  category?: string;
  status: 'Applied' | 'Next Phase' | 'Rejected' | 'Hired' | string;
  date_applied: string;
  cvType?: string;
  contactPerson?: string;
  rejectedAfterInterview?: boolean;
  submittedEmail?: string;
}

interface JobsPageProps {
  jobs: JobItem[];
  onAddJob: (company: string, role: string) => void;
  onDeleteJob?: (id: string) => void;
}

const JOB_CATEGORIES = [
  "Construction / Demolition",
  "Cleaning Services",
  "Farms & Agriculture",
  "Logistics / Warehouse",
  "IT / Software Engineering",
  "General Labor / Other"
];

const STATUS_CONFIG: Record<string, { text: string; colorClass: string; statusType: string }> = {
  'Applied': { text: '⏳ Pending Answer', colorClass: 'status-applied', statusType: 'applied' },
  'Next Phase': { text: '📞 Callback / Next Phase', colorClass: 'status-callback', statusType: 'callback' },
  'Hired': { text: '🏆 Hired!', colorClass: 'status-hired', statusType: 'hired' },
  'Rejected_Upfront': { text: '✕ Applied & Rejected', colorClass: 'status-rejected', statusType: 'rejected' },
  'Rejected_Interview': { text: '✕ Interviewed & Rejected', colorClass: 'status-interview-rejected', statusType: 'interview-rejected' },
};

const DEFAULT_IT_TEMPLATE = `[Date]

[HiringManager]
[Company]

Subject: Application for [Role] position

Dear [HiringManager],

I am writing to express my strong interest in the [Role] position at [Company]. With my solid background in software development and technical problem-solving, I am confident in my ability to bring exceptional value to your engineering team.

My technical toolkit fits perfectly with modern development environments, allowing me to craft clean, performant user interfaces and construct reliable systems. Throughout my portfolio projects, I have prioritized high-quality code delivery, seamless system integrations, and stellar user experiences.

I welcome the opportunity to discuss how my skill set aligns with your ongoing software endeavors. Thank you for your time and consideration.

Sincerely,
Aakash Basnet
aakashbasnet.info@gmail.com`;

const DEFAULT_LABOR_TEMPLATE = `[Date]

[HiringManager]
[Company]

Subject: Application for [Role] position

Dear [HiringManager],

I am writing to apply for the [Role] position currently open at [Company]. I possess a strong work ethic, high physical endurance, and a proven track record of reliable team collaboration in fast-paced operational settings.

Whether executing rigorous duties on-site, managing warehouse workflows, or maintaining safety standards, I approach every task with a diligent and proactive attitude. I take pride in being highly punctual, versatile, and quick to learn new procedures.

I am eager to bring my practical, hands-on capabilities to your team. Thank you for considering my application, and I look forward to the prospect of working together.

Sincerely,
Aakash Basnet
aakash.basnet74855@gmail.com`;

const GlassJobCard: React.FC<{
  job: JobItem;
  onUpdateStatus: (id: string, status: 'Next Phase' | 'Rejected' | 'Hired') => void;
  onDelete: (id: string) => void;
  onGenerateCoverLetter: (job: JobItem) => void;
}> = ({ job, onUpdateStatus, onDelete, onGenerateCoverLetter }) => {
  const configKey = job.status === 'Rejected'
    ? (job.rejectedAfterInterview ? 'Rejected_Interview' : 'Rejected_Upfront')
    : job.status;

  const currentConfig = STATUS_CONFIG[configKey] || STATUS_CONFIG['Applied'];
  const isIT = job.category === "IT / Software Engineering";
  const renderedEmail = job.submittedEmail || (isIT ? "aakashbasnet.info@gmail.com" : "aakash.basnet74855@gmail.com");

  const renderUIDateTime = () => {
    if (!job.date_applied) return '';
    const parts = job.date_applied.split(',');
    if (parts.length < 2) return parts[0];
    const timeParts = parts[1].trim().split(':');
    const shortTime = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : parts[1].trim();
    return `${parts[0].trim()} @ ${shortTime}`;
  };

  return (
    <div className={`job-card-v2 status-glow-${currentConfig.statusType}`}>
      <div>
        <div className="job-card-header">
          <h4 className="job-card-title">{job.role}</h4>

          <div className="job-card-actions">
            <span className="job-card-time">
              🕒 {renderUIDateTime()}
            </span>

            <button
              onClick={() => onDelete(job.id)}
              title="Remove Application"
              className="job-card-delete-btn"
            >
              🗑️
            </button>
          </div>
        </div>

        <div className={`job-card-company ${currentConfig.colorClass}`}>{job.company}</div>

        <div className="job-card-tags">
          <span className="job-card-category">{job.category || "General Labor / Other"}</span>
          <span className="job-card-cv-tag">
            📄 {job.cvType || 'General Labor CV'}
          </span>
        </div>

        <div className="job-card-email-row">
          <span className={`job-card-email-badge ${isIT ? 'email-badge-it' : 'email-badge-labor'}`}>
            📧 <span className="font-mono">{renderedEmail}</span>
          </span>

          <button
            onClick={() => onGenerateCoverLetter(job)}
            title="Generate & Edit Cover Letter"
            className="job-card-letter-btn"
          >
            📝 Letter
          </button>
        </div>

        {job.contactPerson && (
          <div className="job-card-contact">
            👤 {job.contactPerson}
          </div>
        )}
      </div>

      <div className="job-card-footer">
        {job.status !== 'Hired' && (
          <div className="job-card-action-row">
            {job.status === 'Applied' && (
              <button onClick={() => onUpdateStatus(job.id, 'Next Phase')} className="btn-callback">
                Callback
              </button>
            )}
            {job.status === 'Next Phase' && (
              <button onClick={() => onUpdateStatus(job.id, 'Hired')} className="btn-hired">
                Hired
              </button>
            )}
            <button onClick={() => onUpdateStatus(job.id, 'Rejected')} className="btn-reject">
              ✕
            </button>
          </div>
        )}

        <div className={`job-card-status-label ${currentConfig.colorClass}`}>
          {currentConfig.text}
        </div>
      </div>
    </div>
  );
};

const JobsPage: React.FC<JobsPageProps> = ({ jobs = [], onAddJob, onDeleteJob }) => {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState('Construction / Demolition');
  const [contactPerson, setContactPerson] = useState('');
  const [showHiredMessage, setShowHiredMessage] = useState(false);
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST');
  const [activeTab, setActiveTab] = useState<'ALL' | 'IT' | 'LABOR'>('ALL');

  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [modalEmailInput, setModalEmailInput] = useState('');
  const [isTemplateEditorOpen, setIsTemplateEditorOpen] = useState(false);
  const [isLetterGeneratorOpen, setIsLetterGeneratorOpen] = useState(false);

  const [itTemplate, setItTemplate] = useState<string>(() => {
    return localStorage.getItem('cv_template_it') || DEFAULT_IT_TEMPLATE;
  });
  const [laborTemplate, setLaborTemplate] = useState<string>(() => {
    return localStorage.getItem('cv_template_labor') || DEFAULT_LABOR_TEMPLATE;
  });

  const [activeJobForLetter, setActiveJobForLetter] = useState<JobItem | null>(null);
  const [currentHiringManager, setCurrentHiringManager] = useState('Hiring Manager');
  const [editableLetterDraft, setEditableLetterDraft] = useState('');

  const [rememberedEmails, setRememberedEmails] = useState<Record<string, string>>(() => {
    const savedMapping = localStorage.getItem('remembered_category_emails');
    return savedMapping ? JSON.parse(savedMapping) : {};
  });

  const [localJobs, setLocalJobs] = useState<JobItem[]>(() => {
    const saved = localStorage.getItem('tracked_jobs');
    if (saved) return JSON.parse(saved);
    return jobs.length > 0 ? jobs : [];
  });

  useEffect(() => {
    const saved = localStorage.getItem('tracked_jobs');
    if (!saved && jobs.length > 0 && localJobs.length === 0) {
      setLocalJobs(jobs);
    }
  }, [jobs, localJobs.length]);

  useEffect(() => {
    localStorage.setItem('tracked_jobs', JSON.stringify(localJobs));
  }, [localJobs]);

  useEffect(() => {
    localStorage.setItem('remembered_category_emails', JSON.stringify(rememberedEmails));
  }, [rememberedEmails]);

  useEffect(() => {
    localStorage.setItem('cv_template_it', itTemplate);
  }, [itTemplate]);

  useEffect(() => {
    localStorage.setItem('cv_template_labor', laborTemplate);
  }, [laborTemplate]);

  const handleSubmitClick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

    const previouslySavedEmail = rememberedEmails[category];

    if (previouslySavedEmail) {
      executeJobSave(previouslySavedEmail);
    } else {
      const standardSuggestion = category === "IT / Software Engineering"
        ? "aakashbasnet.info@gmail.com"
        : "aakash.basnet74855@gmail.com";

      setModalEmailInput(standardSuggestion);
      setIsEmailModalOpen(true);
    }
  };

  const executeJobSave = (emailToAttach: string) => {
    const currentTimestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    let automaticCVTag = "General Labor CV";
    if (category === "IT / Software Engineering") {
      automaticCVTag = "Technical IT Portfolio";
    } else if (category === "Cleaning Services") {
      automaticCVTag = "Cleaning Services CV";
    }

    const newJob: JobItem = {
      id: `j-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      category,
      status: 'Applied',
      date_applied: currentTimestamp,
      cvType: automaticCVTag,
      contactPerson: contactPerson.trim() || undefined,
      submittedEmail: emailToAttach
    };

    onAddJob(newJob.company, newJob.role);
    setLocalJobs(prev => [newJob, ...prev]);

    setCompany('');
    setRole('');
    setContactPerson('');
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetedEmail = modalEmailInput.trim();
    if (!targetedEmail) return;

    setRememberedEmails(prev => ({
      ...prev,
      [category]: targetedEmail
    }));

    setIsEmailModalOpen(false);
    executeJobSave(targetedEmail);
  };

  const updateStatus = (jobId: string, nextStatus: 'Next Phase' | 'Rejected' | 'Hired') => {
    const updated = localJobs.map(j => {
      if (j.id === jobId) {
        if (nextStatus === 'Hired') setShowHiredMessage(true);
        return {
          ...j,
          status: nextStatus,
          rejectedAfterInterview: nextStatus === 'Rejected' && j.status === 'Next Phase' ? true : j.rejectedAfterInterview
        };
      }
      return j;
    });
    setLocalJobs(updated);
  };

  const deleteJob = (jobId: string) => {
    const confirmed = window.confirm("Are you sure you want to permanently delete this job application tracing record?");
    if (!confirmed) return;

    setLocalJobs(prev => prev.filter(j => j.id !== jobId));
    if (onDeleteJob) {
      onDeleteJob(jobId);
    }
  };

  const compileLetterTemplate = (templateBody: string, job: JobItem, manager: string) => {
    let cleanDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    if (job.date_applied) {
      const parts = job.date_applied.split(',');
      if (parts[0]) {
        const [day, month, year] = parts[0].trim().split('/').map(Number);
        if (day && month && year) {
          cleanDate = new Date(year, month - 1, day).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
          });
        }
      }
    }

    return templateBody
      .replace(/\[Company\]/g, job.company)
      .replace(/\[Role\]/g, job.role)
      .replace(/\[Date\]/g, cleanDate)
      .replace(/\[HiringManager\]/g, manager || "Hiring Manager");
  };

  const triggerLetterGenerator = (job: JobItem) => {
    setActiveJobForLetter(job);
    const initialManager = job.contactPerson ? job.contactPerson.split('(')[0].trim() : 'Hiring Manager';
    setCurrentHiringManager(initialManager);

    const activeTemplate = job.category === "IT / Software Engineering" ? itTemplate : laborTemplate;
    const initialDraft = compileLetterTemplate(activeTemplate, job, initialManager);
    setEditableLetterDraft(initialDraft);
    setIsLetterGeneratorOpen(true);
  };

  const handleManagerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetName = e.target.value;
    setCurrentHiringManager(targetName);
    if (activeJobForLetter) {
      const activeTemplate = activeJobForLetter.category === "IT / Software Engineering" ? itTemplate : laborTemplate;
      setEditableLetterDraft(compileLetterTemplate(activeTemplate, activeJobForLetter, targetName));
    }
  };

  const handleDownloadPDF = () => {
    if (!activeJobForLetter) return;
    const doc = new jsPDF();

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    const pageMarginLeft = 20;
    const pageWidthLimit = 170;
    let dynamicCursorY = 25;

    const splitTextBodyLines = doc.splitTextToSize(editableLetterDraft, pageWidthLimit);

    splitTextBodyLines.forEach((singleLine: string) => {
      if (dynamicCursorY > 275) {
        doc.addPage();
        dynamicCursorY = 25;
      }
      doc.text(singleLine, pageMarginLeft, dynamicCursorY);
      dynamicCursorY += 6.5;
    });

    const sanitizedCompanyName = activeJobForLetter.company.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${sanitizedCompanyName}_cover_letter.pdf`);
    setIsLetterGeneratorOpen(false);
  };

  const parseDate = (dateStr: string) => {
    if (!dateStr) return 0;
    const parts = dateStr.split(',');
    const cleanDate = parts[0].trim();
    const cleanTime = parts[1] ? parts[1].trim() : "00:00:00";
    const [day, month, year] = cleanDate.split('/').map(Number);
    const [hour, minute, second] = cleanTime.split(':').map(Number);
    if (!day || !month || !year) return 0;
    return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0).getTime();
  };

  const categorizedJobs = useMemo(() => {
    let sorted = [...localJobs].sort((a, b) => {
      const timeA = parseDate(a.date_applied);
      const timeB = parseDate(b.date_applied);
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });

    if (activeTab === 'IT') {
      return sorted.filter(j => j.category === "IT / Software Engineering");
    } else if (activeTab === 'LABOR') {
      return sorted.filter(j => j.category !== "IT / Software Engineering");
    }
    return sorted;
  }, [localJobs, sortOrder, activeTab]);

  const countPending = localJobs.filter(j => j.status === 'Applied').length;
  const countCallbacks = localJobs.filter(j => j.status === 'Next Phase').length;
  const countRejected = localJobs.filter(j => j.status === 'Rejected').length;
  const countHired = localJobs.filter(j => j.status === 'Hired').length;

  const itCount = localJobs.filter(j => j.category === "IT / Software Engineering").length;
  const laborCount = localJobs.filter(j => j.category !== "IT / Software Engineering").length;

  return (
    <div className="jobs-container text-dynamic-primary font-sans">

      {/* --- MASTER TEMPLATES CONFIGURATION PANEL MODAL --- */}
      {isTemplateEditorOpen && (
        <div className="modal-backdrop backdrop-blur-md">
          <div className="modal-content max-w-4xl bg-glass border-dynamic">
            <div className="modal-header">
              <div>
                <h4 className="modal-title text-blue-preset">Global Master Letter Templates</h4>
                <p className="modal-subtitle text-dynamic-secondary">
                  Write standard template layouts here. Use keys <code>[Date]</code>, <code>[Company]</code>, <code>[Role]</code>, and <code>[HiringManager]</code> to insert properties automatically.
                </p>
              </div>
              <button onClick={() => setIsTemplateEditorOpen(false)} className="modal-close-btn">✕</button>
            </div>

            <div className="template-editor-grid">
              <div className="template-field-group">
                <span className="template-field-label text-purple-preset">💻 TECHNICAL IT TEMPLATE</span>
                <textarea
                  value={itTemplate}
                  onChange={(e) => setItTemplate(e.target.value)}
                  className="template-textarea border-dynamic font-mono"
                />
              </div>

              <div className="template-field-group">
                <span className="template-field-label text-blue-preset">🔨 LABOR MARKET TEMPLATE</span>
                <textarea
                  value={laborTemplate}
                  onChange={(e) => setLaborTemplate(e.target.value)}
                  className="template-textarea border-dynamic font-mono"
                />
              </div>
            </div>

            <div className="modal-actions-footer">
              <button
                onClick={() => {
                  if (window.confirm("Restore both templates back to software factory defaults?")) {
                    setItTemplate(DEFAULT_IT_TEMPLATE);
                    setLaborTemplate(DEFAULT_LABOR_TEMPLATE);
                  }
                }}
                className="btn-outline border-dynamic text-dynamic-secondary"
              >
                Reset Default Templates
              </button>
              <button onClick={() => setIsTemplateEditorOpen(false)} className="btn-primary-blue">
                Save Templates Config
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIVE COVER LETTER COMPILER & PDF DOWNLOAD MODAL --- */}
      {isLetterGeneratorOpen && activeJobForLetter && (
        <div className="modal-backdrop backdrop-blur-md">
          <div className="modal-content max-w-2xl bg-glass border-dynamic">
            <div className="modal-header">
              <div>
                <h4 className="modal-title text-blue-preset">
                  Build Cover Letter: {activeJobForLetter.company}
                </h4>
                <p className="modal-subtitle text-dynamic-secondary">
                  Review and finalize your cover letter below. Edits made here only apply to this download.
                </p>
              </div>
            </div>

            <div className="generator-inputs-grid">
              <div className="template-field-group">
                <span className="input-field-label text-dynamic-secondary">COMPANY / ROLE</span>
                <span className="static-info-badge border-dynamic">
                  {activeJobForLetter.company} — {activeJobForLetter.role}
                </span>
              </div>
              <div className="template-field-group">
                <label className="input-field-label text-dynamic-secondary">HIRING MANAGER / RECIPIENT</label>
                <input
                  type="text"
                  value={currentHiringManager}
                  onChange={handleManagerNameChange}
                  placeholder="e.g. Hiring Manager, John Doe"
                  className="form-input border-dynamic"
                />
              </div>
            </div>

            <div className="template-field-group">
              <span className="input-field-label text-dynamic-secondary">EDIT LETTER BODY</span>
              <textarea
                value={editableLetterDraft}
                onChange={(e) => setEditableLetterDraft(e.target.value)}
                className="generator-textarea border-dynamic font-mono"
              />
            </div>

            <div className="modal-actions-footer full-width">
              <button onClick={() => setIsLetterGeneratorOpen(false)} className="btn-outline border-dynamic text-dynamic-secondary">
                Close Editor
              </button>
              <button onClick={handleDownloadPDF} className="btn-primary-green">
                📥 Save & Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CHANNEL CREATION DIALOG --- */}
      {isEmailModalOpen && (
        <div className="modal-backdrop backdrop-blur-md">
          <form onSubmit={handleModalSubmit} className="modal-content max-w-md bg-glass border-dynamic">
            <div>
              <h4 className="modal-title text-blue-preset">Setup Category Channel</h4>
              <p className="modal-subtitle text-dynamic-secondary">
                First entry logged under <strong className="text-dynamic-primary">"{category}"</strong>. Assign the exact application email address to lock it into system memory.
              </p>
            </div>

            <div className="template-field-group">
              <label className="input-field-label text-dynamic-secondary">APPLICATION EMAIL ADDRESS</label>
              <input
                type="email"
                value={modalEmailInput}
                onChange={(e) => setModalEmailInput(e.target.value)}
                required
                autoFocus
                placeholder="aakash@example.com"
                className="form-input border-dynamic font-mono"
              />
            </div>

            <div className="modal-actions-footer full-width">
              <button type="button" onClick={() => setIsEmailModalOpen(false)} className="btn-outline border-dynamic text-dynamic-secondary">
                Cancel
              </button>
              <button type="submit" className="btn-primary-blue">
                Confirm & Remember
              </button>
            </div>
          </form>
        </div>
      )}

      {showHiredMessage && (
        <div className="celebration-backdrop backdrop-blur-xl">
          <span className="celebration-emoji">🥳🎉💼</span>
          <h1 className="celebration-title">HURRAY! YOU GOT THE JOB!</h1>
          <button onClick={() => setShowHiredMessage(false)} className="btn-celebration-back">Back to Stream</button>
        </div>
      )}

      <div className="central-dashboard">
        <div className="dashboard-header">
          <h2 className="dashboard-title">Job Stream Center</h2>
          <p className="dashboard-subtitle text-dynamic-secondary">Centralized telemetry stream with persistent tracking intelligence.</p>

          <button onClick={() => setIsTemplateEditorOpen(true)} className="btn-settings-template">
            ⚙️ Edit Master Templates
          </button>
        </div>

        <div className="metrics-bar border-dynamic">
          <div className="metric-card">
            <div className="metric-num text-blue-preset">{countPending}</div>
            <div className="metric-label text-dynamic-secondary">Pending</div>
          </div>
          <div className="metric-card">
            <div className="metric-num text-purple-preset">{countCallbacks}</div>
            <div className="metric-label text-dynamic-secondary">Callbacks</div>
          </div>
          <div className="metric-card">
            <div className="metric-num text-red-preset">{countRejected}</div>
            <div className="metric-label text-dynamic-secondary">Rejected</div>
          </div>
          <div className="metric-card">
            <div className="metric-num text-green-preset">{countHired}</div>
            <div className="metric-label text-dynamic-secondary">Accepted / Hired</div>
          </div>
        </div>

        <div className="content-split">
          <div className="sidebar-form-sticky">
            <form onSubmit={handleSubmitClick} className="log-entry-form border-dynamic">
              <h3 className="form-heading text-blue-preset">Log Work Entry</h3>

              <div className="template-field-group">
                <label className="input-field-label text-dynamic-secondary">COMPANY / EMPLOYER</label>
                <input type="text" placeholder="e.g. YIT Construction, Clean Oy" value={company} onChange={(e) => setCompany(e.target.value)} required className="form-input border-dynamic" />
              </div>

              <div className="template-field-group">
                <label className="input-field-label text-dynamic-secondary">JOB TITLE</label>
                <input type="text" placeholder="e.g. Cleaner, Carpenter" value={role} onChange={(e) => setRole(e.target.value)} required className="form-input border-dynamic" />
              </div>

              <div className="template-field-group">
                <label className="input-field-label text-dynamic-secondary">JOB CATEGORY</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-select border-dynamic">
                  {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="template-field-group">
                <label className="input-field-label text-dynamic-secondary">CONTACT PERSON / PHONE</label>
                <input type="text" placeholder="e.g. Pekka (Site Manager)" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="form-input border-dynamic" />
              </div>

              <button type="submit" className="btn-submit-job">Save Application</button>
            </form>
          </div>

          <div className="main-stream-view">
            <div className="stream-toolbar">
              <div className="profile-tab-bar border-dynamic">
                <button onClick={() => setActiveTab('ALL')} className={`profile-tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}>
                  🌐 All Streams ({localJobs.length})
                </button>
                <button onClick={() => setActiveTab('IT')} className={`profile-tab-btn ${activeTab === 'IT' ? 'active it-style' : ''}`}>
                  💻 Professional IT ({itCount})
                </button>
                <button onClick={() => setActiveTab('LABOR')} className={`profile-tab-btn ${activeTab === 'LABOR' ? 'active' : ''}`}>
                  🔨 Labor Market ({laborCount})
                </button>
              </div>

              <button onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')} className="btn-sort-toggle border-dynamic text-blue-preset">
                📅 Sort: {sortOrder === 'NEWEST' ? 'Newest Applied' : 'Oldest Applied'}
              </button>
            </div>

            <div className="grid-viewport">
              <div className="central-grid">
                {categorizedJobs.length === 0 ? (
                  <div className="empty-stream-card border-dynamic text-dynamic-secondary">
                    No applications found in this target profile. Adjust selection filters or submit entries.
                  </div>
                ) : (
                  categorizedJobs.map(job => (
                    <GlassJobCard
                      key={job.id}
                      job={job}
                      onUpdateStatus={updateStatus}
                      onDelete={deleteJob}
                      onGenerateCoverLetter={triggerLetterGenerator}
                    />
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JobsPage;