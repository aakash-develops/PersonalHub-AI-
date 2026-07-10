// src/pages/JobsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';

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

const STATUS_CONFIG: Record<string, { text: string; color: string; bgGlow: string; border: string }> = {
  'Applied': { text: '⏳ Pending Answer', color: '#4f8cff', bgGlow: 'rgba(79, 140, 255, 0.05)', border: 'rgba(79, 140, 255, 0.25)' },
  'Next Phase': { text: '📞 Callback / Next Phase', color: '#a855f7', bgGlow: 'rgba(168, 85, 247, 0.05)', border: 'rgba(168, 85, 247, 0.25)' },
  'Hired': { text: '🏆 Hired!', color: '#10b981', bgGlow: 'rgba(16, 185, 129, 0.06)', border: 'rgba(16, 185, 129, 0.3)' },
  'Rejected_Upfront': { text: '✕ Applied & Rejected', color: '#ef4444', bgGlow: 'rgba(239, 68, 68, 0.04)', border: 'rgba(239, 68, 68, 0.2)' },
  'Rejected_Interview': { text: '✕ Interviewed & Rejected', color: '#f97316', bgGlow: 'rgba(249, 115, 22, 0.04)', border: 'rgba(249, 115, 22, 0.2)' },
};

const GlassJobCard: React.FC<{
  job: JobItem;
  onUpdateStatus: (id: string, status: 'Next Phase' | 'Rejected' | 'Hired') => void;
  onDelete: (id: string) => void;
}> = ({ job, onUpdateStatus, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  const configKey = job.status === 'Rejected'
    ? (job.rejectedAfterInterview ? 'Rejected_Interview' : 'Rejected_Upfront')
    : job.status;

  const currentConfig = STATUS_CONFIG[configKey] || STATUS_CONFIG['Applied'];

  const renderUIDateTime = () => {
    if (!job.date_applied) return '';
    const parts = job.date_applied.split(',');
    if (parts.length < 2) return parts[0];
    const timeParts = parts[1].trim().split(':');
    const shortTime = timeParts.length >= 2 ? `${timeParts[0]}:${timeParts[1]}` : parts[1].trim();
    return `${parts[0].trim()} @ ${shortTime}`;
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="job-card"
      style={{
        background: isHovered ? currentConfig.bgGlow : 'rgba(13, 13, 18, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '16px',
        border: `1px solid ${isHovered ? currentConfig.color : currentConfig.border}`,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '190px',
        boxSizing: 'border-box',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0px)',
        boxShadow: isHovered
          ? `0 16px 30px rgba(0,0,0,0.6), 0 0 20px ${currentConfig.color}22`
          : `0 4px 16px rgba(0, 0, 0, 0.35)`,
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
          <h4 style={{ margin: '0', fontSize: '17px', fontWeight: '700', color: '#fff', letterSpacing: '-0.3px', wordBreak: 'break-word', flex: 1, paddingRight: '4px' }}>
            {job.role}
          </h4>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '3px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.03)' }}>
              🕒 {renderUIDateTime()}
            </span>

            <button
              onClick={() => onDelete(job.id)}
              title="Remove Application"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 92, 117, 0.25)',
                cursor: 'pointer',
                fontSize: '11px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ff5c75';
                e.currentTarget.style.background = 'rgba(255, 92, 117, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 92, 117, 0.25)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        <div style={{ fontSize: '14.5px', color: currentConfig.color, fontWeight: '600', marginBottom: '4px', transition: 'color 0.2s' }}>{job.company}</div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontStyle: 'italic' }}>{job.category || "General Labor / Other"}</span>
          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', padding: '1px 5px', borderRadius: '3px', border: '1px solid rgba(255,255,255,0.04)' }}>
            📄 {job.cvType || 'General Labor CV'}
          </span>
        </div>

        {job.contactPerson && (
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>
            👤 {job.contactPerson}
          </div>
        )}
      </div>

      <div style={{ marginTop: '18px' }}>
        {job.status !== 'Hired' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {job.status === 'Applied' && (
              <button onClick={() => onUpdateStatus(job.id, 'Next Phase')} style={{ flex: 1, padding: '8px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#d8b4fe', borderRadius: '7px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Callback
              </button>
            )}
            {job.status === 'Next Phase' && (
              <button onClick={() => onUpdateStatus(job.id, 'Hired')} style={{ flex: 1, padding: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#a7f3d0', borderRadius: '7px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                Hired
              </button>
            )}
            <button onClick={() => onUpdateStatus(job.id, 'Rejected')} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', borderRadius: '7px', fontSize: '11.5px', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
        )}

        <div style={{ fontSize: '12px', fontWeight: '700', color: currentConfig.color, borderTop: `1px solid ${currentConfig.color}33`, paddingTop: '10px', letterSpacing: '0.3px', transition: 'all 0.2s' }}>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) return;

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
      contactPerson: contactPerson.trim() || undefined
    };

    onAddJob(newJob.company, newJob.role);
    setLocalJobs(prev => [newJob, ...prev]);

    setCompany('');
    setRole('');
    setContactPerson('');
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

  const sortedJobs = useMemo(() => {
    return [...localJobs].sort((a, b) => {
      const timeA = parseDate(a.date_applied);
      const timeB = parseDate(b.date_applied);
      return sortOrder === 'NEWEST' ? timeB - timeA : timeA - timeB;
    });
  }, [localJobs, sortOrder]);

  const countPending = localJobs.filter(j => j.status === 'Applied').length;
  const countCallbacks = localJobs.filter(j => j.status === 'Next Phase').length;
  const countRejected = localJobs.filter(j => j.status === 'Rejected').length;
  const countHired = localJobs.filter(j => j.status === 'Hired').length;

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(20px, 4vw, 50px) clamp(16px, 3vw, 32px)', color: '#fff', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>

      <style>{`
        .central-dashboard { display: flex; flex-direction: column; gap: 32px; align-items: center; width: 100%; }
        .metrics-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; width: 100%; max-width: 1100px; background: rgba(20, 20, 26, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 16px; box-sizing: border-box; }
        .metric-card { text-align: center; padding: 10px; }
        .metric-num { font-size: 24px; font-weight: 800; margin-bottom: 2px; }
        .metric-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: rgba(255, 255, 255, 0.4); }

        .content-split {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: 32px;
          width: 100%;
          max-width: 1380px;
          align-items: start;
        }

        .grid-viewport {
          max-height: 660px;
          overflow-y: auto;
          width: 100%;
          padding: 6px 16px 20px 6px;
          box-sizing: border-box;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .grid-viewport::-webkit-scrollbar {
          display: none;
        }

        .central-grid {
          display: grid;
          /* 💡 FIXED TRACK CALCULATION: Forces columns to strictly adapt inside layout boundaries */
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          width: 100%;
        }

        .job-card {
          width: 100%;
        }

        @media (max-width: 1280px) {
          .central-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .grid-viewport { max-height: 880px; }
        }
        @media (max-width: 1024px) {
          .content-split { grid-template-columns: 1fr; gap: 32px; }
          .metrics-bar { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 700px) {
          .central-grid { grid-template-columns: minmax(0, 1fr); }
          .grid-viewport { max-height: none; overflow: visible; padding: 0; }
        }
      `}</style>

      {showHiredMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(6, 6, 9, 0.96)', backdropFilter: 'blur(20px)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '60px' }}>🥳🎉💼</span>
          <h1 style={{ fontSize: '36px', fontWeight: 900, color: '#10b981', margin: '15px 0' }}>HURRAY! YOU GOT THE JOB!</h1>
          <button onClick={() => setShowHiredMessage(false)} style={{ padding: '12px 36px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Back to Stream</button>
        </div>
      )}

      <div className="central-dashboard">
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.8px' }}>Job Stream Center</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>Centralized telemetry stream with persistent tracking intelligence.</p>
        </div>

        <div className="metrics-bar">
          <div className="metric-card">
            <div className="metric-num" style={{ color: '#4f8cff' }}>{countPending}</div>
            <div className="metric-label">Pending</div>
          </div>
          <div className="metric-card">
            <div className="metric-num" style={{ color: '#a855f7' }}>{countCallbacks}</div>
            <div className="metric-label">Callbacks</div>
          </div>
          <div className="metric-card">
            <div className="metric-num" style={{ color: '#ef4444' }}>{countRejected}</div>
            <div className="metric-label">Rejected</div>
          </div>
          <div className="metric-card">
            <div className="metric-num" style={{ color: '#10b981' }}>{countHired}</div>
            <div className="metric-label">Accepted / Hired</div>
          </div>
        </div>

        <div className="content-split">
          <div style={{ position: 'sticky', top: '24px' }}>
            <form onSubmit={handleSubmit} style={{ background: '#0d0d12', border: '1px solid #1f1f27', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#4f8cff' }}>Log Work Entry</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>COMPANY / EMPLOYER</label>
                <input type="text" placeholder="e.g. YIT Construction, Clean Oy" value={company} onChange={(e) => setCompany(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>JOB TITLE</label>
                <input type="text" placeholder="e.g. Cleaner, Carpenter" value={role} onChange={(e) => setRole(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>JOB CATEGORY</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  {JOB_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600' }}>CONTACT PERSON / PHONE</label>
                <input type="text" placeholder="e.g. Pekka (Site Manager)" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px' }} />
              </div>

              <button type="submit" style={{ width: '100%', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', padding: '13px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', marginTop: '6px', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>Save Application</button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '4px' }}>
              <button
                onClick={() => setSortOrder(prev => prev === 'NEWEST' ? 'OLDEST' : 'NEWEST')}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '6px', padding: '6px 12px', color: '#4f8cff', fontSize: '11px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                📅 Sort: {sortOrder === 'NEWEST' ? 'Newest Applied' : 'Oldest Applied'}
              </button>
            </div>

            <div className="grid-viewport">
              <div className="central-grid">
                {sortedJobs.length === 0 ? (
                  /* 💡 FIXED BOX-SIZING & OVERFLOW BUG */
                  <div style={{ width: '100%', gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', background: 'rgba(13,13,18,0.2)', boxSizing: 'border-box' }}>
                    No applications found in stream. Fill the form to log your first work entry.
                  </div>
                ) : (
                  sortedJobs.map(job => (
                    <GlassJobCard key={job.id} job={job} onUpdateStatus={updateStatus} onDelete={deleteJob} />
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