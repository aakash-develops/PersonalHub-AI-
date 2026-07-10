// src/pages/FinnishPage.tsx
import React, { useState, useEffect, useRef } from 'react';

interface StudyLog {
  id: string;
  activity: string;
  minutes_spent: number;
  date: string;
}

interface FinnishPageProps {
  logs?: StudyLog[]; // Made optional since we can fetch directly from db now
  onAddPractice?: (activity: string, minutes: number) => void;
}

const LEVEL_CONFIG: Record<string, { label: string; color: string; bgGlow: string; targetHours: number }> = {
  'A1.1': { label: 'A1.1 (Beginner Fundamental)', color: '#3b82f6', bgGlow: 'rgba(59, 130, 246, 0.15)', targetHours: 60 },
  'A1.2': { label: 'A1.2 (Elementary Breakthrough)', color: '#10b981', bgGlow: 'rgba(16, 185, 129, 0.15)', targetHours: 80 },
  'A2.1': { label: 'A2.1 (Waystage Pre-Intermediate)', color: '#a855f7', bgGlow: 'rgba(168, 85, 247, 0.15)', targetHours: 100 },
  'A2.2': { label: 'A2.2 (Waystage Intermediate)', color: '#f59e0b', bgGlow: 'rgba(245, 158, 11, 0.15)', targetHours: 100 },
  'B1.1': { label: 'B1.1 (Threshold Conversational)', color: '#ec4899', bgGlow: 'rgba(236, 72, 153, 0.15)', targetHours: 140 },
  'B1.2': { label: 'B1.2 (Threshold Professional)', color: '#06b6d4', bgGlow: 'rgba(6, 182, 212, 0.15)', targetHours: 160 },
  'B2':   { label: 'B2 (Vantage Native Tier / YKI)', color: '#f43f5e', bgGlow: 'rgba(244, 63, 94, 0.15)', targetHours: 200 }
};

const DAILY_TARGET_MINUTES = 60;

const FinnishPage: React.FC<FinnishPageProps> = ({ logs = [], onAddPractice }) => {
  const [activeLevel, setActiveLevel] = useState<string>('A1.1');
  const [activeTab, setActiveTab] = useState<'grids' | 'history'>('grids');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeFormDomain, setActiveFormDomain] = useState<'Listening' | 'Speaking' | 'Reading' | 'Writing'>('Listening');

  // Database synchronization states
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>(logs);
  const [isLoading, setIsLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyDomainFilter, setHistoryDomainFilter] = useState('All');

  // Form states
  const [topicDetails, setTopicDetails] = useState('');
  const [materialsUsed, setMaterialsUsed] = useState('');
  const [timeSpent, setTimeSpent] = useState('30');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentConfig = LEVEL_CONFIG[activeLevel];

  // 🔄 FETCH FROM DATABASE ON MOUNT
  useEffect(() => {
    const fetchLogsFromDatabase = async () => {
      setIsLoading(true);
      try {
        // Swap '/api/study-logs' with your real back-end server route
        const response = await fetch('/api/study-logs');
        if (response.ok) {
          const data = await response.json();
          setStudyLogs(data);
        }
      } catch (err) {
        console.error("Database connection failed. Defaulting to local memory state.", err);
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

  // 📤 PUSH NEW SESSION DATA TO DATABASE
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

    // Optimistically update UI
    setStudyLogs(prev => [localNewLog, ...prev]);
    if (onAddPractice) onAddPractice(compiledText, parsedMinutes);

    // Save payload to Database
    try {
      await fetch('/api/study-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localNewLog)
      });
    } catch (err) {
      console.error("Could not sync tracking instance to remote database.", err);
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

  // Filter history records safely across all tiers or current criteria
  const filteredHistory = studyLogs.filter(log => {
    const meta = parseLogMeta(log.activity);
    const matchesSearch = log.activity.toLowerCase().includes(historySearch.toLowerCase()) || log.date.includes(historySearch);
    const matchesDomain = historyDomainFilter === 'All' || meta.domain === historyDomainFilter;
    return matchesSearch && matchesDomain;
  });

  // Render Core Radial Graph
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 240, 240);
    const cX = 120, cY = 120, rad = 100;
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';

    const quadrantTargetMin = (currentConfig.targetHours * 60) / 4;
    const segments = [
      { min: listeningMin, start: -Math.PI / 2, end: 0 },
      { min: speakingMin, start: 0, end: Math.PI / 2 },
      { min: readingMin, start: Math.PI / 2, end: Math.PI },
      { min: writingMin, start: Math.PI, end: (3 * Math.PI) / 2 }
    ];

    segments.forEach(seg => {
      ctx.beginPath();
      ctx.arc(cX, cY, rad, seg.start + 0.08, seg.end - 0.08);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: 'clamp(20px, 4vw, 50px) clamp(16px, 3vw, 32px)', color: '#fff', fontFamily: 'system-ui, sans-serif', boxSizing: 'border-box' }}>

      <style>{`
        .central-dashboard { display: flex; flex-direction: column; gap: 32px; align-items: center; width: 100%; }
        .metrics-bar { display: flex; flex-direction: column; width: 100%; max-width: 1200px; background: rgba(20, 20, 26, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 20px; padding: 24px; box-sizing: border-box; }

        .workspace-layout { display: grid; grid-template-columns: 1fr 320px; gap: 32px; width: 100%; max-width: 1200px; align-items: start; }
        .fields-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; width: 100%; }

        .tab-btn { padding: 8px 16px; background: transparent; border: none; font-size: 14px; font-weight: 700; color: rgba(255,255,255,0.4); cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s; }

        .domain-box { background: rgba(11, 11, 15, 0.5); border-radius: 20px; padding: 24px; min-height: 300px; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; cursor: pointer; transition: all 0.3s ease; }
        .log-item { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); border-radius: 10px; padding: 12px; }

        .history-panel { background: rgba(11, 11, 15, 0.35); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 24px; min-height: 500px; }
        .history-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
        .history-table th { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-weight: 800; }
        .history-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.03); color: #e4e4e7; }

        .progress-container { width: 100%; background: #1a1a24; border-radius: 8px; height: 10px; overflow: hidden; margin-top: 8px; border: 1px solid rgba(255,255,255,0.05); }
        .progress-bar { height: 100%; transition: width 0.4s ease; }

        .ring-label { position: absolute; font-size: 15px; font-weight: 950; opacity: 0.5; cursor: pointer; transition: opacity 0.2s, transform 0.2s; }
        .ring-label:hover { opacity: 1; transform: scale(1.15); }

        .level-dropdown { width: 100%; max-width: 340px; box-sizing: border-box; padding: 12px; background: #14141a; color: #fff; font-weight: 700; border-radius: 10px; font-size: 14px; cursor: pointer; outline: none; margin-bottom: 16px; }
        .search-input { padding: 10px 14px; background: #121218; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; color: #fff; font-size: 13px; width: 100%; max-width: 240px; box-sizing: border-box; }

        @media (max-width: 1100px) {
          .workspace-layout { grid-template-columns: 1fr; }
          .ring-panel-sticky { position: static !important; margin: 0 auto; }
        }
        @media (max-width: 768px) { .fields-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="central-dashboard">

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.8px' }}>Finnish Fluency Laboratory</h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>Real-time telemetry and database tracking module.</p>
        </div>

        {/* 📊 UPPER METRICS BAR CONTAINER WITH DROPDOWN LIST SELECTOR */}
        <div className="metrics-bar" style={{ boxShadow: `0 12px 40px rgba(0,0,0,0.3), inset 0 0 30px ${currentConfig.color}05` }}>
          <div>
            <label style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '800', letterSpacing: '0.5px', marginBottom: '8px', textTransform: 'uppercase' }}>Select Target Lab Tier</label>
            <select
              value={activeLevel}
              onChange={(e) => setActiveLevel(e.target.value)}
              className="level-dropdown"
              style={{ border: `1px solid ${currentConfig.color}40` }}
            >
              {Object.entries(LEVEL_CONFIG).map(([lvlKey, cfg]) => {
                const levelLogsCount = studyLogs.filter(log => parseLogMeta(log.activity).level === lvlKey).length;
                return (
                  <option key={lvlKey} value={lvlKey} style={{ background: '#0d0d12', color: '#fff' }}>
                    {cfg.label} {levelLogsCount > 0 ? `(${levelLogsCount} synchronized)` : ''}
                  </option>
                );
              })}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold' }}>
            <span>Total Tier Allocation Completion ({activeLevelHours} / {currentConfig.targetHours}h)</span>
            <span style={{ color: currentConfig.color }}>{Math.round(levelProgressPercent)}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${levelProgressPercent}%`, backgroundColor: currentConfig.color }} />
          </div>
        </div>

        {/* DAILY QUEST BANNER */}
        <div style={{ width: '100%', maxWidth: '1200px', background: 'rgba(239, 115, 22, 0.04)', border: '1px solid rgba(249, 115, 22, 0.15)', borderRadius: '12px', padding: '14px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#f97316' }}>📅 Daily Routine Quest: {minutesLoggedToday} / {DAILY_TARGET_MINUTES} min</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Combined database updates today</span>
          </div>
          <div className="progress-container" style={{ height: '6px', margin: 0 }}>
            <div className="progress-bar" style={{ width: `${dailyTaskProgressPercent}%`, background: '#f97316' }} />
          </div>
        </div>

        {/* TAB WORKSPACE TOGGLE */}
        <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', borderBottom: '1px solid rgba(255,255,255,0.08)', gap: '8px' }}>
          <button className="tab-btn" onClick={() => setActiveTab('grids')} style={activeTab === 'grids' ? { color: currentConfig.color, borderBottomColor: currentConfig.color } : {}}>Language Matrices</button>
          <button className="tab-btn" onClick={() => setActiveTab('history')} style={activeTab === 'history' ? { color: currentConfig.color, borderBottomColor: currentConfig.color } : {}}>Database Archives & Files</button>
        </div>

        {/* 🖥️ DUAL SPLIT WORKSPACE LAYOUT */}
        <div className="workspace-layout">

          {/* LEFT SIDE: MULTI-TAB SWITCHER */}
          {activeTab === 'grids' ? (
            /* GRID VIEW */
            <div className="fields-grid">
              {(['Listening', 'Speaking', 'Reading', 'Writing'] as const).map(dom => {
                const domLogs = activeLevelLogs.filter(log => parseLogMeta(log.activity).domain === dom);
                const domMinutes = domLogs.reduce((acc, log) => acc + log.minutes_spent, 0);
                const icon = dom === 'Listening' ? '🎧' : dom === 'Speaking' ? '🗣️' : dom === 'Reading' ? '📖' : '✍️';

                return (
                  <div
                    key={dom} className="domain-box" onClick={() => handleOpenForm(dom)}
                    style={{ border: `1px solid ${currentConfig.color}15`, boxShadow: `0 4px 24px rgba(0,0,0,0.15)` }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = currentConfig.color;
                      e.currentTarget.style.boxShadow = `0 8px 32px ${currentConfig.color}15`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = `${currentConfig.color}15`;
                      e.currentTarget.style.boxShadow = `0 4px 24px rgba(0,0,0,0.15)`;
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid rgba(255,255,255,0.05)`, paddingBottom: '12px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: currentConfig.color }}>{icon} {dom}</span>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', background: `${currentConfig.color}15`, color: currentConfig.color, padding: '2px 8px', borderRadius: '4px' }}>{domMinutes} min</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, maxHeight: '250px' }} onClick={(e) => e.stopPropagation()}>
                      {domLogs.length === 0 ? (
                        <div style={{ margin: 'auto', textAlign: 'center', padding: '40px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', fontStyle: 'italic' }}>
                          Click card to record session entry.
                        </div>
                      ) : (
                        domLogs.map(log => {
                          const { cleanActivity } = parseLogMeta(log.activity);
                          return (
                            <div key={log.id} className="log-item">
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>
                                <span>{log.date.split(',')[0]}</span>
                                <span style={{ color: currentConfig.color, fontWeight: 'bold' }}>⏱️ {log.minutes_spent}m</span>
                              </div>
                              <div style={{ fontSize: '13px', color: '#e4e4e7', lineHeight: '1.4', wordBreak: 'break-word' }}>
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
            /* DATABASE ARCHIVE & HISTORY VAULT VIEW */
            <div className="history-panel">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Database File Explorer</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Queried {filteredHistory.length} total historical items</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select className="search-input" style={{ width: 'auto' }} value={historyDomainFilter} onChange={(e) => setHistoryDomainFilter(e.target.value)}>
                    <option value="All">All Skills</option>
                    <option value="Listening">🎧 Listening</option>
                    <option value="Speaking">🗣️ Speaking</option>
                    <option value="Reading">📖 Reading</option>
                    <option value="Writing">✍️ Writing</option>
                  </select>
                  <input type="text" className="search-input" placeholder="Search by description or date..." value={historySearch} onChange={(e) => setHistorySearch(e.target.value)} />
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {filteredHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic', fontSize: '14px' }}>No matches located inside current query parameters.</div>
                ) : (
                  <table className="history-table">
                    <thead>
                      <tr>
                        <th>DATE</th>
                        <th>CEFR TIER</th>
                        <th>DOMAIN</th>
                        <th>ACTIVITY DESCRIPTION & ATTACHED SOURCE FILES</th>
                        <th>DURATION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(log => {
                        const meta = parseLogMeta(log.activity);
                        return (
                          <tr key={log.id}>
                            <td style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{log.date.split(',')[0]}</td>
                            <td><span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', background: `${LEVEL_CONFIG[meta.level]?.bgGlow || 'rgba(255,255,255,0.05)'}`, color: LEVEL_CONFIG[meta.level]?.color || '#fff' }}>{meta.level}</span></td>
                            <td style={{ fontWeight: '600' }}>{meta.domain}</td>
                            <td style={{ lineHeight: '1.5', maxWidth: '380px', wordBreak: 'break-word' }}>{meta.cleanActivity}</td>
                            <td style={{ fontWeight: 'bold', color: currentConfig.color }}>{log.minutes_spent} min</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* RIGHT PANEL: DEDICATED ANALYTICAL RADIAL RING PANEL */}
          <div className="ring-panel-sticky" style={{ position: 'sticky', top: '24px', width: '100%', background: 'rgba(20, 20, 26, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box', boxShadow: `0 12px 40px rgba(0,0,0,0.3)` }}>

            <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', color: currentConfig.color }}>Quadrant Split</h4>

            <div style={{ position: 'relative', width: '240px', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas ref={canvasRef} width={240} height={240} style={{ position: 'absolute', top: 0, left: 0 }} />

              <div style={{ textAlign: 'center', zIndex: 2 }}>
                <div style={{ fontSize: '28px', fontWeight: '950', color: currentConfig.color, letterSpacing: '-0.5px' }}>{activeLevel}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontWeight: 'bold', marginTop: '1px' }}>Skill Track</div>
              </div>

              <span className="ring-label" onClick={() => handleOpenForm('Listening')} style={{ top: '64px', right: '64px', color: listeningMin > 0 ? currentConfig.color : '#fff' }}>L</span>
              <span className="ring-label" onClick={() => handleOpenForm('Speaking')} style={{ bottom: '64px', right: '64px', color: speakingMin > 0 ? currentConfig.color : '#fff' }}>S</span>
              <span className="ring-label" onClick={() => handleOpenForm('Reading')} style={{ bottom: '64px', left: '64px', color: readingMin > 0 ? currentConfig.color : '#fff' }}>R</span>
              <span className="ring-label" onClick={() => handleOpenForm('Writing')} style={{ top: '64px', left: '64px', color: writingMin > 0 ? currentConfig.color : '#fff' }}>W</span>
            </div>

            <div style={{ marginTop: '24px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🎧 Listening Logged:</span><strong style={{ color: '#fff' }}>{listeningMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>🗣️ Speaking Logged:</span><strong style={{ color: '#fff' }}>{speakingMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>📖 Reading Logged:</span><strong style={{ color: '#fff' }}>{readingMin}m</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>✍️ Writing Logged:</span><strong style={{ color: '#fff' }}>{writingMin}m</strong></div>
            </div>
          </div>

        </div>
      </div>

      {/* 📥 FLOATING INTERACTIVE ENTRY MODAL */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(5, 5, 8, 0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' }} onClick={() => setModalOpen(false)}>
          <form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#0d0d12', border: `1px solid ${currentConfig.color}35`, borderRadius: '20px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '18px', boxSizing: 'border-box', width: '100%', maxWidth: '440px', boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 40px ${currentConfig.color}10` }}
          >
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: currentConfig.color, fontWeight: '900', letterSpacing: '0.5px', marginBottom: '2px' }}>Language Matrix Commit</div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Log {activeFormDomain} Session</h3>
            </div>

            <div style={{ display: 'flex', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', fontSize: '12.5px' }}>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Target Level:</span> <strong style={{ color: currentConfig.color }}>{activeLevel}</strong></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Skill Domain:</span> <strong>{activeFormDomain}</strong></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>STUDY DETAILS</label>
              <textarea rows={3} placeholder="What syntactic structures or tasks were run?" value={topicDetails} onChange={(e) => setTopicDetails(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>MATERIALS / RESOURCES USED</label>
              <input type="text" placeholder="e.g. Yle Areena, Suomen Mestari" value={materialsUsed} onChange={(e) => setMaterialsUsed(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>DURATION (MINUTES)</label>
              <input type="number" min="1" max="480" value={timeSpent} onChange={(e) => setTimeSpent(e.target.value)} required style={{ width: '100%', boxSizing: 'border-box', padding: '12px', background: '#14141a', border: '1px solid #2b2b36', color: '#fff', borderRadius: '8px', fontSize: '14px' }} />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button type="button" onClick={() => setModalOpen(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>Cancel</button>
              <button type="submit" style={{ flex: 2, background: currentConfig.color, color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', boxShadow: `0 4px 14px ${currentConfig.color}35` }}>Commit Session</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FinnishPage;