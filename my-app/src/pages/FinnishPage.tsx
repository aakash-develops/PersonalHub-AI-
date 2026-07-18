// src/pages/FinnishPage.tsx
import React, { useState, useEffect, useRef } from 'react';

interface StudyLog {
  id: string;
  activity: string;
  minutes_spent: number;
  date: string;
}

interface FinnishPageProps {
  logs?: StudyLog[];
  onAddPractice?: (activity: string, minutes: number) => void;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgGlow: string; targetHours: number }> = {
  'A1.1': { label: 'A1.1 (Beginner)', color: '#3b82f6', bgGlow: 'rgba(59, 130, 246, 0.15)', targetHours: 60 },
  'A1.2': { label: 'A1.2 (Elementary)', color: '#10b981', bgGlow: 'rgba(16, 185, 129, 0.15)', targetHours: 80 },
  'A2.1': { label: 'A2.1 (Pre-Interm)', color: '#a855f7', bgGlow: 'rgba(168, 85, 247, 0.15)', targetHours: 100 },
  'A2.2': { label: 'A2.2 (Intermediate)', color: '#f59e0b', bgGlow: 'rgba(245, 158, 11, 0.15)', targetHours: 100 },
  'B1.1': { label: 'B1.1 (Conversational)', color: '#ec4899', bgGlow: 'rgba(236, 72, 153, 0.15)', targetHours: 140 },
  'B1.2': { label: 'B1.2 (Professional)', color: '#06b6d4', bgGlow: 'rgba(6, 182, 212, 0.15)', targetHours: 160 },
  'B2':   { label: 'B2 (YKI Native)', color: '#f43f5e', bgGlow: 'rgba(244, 63, 94, 0.15)', targetHours: 200 }
};

const DAILY_TARGET_MINUTES = 60;

const FinnishPage: React.FC<FinnishPageProps> = ({ logs = [], onAddPractice }) => {
  const [activeLevel, setActiveLevel] = useState<string>('A1.1');
  const [activeTab, setActiveTab] = useState<'grids' | 'history'>('grids');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFormDomain, setActiveFormDomain] = useState<'Listening' | 'Speaking' | 'Reading' | 'Writing'>('Listening');

  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(logs);
  const [, setIsLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDomainFilter, setHistoryDomainFilter] = useState('All');

  const [topicDetails, setTopicDetails] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [timeSpent, setTimeSpent] = useState('30');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentConfig = LEVEL_CONFIG[activeLevel];

  useEffect(() => {
    const fetchLogsFromDatabase = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/study-logs');
        if (response.ok) {
          const data = await response.json();
          setStudyLogs(data);
        }
      } catch (err) {
        console.error("Database error. Defaulting to state memory.", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogsFromDatabase();
  }, []);

  const parseLogMeta = (activityStr: string) => {
    const levelMatch = activityStr.match(/\[LEVEL:\s*([^\]]+)\]/);
    const domainMatch = activityStr.match(/\[DOMAIN:\s*([^\]]+)\]/);
    return {
      level: levelMatch ? levelMatch[1] : 'A1.1',
      domain: domainMatch ? domainMatch[1] : 'Listening',
      cleanActivity: activityStr.replace(/\[LEVEL:\s*[^\]]+\]/, '').replace(/\[DOMAIN:\s*[^\]]+\]/, '').trim()
    };
  };

  const handleOpenForm = (domain: 'Listening' | 'Speaking' | 'Reading' | 'Writing') => {
    setActiveFormDomain(domain);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!topicDetails.trim() || !materialsUsed.trim() || !timeSpent) return;

    const parsedMinutes = parseInt(timeSpent, 10);
    const compiledText = `[LEVEL: ${activeLevel}][DOMAIN: ${activeFormDomain}] ${topicDetails.trim()} (Source: ${materialsUsed.trim()})`;

    const currentTimestamp = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const localNewLog: StudyLog = {
      id: `study-${Date.now()}`,
      activity: compiledText,
      minutes_spent: parsedMinutes,
      date: currentTimestamp
    };

    setStudyLogs(prev => [localNewLog, ...prev]);
    if (onAddPractice) onAddPractice(compiledText, parsedMinutes);

    try {
      await fetch('/api/study-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localNewLog)
      });
    } catch (err) {
      console.error("Could not sync tracking instance.", err);
    }

    setTopicDetails('');
    setMaterialsUsed('');
    setModalOpen(false);
  };

  const activeLevelLogs = studyLogs.filter(log => parseLogMeta(log.activity).level === activeLevel);
  const activeLevelMinutes = activeLevelLogs.reduce((acc, log) => acc + log.minutes_spent, 0);
  const activeLevelHours = parseFloat((activeLevelMinutes / 60).toFixed(1));
  const levelProgressPercent = Math.min(100, (activeLevelHours / currentConfig.targetHours) * 100);

  const getDomainMinutes = (dom: string) => activeLevelLogs
    .filter(log => parseLogMeta(log.activity).domain === dom)
    .reduce((acc, log) => acc + log.minutes_spent, 0);

  const listeningMin = getDomainMinutes('Listening');
  const speakingMin = getDomainMinutes('Speaking');
  const readingMin = getDomainMinutes('Reading');
  const writingMin = getDomainMinutes('Writing');

  const todayString = new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const minutesLoggedToday = studyLogs
    .filter(log => log.date.split(',')[0] === todayString.split(',')[0])
    .reduce((acc, log) => acc + log.minutes_spent, 0);
  const dailyTaskProgressPercent = Math.min(100, (minutesLoggedToday / DAILY_TARGET_MINUTES) * 100);

  const filteredHistory = studyLogs.filter(log => {
    const meta = parseLogMeta(log.activity);
    const matchesSearch = log.activity.toLowerCase().includes(historySearch.toLowerCase()) || log.date.includes(historySearch);
    const matchesDomain = historyDomainFilter === 'All' || meta.domain === historyDomainFilter;
    return matchesSearch && matchesDomain;
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 180, 180);
    const cX = 90, cY = 90, rad = 75;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    const quadrantTargetMin = (currentConfig.targetHours * 60) / 4;
    const segments = [
      { min: listeningMin, start: -Math.PI / 2, end: 0 },
      { min: speakingMin, start: 0, end: Math.PI / 2 },
      { min: readingMin, start: Math.PI / 2, end: Math.PI },
      { min: writingMin, start: Math.PI, end: (3 * Math.PI) / 2 }
    ];

    const computedColor = getComputedStyle(document.body).getPropertyValue('--border-glass').trim() || 'rgba(255,255,255,0.05)';

    segments.forEach(seg => {
      ctx.beginPath();
      ctx.arc(cX, cY, rad, seg.start + 0.08, seg.end - 0.08);
      ctx.strokeStyle = computedColor;
      ctx.stroke();

      const progress = Math.min(1, seg.min / quadrantTargetMin);
      if (progress > 0) {
        ctx.beginPath();
        const arcLen = seg.end - seg.start - 0.16;
        ctx.arc(cX, cY, rad, seg.start + 0.08, seg.start + 0.08 + (arcLen * progress));
        ctx.strokeStyle = currentConfig.color;
        ctx.stroke();
      }
    });
  }, [listeningMin, speakingMin, readingMin, writingMin, currentConfig]);

  return (
    // 🏢 CENTRALIZED WRAPPER WITH BREATHING SPACE
    <div className="jobs-container" style={{ padding: '24px 16px', maxWidth: '1240px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <div className="central-dashboard" style={{ gap: '16px' }}>

        {/* 🎛️ CLEANED UP CRAMPED BALANCED HEADER TELEMETRY PANEL */}
        <div
          className="metrics-bar"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.4fr 1.4fr',
            alignItems: 'center',
            gap: '24px',
            boxShadow: `var(--shadow-premium), inset 0 0 30px ${currentConfig.color}03`,
            borderColor: 'var(--border-glass)',
            padding: '12px 20px',
            borderRadius: '12px'
          }}
        >
          {/* Item 1: Dropdown Selector (Cleaned Text) */}
          <div>
            <label className="text-dynamic-secondary" style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.4px', marginBottom: '4px', textTransform: 'uppercase' }}>
              Target Lab Tier
            </label>
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              className="template-select-field"
              style={{ border: `1px solid ${currentConfig.color}35`, margin: 0, width: '100%', fontSize: '12px', padding: '4px 8px', height: '32px', borderRadius: '6px' }}
            >
              {Object.entries(LEVEL_CONFIG).map(([lvlKey, cfg]) => {
                const levelLogsCount = studyLogs.filter(log => parseLogMeta(log.activity).level === lvlKey).length;
                return (
                  <option key={lvlKey} value={lvlKey} style={{ background: 'var(--bg-fallback)', color: 'var(--text-main)', fontSize: '12px' }}>
                    {cfg.label} {levelLogsCount > 0 ? `(${levelLogsCount})` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Item 2: Allocation Telemetry Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 'bold' }}>
              <span className="text-dynamic-primary">Tier Allocation ({activeLevelHours}/{currentConfig.targetHours}h)</span>
              <span style={{ color: currentConfig.color }}>{Math.round(levelProgressPercent)}%</span>
            </div>
            <div className="progress-container" style={{ margin: 0, height: '6px', borderRadius: '4px' }}>
              <div className="progress-bar" style={{ width: `${levelProgressPercent}%`, backgroundColor: currentConfig.color, borderRadius: '4px' }} />
            </div>
          </div>

          {/* Item 3: Daily Routine Quest Analytics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', fontWeight: 'bold' }}>
              <span style={{ color: '#f97316' }}>📅 Daily Quest ({minutesLoggedToday}/{DAILY_TARGET_MINUTES}m)</span>
              <span style={{ color: '#f97316' }}>{Math.round(dailyTaskProgressPercent)}%</span>
            </div>
            <div className="progress-container" style={{ margin: 0, height: '6px', borderRadius: '4px', backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
              <div className="progress-bar" style={{ width: `${dailyTaskProgressPercent}%`, background: '#f97316', borderRadius: '4px' }} />
            </div>
          </div>
        </div>

        {/* WORKSPACE SEPARATOR TABS */}
        <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid var(--border-subtle)', gap: '6px' }}>
          <button className="tab-btn" onClick={() => setActiveTab('grids')} style={{ padding: '8px 16px', fontSize: '12.5px', ...(activeTab === 'grids' ? { color: currentConfig.color, borderBottomColor: currentConfig.color } : {}) }}>Language Matrices</button>
          <button className="tab-btn" onClick={() => setActiveTab('history')} style={{ padding: '8px 16px', fontSize: '12.5px', ...(activeTab === 'history' ? { color: currentConfig.color, borderBottomColor: currentConfig.color } : {}) }}>Database Explorer</button>
        </div>

        {/* MAIN BALANCED DUAL PLATFORM GRID */}
        <div className="workspace-layout" style={{ gap: '16px', alignItems: 'start' }}>

          {/* LEFT INTERACTIVE SEGMENT BOXES */}
          {activeTab === 'grids' ? (
            <div className="fields-grid" style={{ gap: '12px', gridTemplateColumns: 'repeat(2, 1fr)', flex: 1 }}>
              {(['Listening', 'Speaking', 'Reading', 'Writing'] as const).map(dom => {
                const domLogs = activeLevelLogs.filter(log => parseLogMeta(log.activity).domain === dom);
                const domMinutes = domLogs.reduce((acc, log) => acc + log.minutes_spent, 0);
                const icon = dom === 'Listening' ? '🎧' : dom === 'Speaking' ? '🗣️' : dom === 'Reading' ? '📖' : '✍️';

                return (
                  <div
                    key={dom} className="domain-box" onClick={() => handleOpenForm(dom)}
                    style={{ border: `1px solid ${currentConfig.color}20`, padding: '12px', minHeight: '190px', display: 'flex', flexDirection: 'column', borderRadius: '10px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = currentConfig.color;
                      e.currentTarget.style.boxShadow = `0 4px 20px ${currentConfig.color}08`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${currentConfig.color}20`;
                      e.currentTarget.style.boxShadow = `var(--shadow-premium)`;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid var(--border-subtle)`, paddingBottom: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13.5px', fontWeight: '800', color: currentConfig.color }}>{icon} {dom}</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 'bold', background: `${currentConfig.color}12`, color: currentConfig.color, padding: '2px 6px', borderRadius: '4px' }}>{domMinutes}m</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1, maxHeight: '145px' }} onClick={(e) => e.stopPropagation()}>
                      {domLogs.length === 0 ? (
                        <div className="text-dynamic-secondary" style={{ margin: 'auto', textAlign: 'center', padding: '24px 5px', fontSize: '11px', fontStyle: 'italic' }}>
                          Click card to log instance.
                        </div>
                      ) : (
                        domLogs.map(log => {
                          const { cleanActivity } = parseLogMeta(log.activity);
                          return (
                            <div key={log.id} className="log-item" style={{ padding: '6px 8px', borderRadius: '6px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '3px' }}>
                                <span>{log.date.split(',')[0]}</span>
                                <span style={{ color: currentConfig.color, fontWeight: 'bold' }}>{log.minutes_spent}m</span>
                              </div>
                              <div className="text-dynamic-primary" style={{ fontSize: '12px', lineHeight: '1.35', wordBreak: 'break-word' }}>
                                {cleanActivity}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="history-panel" style={{ padding: '16px', borderRadius: '10px', flex: 1 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <h3 className="text-dynamic-primary" style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Archived Data Vault</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="search-input" style={{ width: 'auto', padding: '4px 8px', height: '30px', fontSize: '11.5px', borderRadius: '6px' }} value={historyDomainFilter} onChange={(e) => setHistoryDomainFilter(e.target.value)}>
                    <option value="All">All Skills</option>
                    <option value="Listening">🎧 Listening</option>
                    <option value="Speaking">🗣️ Speaking</option>
                    <option value="Reading">📖 Reading</option>
                    <option value="Writing">✍️ Writing</option>
                  </select>
                  <input type="text" className="search-input" placeholder="Query records..." style={{ padding: '4px 10px', height: '30px', fontSize: '11.5px', width: '150px', borderRadius: '6px' }} value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
                </div>
              </div>

              <div style={{ overflowX: 'auto', maxHeight: '380px' }}>
                {filteredHistory.length === 0 ? (
                  <div className="text-dynamic-secondary" style={{ textAlign: 'center', padding: '40px 10px', fontStyle: 'italic', fontSize: '13px' }}>No matches found inside current query.</div>
                ) : (
                  <table className="history-table" style={{ fontSize: '12px' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px' }}>DATE</th>
                        <th style={{ padding: '8px' }}>TIER</th>
                        <th style={{ padding: '8px' }}>DOMAIN</th>
                        <th style={{ padding: '8px' }}>DESCRIPTION</th>
                        <th style={{ padding: '8px' }}>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(log => {
                        const meta = parseLogMeta(log.activity);
                        return (
                          <tr key={log.id}>
                            <td style={{ padding: '8px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{log.date.split(',')[0]}</td>
                            <td style={{ padding: '8px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', background: `${LEVEL_CONFIG[meta.level]?.bgGlow || 'var(--pill-bg)'}`, color: LEVEL_CONFIG[meta.level]?.color || 'var(--text-main)' }}>{meta.level}</span></td>
                            <td style={{ padding: '8px', fontWeight: '600' }}>{meta.domain}</td>
                            <td style={{ padding: '8px', lineHeight: '1.35', maxWidth: '280px', wordBreak: 'break-word' }}>{meta.cleanActivity}</td>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: currentConfig.color }}>{log.minutes_spent}m</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* RIGHT FIXED RADAR SIDEBAR PANEL */}
          <div className="ring-panel-sticky" style={{ padding: '16px', width: '220px', minWidth: '220px', boxSizing: 'border-box', borderRadius: '12px' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '11.5px', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase', color: currentConfig.color }}>Telemetry Ring</h4>

            <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <canvas ref={canvasRef} width={180} height={180} style={{ position: 'absolute', top: 0, left: 0 }} />

              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ fontSize: '24px', fontWeight: '950', color: currentConfig.color, letterSpacing: '-0.5px' }}>{activeLevel}</div>
                <div className="text-dynamic-secondary" style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold' }}>CEFR Track</div>
              </div>

              <span className="ring-label" onClick={() => handleOpenForm('Listening')} style={{ top: '46px', right: '46px', fontSize: '11.5px', color: listeningMin > 0 ? currentConfig.color : 'var(--text-main)' }}>L</span>
              <span className="ring-label" onClick={() => handleOpenForm('Speaking')} style={{ bottom: '46px', right: '46px', fontSize: '11.5px', color: speakingMin > 0 ? currentConfig.color : 'var(--text-main)' }}>S</span>
              <span className="ring-label" onClick={() => handleOpenForm('Reading')} style={{ bottom: '46px', left: '46px', fontSize: '11.5px', color: readingMin > 0 ? currentConfig.color : 'var(--text-main)' }}>R</span>
              <span className="ring-label" onClick={() => handleOpenForm('Writing')} style={{ top: '46px', left: '46px', fontSize: '11.5px', color: writingMin > 0 ? currentConfig.color : 'var(--text-main)' }}>W</span>
            </div>

            <div style={{ marginTop: '16px', width: '100%', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🎧 Listening:</span><strong className="text-dynamic-primary">{listeningMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🗣️ Speaking:</span><strong className="text-dynamic-primary">{speakingMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📖 Reading:</span><strong className="text-dynamic-primary">{readingMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>✍️ Writing:</span><strong className="text-dynamic-primary">{writingMin}m</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* MODIFICATION DIALOG CONTROLLER (MODAL) */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            className="modal-content"
            style={{
              borderColor: `${currentConfig.color}40`,
              maxWidth: '390px',
              padding: '20px',
              gap: '14px',
              borderRadius: '12px',
              boxShadow: `var(--shadow-premium), 0 0 40px ${currentConfig.color}08`
            }}
          >
            <div>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', color: currentConfig.color, fontWeight: '900', letterSpacing: '0.5px' }}>Matrix Vault Commit</div>
              <h3 className="text-dynamic-primary" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Record {activeFormDomain} Session</h3>
            </div>

            <div style={{ display: 'flex', gap: '12px', background: 'var(--pill-bg)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '12px' }}>
              <div>Level: <strong style={{ color: currentConfig.color }}>{activeLevel}</strong></div>
              <div>Skillset: <strong className="text-dynamic-primary">{activeFormDomain}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="template-field-label text-dynamic-secondary" style={{ fontSize: '11.5px' }}>Study Session Log Details</label>
              <textarea rows={2} placeholder="What syntax arrays or vocabulary targets were managed?" value={topicDetails} onChange={(e) => setTopicDetails(e.target.value)} required className="template-input-field" style={{ resize: 'none', fontSize: '12.5px', padding: '8px', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="template-field-label text-dynamic-secondary" style={{ fontSize: '11.5px' }}>Materials / Core Resources</label>
              <input type="text" placeholder="e.g. Yle Uutiset selkosuomeksi" value={materialsUsed} onChange={(e) => setMaterialsUsed(e.target.value)} required className="template-input-field" style={{ fontSize: '12.5px', padding: '8px', height: '32px', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label className="template-field-label text-dynamic-secondary" style={{ fontSize: '11.5px' }}>Active Duration (Minutes)</label>
              <input type="number" min="1" max="480" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} required className="template-input-field" style={{ fontSize: '12.5px', padding: '8px', height: '32px', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button type="button" onClick={() => setModalOpen(false)} className="btn-outline" style={{ flex: 1, padding: '10px', fontSize: '13px', borderRadius: '6px' }}>Cancel</button>
              <button type="submit" style={{ flex: 1.5, background: currentConfig.color, color: '#fff', border: 'none', borderRadius: '6px', padding: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxShadow: `0 4px 12px ${currentConfig.color}20` }}>Save Entry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinnishPage;