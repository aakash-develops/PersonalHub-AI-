// src/pages/HistoryPage.tsx
import React, { useState } from 'react';
import type { AppDatabaseState } from '../types/schema';

interface HistoryPageProps {
  db: AppDatabaseState;
  onLogCommit: (id: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ db }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'note' | 'job' | 'finnish'>('all');

  const notes = db.modules_data.learning_notes || [];
  const jobs = db.modules_data.job_tracker || [];
  const finnish = db.modules_data.finnish_tracker || [];

  // 1. DATA PARSING (Using simple, clear labels now)
  const unifiedTimeline = [
    ...notes.map(n => ({
      id: n.id,
      date: n.date,
      type: 'note' as const,
      label: 'NEW STUDY NOTE CREATED',
      badge: n.roadmap_id ? `Roadmap: ${n.roadmap_id.toUpperCase()}` : 'General Note',
      desc: n.note,
      icon: '🧠',
      neonGlow: 'rgba(165, 94, 234, 0.12)',
      brandColor: '#a55eea'
    })),
    ...jobs.map(j => ({
      id: j.id,
      date: j.date_applied,
      type: 'job' as const,
      label: 'JOB APPLICATION SUBMITTED',
      badge: `${j.company} — ${j.role}`,
      desc: `Current Application Status: ${j.status}`,
      icon: '💼',
      neonGlow: 'rgba(0, 245, 255, 0.12)',
      brandColor: '#00f5ff'
    })),
    ...finnish.map(f => ({
      id: f.id,
      date: f.date,
      type: 'finnish' as const,
      label: 'FINNISH STUDY TIME LOGGED',
      badge: `${f.minutes_spent} Min Session`,
      desc: `What you practiced: "${f.activity}"`,
      icon: '🇫🇮',
      neonGlow: 'rgba(16, 185, 129, 0.12)',
      brandColor: '#10b981'
    }))
  ].sort((a, b) => {
    const parseDate = (dStr: string) => {
      const [d, m, y] = dStr.split('/').map(Number);
      return new Date(y, m - 1, d).getTime();
    };
    return parseDate(b.date) - parseDate(a.date);
  });

  const filteredTimeline = unifiedTimeline.filter(item =>
    activeFilter === 'all' || item.type === activeFilter
  );

  const totals = {
    all: unifiedTimeline.length,
    note: notes.length,
    job: jobs.length,
    finnish: finnish.length
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '50px 24px', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif', boxSizing: 'border-box' }}>

      {/* GLOBAL VISUAL STYLES */}
      <style>{`
        .cyber-panel { background: rgba(12, 13, 20, 0.6); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 24px; position: relative; overflow: hidden; }
        .cyber-panel::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 2px; background: linear-gradient(90deg, #00f5ff, #a55eea, transparent); opacity: 0.6; }
        .cyber-tab { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); padding: 12px 18px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 13px; font-weight: 600; text-transform: uppercase; display: flex; align-items: center; gap: 8px; }
        .cyber-tab:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .cyber-tab.active { background: rgba(0, 245, 255, 0.08); border-color: #00f5ff; color: #00f5ff; box-shadow: 0 0 15px rgba(0, 245, 255, 0.1); }

        /* FLOW ARROWS LINKING TIMELINE ITEMS */
        .timeline-stream { position: relative; padding-left: 45px; }
        .timeline-stream::before { content: ''; position: absolute; top: 15px; bottom: 15px; left: 15px; width: 2px; background: linear-gradient(to bottom, #00f5ff 0%, #a55eea 50%, #10b981 100%); opacity: 0.15; }
        .arrow-connector { position: absolute; left: -45px; top: 24px; width: 24px; height: 2px; background: linear-gradient(90deg, rgba(255,255,255,0.15), transparent); display: flex; align-items: center; justify-content: flex-end; }
        .arrow-head { width: 0; height: 0; border-top: 4px solid transparent; border-bottom: 4px solid transparent; border-left: 6px solid rgba(255,255,255,0.3); }
      `}</style>

      {/* HEADER PAGE SECTION */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.8px' }}>
          System Archive
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>
          A master history list tracking all your study notes, job updates, and language goals over time.
        </p>
      </div>

      {/* QUICK STATUS OVERVIEW BOXES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="cyber-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>TOTAL ENTRIES RECORDED</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', marginTop: '4px' }}>{totals.all}</div>
        </div>
        <div className="cyber-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#a55eea', fontWeight: 600 }}>LEARNING NOTES</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#a55eea', marginTop: '4px' }}>{totals.note}</div>
        </div>
        <div className="cyber-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#00f5ff', fontWeight: 600 }}>JOBS TRACKED</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#00f5ff', marginTop: '4px' }}>{totals.job}</div>
        </div>
        <div className="cyber-panel" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>FINNISH PRACTICE LOGS</div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>{totals.finnish}</div>
        </div>
      </div>

      {/* FILTER CATEGORY TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '20px' }}>
        <button onClick={() => setActiveFilter('all')} className={`cyber-tab ${activeFilter === 'all' ? 'active' : ''}`}>
          📂 Show All History ({totals.all})
        </button>
        <button onClick={() => setActiveFilter('note')} className={`cyber-tab ${activeFilter === 'note' ? 'active' : ''}`} style={{ borderColor: activeFilter === 'note' ? '#a55eea' : '', color: activeFilter === 'note' ? '#a55eea' : '' }}>
          🧠 Study Notes ({totals.note})
        </button>
        <button onClick={() => setActiveFilter('job')} className={`cyber-tab ${activeFilter === 'job' ? 'active' : ''}`} style={{ borderColor: activeFilter === 'job' ? '#00f5ff' : '', color: activeFilter === 'job' ? '#00f5ff' : '' }}>
          💼 Job Applications ({totals.job})
        </button>
        <button onClick={() => setActiveFilter('finnish')} className={`cyber-tab ${activeFilter === 'finnish' ? 'active' : ''}`} style={{ borderColor: activeFilter === 'finnish' ? '#10b981' : '', color: activeFilter === 'finnish' ? '#10b981' : '' }}>
          🇫🇮 Finnish Sessions ({totals.finnish})
        </button>
      </div>

      {/* MAIN ACTIVITY TIMELINE */}
      {filteredTimeline.length === 0 ? (
        <div className="cyber-panel" style={{ textAlign: 'center', padding: '60px 0', borderStyle: 'dashed' }}>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)' }}>
            📭 Your history log is empty! Start typing notes or logging jobs to see them build here.
          </div>
        </div>
      ) : (
        <div className="timeline-stream">
          {filteredTimeline.map((log) => (
            <div key={log.id} style={{ position: 'relative', marginBottom: '20px' }}>

              {/* LED BULLET TIMELINE NODES */}
              <span style={{
                position: 'absolute',
                left: '-35px',
                top: '18px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#07080c',
                border: `3px solid ${log.brandColor}`,
                boxShadow: `0 0 10px ${log.brandColor}`,
                zIndex: 10
              }} />

              {/* DYNAMIC TIMELINE FLOW ARROW */}
              <div className="arrow-connector">
                <div className="arrow-head" style={{ borderLeftColor: log.brandColor }} />
              </div>

              {/* GLASS ACTIVITY DETAIL CARD */}
              <div
                className="cyber-panel"
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px',
                  background: `linear-gradient(115deg, rgba(12, 13, 20, 0.8) 0%, ${log.neonGlow} 100%)`,
                  borderLeft: `4px solid ${log.brandColor}`, padding: '18px 24px'
                }}
              >
                {/* Info Text Elements */}
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '16px' }}>{log.icon}</span>
                    <span style={{ fontSize: '12px', color: log.brandColor, fontWeight: 700, letterSpacing: '0.5px' }}>
                      {log.label}
                    </span>
                    <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      {log.badge}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13.5px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5' }}>
                    {log.desc}
                  </p>
                </div>

                {/* Calendar Date Badge */}
                <div style={{
                  fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)',
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)',
                  fontFamily: 'monospace'
                }}>
                  Logged: {log.date}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default HistoryPage;